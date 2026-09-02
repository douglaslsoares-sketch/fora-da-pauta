$ErrorActionPreference = "Stop"

$raiz = Resolve-Path (Join-Path $PSScriptRoot "..")

$dirEleicoes = Join-Path $raiz "data\eleicoes"
$dirBruto = Join-Path $dirEleicoes "bruto"
$dirGerado = Join-Path $dirEleicoes "gerado"

$zip = Join-Path $dirBruto "bem_candidato_2026.zip"
$dirExtracao = Join-Path $dirBruto "bem_candidato_2026"
$json = Join-Path $dirGerado "bens-2026.json"

$url = "https://cdn.tse.jus.br/estatistica/sead/odsele/bem_candidato/bem_candidato_2026.zip"

New-Item -ItemType Directory -Force -Path $dirBruto | Out-Null
New-Item -ItemType Directory -Force -Path $dirGerado | Out-Null

Write-Host ""
Write-Host "1. Baixando ZIP oficial do TSE..." -ForegroundColor Yellow

Invoke-WebRequest `
  -Uri $url `
  -OutFile $zip `
  -UseBasicParsing

if (-not (Test-Path -LiteralPath $zip)) {
  throw "ZIP nao foi criado."
}

$tamanho = (Get-Item -LiteralPath $zip).Length

if ($tamanho -lt 1000) {
  throw "ZIP muito pequeno: $tamanho bytes."
}

Write-Host "   ZIP OK: $tamanho bytes" -ForegroundColor Green

Write-Host ""
Write-Host "2. Extraindo..." -ForegroundColor Yellow

if (Test-Path -LiteralPath $dirExtracao) {
  Remove-Item -LiteralPath $dirExtracao -Recurse -Force
}

Expand-Archive `
  -LiteralPath $zip `
  -DestinationPath $dirExtracao `
  -Force

$csvs = @(
  Get-ChildItem `
    -LiteralPath $dirExtracao `
    -Recurse `
    -File `
    -Filter "*.csv"
)

if ($csvs.Count -eq 0) {
  throw "Nenhum CSV encontrado no ZIP."
}

Write-Host "   CSVs encontrados: $($csvs.Count)" -ForegroundColor Green

$csvBrasil = $csvs |
  Where-Object { $_.Name -eq "bem_candidato_2026_BRASIL.csv" } |
  Select-Object -First 1

if ($csvBrasil) {
  $arquivos = @($csvBrasil)
  Write-Host "   Usando arquivo BRASIL." -ForegroundColor Green
}
else {
  $arquivos = @(
    $csvs |
      Where-Object { $_.Name -like "bem_candidato_2026_*.csv" }
  )

  if ($arquivos.Count -eq 0) {
    throw "Nenhum arquivo de bens 2026 reconhecido."
  }

  Write-Host "   Usando arquivos por UF: $($arquivos.Count)" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Importando dados..." -ForegroundColor Yellow

$dados = @(
  foreach ($arquivo in $arquivos) {
    Import-Csv `
      -LiteralPath $arquivo.FullName `
      -Delimiter ";" `
      -Encoding Default
  }
)

if ($dados.Count -eq 0) {
  throw "Nenhum registro importado."
}

Write-Host "   Registros importados: $($dados.Count)" -ForegroundColor Green

$colunas = @($dados[0].PSObject.Properties.Name)

$obrigatorias = @(
  "SQ_CANDIDATO",
  "DS_TIPO_BEM_CANDIDATO",
  "DS_BEM_CANDIDATO",
  "VR_BEM_CANDIDATO"
)

foreach ($campo in $obrigatorias) {
  if ($campo -notin $colunas) {
    throw "Campo obrigatorio ausente: $campo"
  }
}

Write-Host "   Colunas validadas." -ForegroundColor Green

function Converter-Valor {
  param([string]$Valor)

  if ([string]::IsNullOrWhiteSpace($Valor)) {
    return [decimal]0
  }

  $cultura = [System.Globalization.CultureInfo]::GetCultureInfo("pt-BR")
  $numero = [decimal]0

  $ok = [decimal]::TryParse(
    $Valor,
    [System.Globalization.NumberStyles]::Number,
    $cultura,
    [ref]$numero
  )

  if (-not $ok) {
    throw "Valor invalido: $Valor"
  }

  return $numero
}

Write-Host ""
Write-Host "4. Agrupando por candidatura..." -ForegroundColor Yellow

$grupos = $dados |
  Where-Object {
    -not [string]::IsNullOrWhiteSpace([string]$_.SQ_CANDIDATO)
  } |
  Group-Object SQ_CANDIDATO

$resultado = @(
  foreach ($grupo in $grupos) {

    $lista = @(
      foreach ($linha in $grupo.Group) {
        [pscustomobject]@{
          tipoCodigo = [string]$linha.CD_TIPO_BEM_CANDIDATO
          tipo = [string]$linha.DS_TIPO_BEM_CANDIDATO
          descricao = [string]$linha.DS_BEM_CANDIDATO
          valor = Converter-Valor ([string]$linha.VR_BEM_CANDIDATO)
        }
      }
    )

    $total = [decimal]0

    foreach ($bem in $lista) {
      $total += [decimal]$bem.valor
    }

    [pscustomobject]@{
      candidaturaId = [string]$grupo.Name
      ano = 2026
      totalDeclarado = $total
      quantidadeDeBens = $lista.Count
      bens = $lista
      fonte = "Tribunal Superior Eleitoral - Bens de candidatos 2026"
    }
  }
)

Write-Host "   Candidaturas com bens: $($resultado.Count)" -ForegroundColor Green

Write-Host ""
Write-Host "5. Gravando JSON..." -ForegroundColor Yellow

$jsonTexto = $resultado | ConvertTo-Json -Depth 8

$utf8 = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
  $json,
  $jsonTexto,
  $utf8
)

if (-not (Test-Path -LiteralPath $json)) {
  throw "JSON final nao foi criado."
}

$testeJson = Get-Content `
  -LiteralPath $json `
  -Raw `
  -Encoding UTF8 |
  ConvertFrom-Json

if (-not $testeJson) {
  throw "JSON final nao passou na validacao."
}

Write-Host "   JSON OK." -ForegroundColor Green

Write-Host ""
Write-Host "=== TESTE GLEISI ===" -ForegroundColor Cyan

$gleisi = $testeJson |
  Where-Object { $_.candidaturaId -eq "160002547656" } |
  Select-Object -First 1

if ($gleisi) {
  $gleisi |
    Select-Object `
      candidaturaId,
      ano,
      totalDeclarado,
      quantidadeDeBens |
    Format-List

  $gleisi.bens |
    Select-Object `
      -First 10 `
      tipo,
      descricao,
      valor |
    Format-Table -AutoSize
}
else {
  Write-Host "Gleisi nao localizada na base de bens." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== BENS 2026 GERADOS COM SUCESSO ===" -ForegroundColor Green
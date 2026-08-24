$ErrorActionPreference = "Stop"

$raiz = Resolve-Path (Join-Path $PSScriptRoot "..")

$dirEleicoes = Join-Path $raiz "data\eleicoes"
$dirBruto = Join-Path $dirEleicoes "bruto\consulta_cand_2026"
$dirGerado = Join-Path $dirEleicoes "gerado"

$zipFinal = Join-Path $dirEleicoes "bruto\consulta_cand_2026.zip"
$zipTmp = "$zipFinal.tmp"

$dirTmp = Join-Path $dirEleicoes "bruto\consulta_cand_2026_tmp"

$jsonFinal = Join-Path $dirGerado "candidaturas-2026.json"
$jsonTmp = "$jsonFinal.tmp"

$url = "https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip"

function Normalizar-Situacao([string]$situacao) {
  if ([string]::IsNullOrWhiteSpace($situacao) -or $situacao -eq "#NE") {
    return "nao-informada"
  }

  $s = $situacao.ToUpperInvariant()

  if ($s -match "DEFERID") {
    return "deferida"
  }

  if ($s -match "INDEFERID") {
    return "indeferida"
  }

  if ($s -match "REN.NCIA|RENUNCIA") {
    return "renuncia"
  }

  if ($s -match "FALECID") {
    return "falecido"
  }

  if ($s -match "CANCELAD") {
    return "cancelada"
  }

  if ($s -match "SUBSTITU") {
    return "substituida"
  }

  if ($s -match "REGISTRAD") {
    return "registrada"
  }

  return "outra"
}

$cargos = @{
  "PRESIDENTE"          = "presidente"
  "GOVERNADOR"          = "governador"
  "SENADOR"             = "senador"
  "DEPUTADO FEDERAL"    = "deputado-federal"
  "DEPUTADO ESTADUAL"   = "deputado-estadual"
  "DEPUTADO DISTRITAL"  = "deputado-distrital"
}

Write-Host ""
Write-Host "Atualizando base oficial do TSE..." -ForegroundColor Cyan
Write-Host ""

New-Item -ItemType Directory -Force (Split-Path $zipFinal) | Out-Null
New-Item -ItemType Directory -Force $dirGerado | Out-Null

if (Test-Path $zipTmp) {
  Remove-Item $zipTmp -Force
}

if (Test-Path $dirTmp) {
  Remove-Item $dirTmp -Recurse -Force
}

if (Test-Path $jsonTmp) {
  Remove-Item $jsonTmp -Force
}

Write-Host "1. Baixando Candidatos 2026..."

Invoke-WebRequest `
  -Uri $url `
  -OutFile $zipTmp `
  -UseBasicParsing

$tamanhoZip = (Get-Item $zipTmp).Length

if ($tamanhoZip -lt 100000) {
  throw "ZIP do TSE parece inválido: $tamanhoZip bytes."
}

Write-Host "   Download concluído: $tamanhoZip bytes"

Write-Host "2. Extraindo arquivos..."

New-Item -ItemType Directory -Force $dirTmp | Out-Null

Add-Type -AssemblyName System.IO.Compression.FileSystem

[System.IO.Compression.ZipFile]::ExtractToDirectory(
  $zipTmp,
  $dirTmp
)

$csvBrasil = Get-ChildItem $dirTmp -Recurse -File |
  Where-Object {
    $_.Name -eq "consulta_cand_2026_BRASIL.csv"
  } |
  Select-Object -First 1

if (-not $csvBrasil) {
  throw "consulta_cand_2026_BRASIL.csv não encontrado dentro do ZIP."
}

Write-Host "   CSV encontrado: $($csvBrasil.FullName)"

Write-Host "3. Importando CSV oficial..."

$dados = Import-Csv `
  $csvBrasil.FullName `
  -Delimiter ";" `
  -Encoding Default

if (-not $dados -or $dados.Count -lt 1000) {
  throw "CSV do TSE retornou poucos registros: $($dados.Count)"
}

Write-Host "   Linhas carregadas: $($dados.Count)"

Write-Host "4. Filtrando cargos eleitorais..."

$filtrados = @(
  $dados |
    Where-Object {
      $cargos.ContainsKey([string]$_.DS_CARGO)
    }
)

if ($filtrados.Count -lt 1000) {
  throw "Quantidade filtrada inesperadamente baixa: $($filtrados.Count)"
}

Write-Host "   Candidaturas aproveitadas: $($filtrados.Count)"

Write-Host "5. Gerando JSON normalizado..."

$hoje = Get-Date -Format "yyyy-MM-dd"

$candidaturas = foreach ($item in $filtrados) {
  $federacao = [string]$item.NM_FEDERACAO

  if (
    [string]::IsNullOrWhiteSpace($federacao) -or
    $federacao -eq "#NULO" -or
    $federacao -eq "#NE"
  ) {
    $federacao = $null
  }

  $obj = [ordered]@{
    id = [string]$item.SQ_CANDIDATO
    eleicao = 2026
    nomeUrna = [string]$item.NM_URNA_CANDIDATO
    nomeCompleto = [string]$item.NM_CANDIDATO
    numero = [int]$item.NR_CANDIDATO
    cargo = $cargos[[string]$item.DS_CARGO]
    uf = [string]$item.SG_UF
    partido = [string]$item.NM_PARTIDO
    siglaPartido = [string]$item.SG_PARTIDO
    situacao = Normalizar-Situacao ([string]$item.DS_SITUACAO_CANDIDATURA)
    situacaoTse = [string]$item.DS_SITUACAO_CANDIDATURA
    fonteOficial = "https://dadosabertos.tse.jus.br/dataset/candidatos-2026"
    ultimaVerificacao = $hoje
  }

  if ($federacao) {
    $obj["federacao"] = $federacao
  }

  [pscustomobject]$obj
}

$json = $candidaturas |
  ConvertTo-Json -Depth 10

$utf8SemBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
  $jsonTmp,
  $json,
  $utf8SemBom
)

# Validação do JSON recém-gerado
$teste = Get-Content $jsonTmp -Raw | ConvertFrom-Json

if ($teste.Count -ne $candidaturas.Count) {
  throw "Validação do JSON falhou. Esperado $($candidaturas.Count), lido $($teste.Count)."
}

Write-Host "6. Substituindo base vigente..."

if (Test-Path $dirBruto) {
  Remove-Item $dirBruto -Recurse -Force
}

Move-Item $dirTmp $dirBruto

if (Test-Path $zipFinal) {
  Remove-Item $zipFinal -Force
}

Move-Item $zipTmp $zipFinal

Move-Item $jsonTmp $jsonFinal -Force

Write-Host ""
Write-Host "TSE atualizado com sucesso." -ForegroundColor Green
Write-Host "Candidaturas geradas: $($candidaturas.Count)"
Write-Host ""

$candidaturas |
  Group-Object cargo |
  Sort-Object Name |
  Select-Object Name, Count |
  Format-Table -AutoSize

Write-Host "JSON:"
Write-Host $jsonFinal
Write-Host ""

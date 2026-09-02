$ErrorActionPreference = "Stop"
function Obter-JsonUtf8([string]$url) {

  $cliente =
    New-Object System.Net.WebClient

  try {

    $cliente.Headers.Add(
      "Accept",
      "application/json"
    )

    $bytes =
      $cliente.DownloadData($url)

    $utf8Estrito =
      New-Object System.Text.UTF8Encoding(
        $false,
        $true
      )

    $texto =
      $utf8Estrito.GetString($bytes)

    return (
      $texto |
      ConvertFrom-Json
    )
  }
  finally {
    $cliente.Dispose()
  }
}

$raiz =
  Resolve-Path (Join-Path $PSScriptRoot "..")

$arquivoIdentidades =
  Join-Path $raiz "data\eleicoes\gerado\identidades-politicas.json"

$arquivo2022 =
  Join-Path $raiz "data\eleicoes\bruto\consulta_cand_2022\consulta_cand_2022_BRASIL.csv"

$arquivo2026 =
  Join-Path $raiz "data\eleicoes\bruto\consulta_cand_2026\consulta_cand_2026_BRASIL.csv"

$arquivoVotosCamara =
  Join-Path $raiz "data\eleicoes\camara\votacoesVotos-2026.csv"

$saida =
  Join-Path $raiz "data\eleicoes\gerado\vinculos-camara-identidades.json"

foreach ($arquivo in @(
  $arquivoIdentidades,
  $arquivo2022,
  $arquivo2026,
  $arquivoVotosCamara
)) {
  if (-not (Test-Path -LiteralPath $arquivo)) {
    throw "Nao encontrei: $arquivo"
  }
}

Write-Host ""
Write-Host "1. Lendo identidades politicas..." -ForegroundColor Yellow

$identidades =
  Get-Content `
    -LiteralPath $arquivoIdentidades `
    -Raw `
    -Encoding UTF8 |
  ConvertFrom-Json

Write-Host "Identidades: $(@($identidades).Count)"

# ------------------------------------------------------------
# candidaturaId -> pessoaPoliticaId
# ------------------------------------------------------------

$pessoaPorCandidatura = @{}

foreach ($pessoa in @($identidades)) {

  foreach ($cand in @($pessoa.candidaturas)) {

    $cid =
      [string]$cand.candidaturaId

    if (
      $pessoaPorCandidatura.ContainsKey($cid) -and
      $pessoaPorCandidatura[$cid] -ne
        [string]$pessoa.pessoaPoliticaId
    ) {
      throw "Candidatura associada a mais de uma pessoa: $cid"
    }

    $pessoaPorCandidatura[$cid] =
      [string]$pessoa.pessoaPoliticaId
  }
}

Write-Host ""
Write-Host "2. Construindo mapa interno CPF -> pessoa..." -ForegroundColor Yellow

$cpfParaPessoa = @{}
$conflitosCpf = New-Object System.Collections.ArrayList

foreach ($arquivoTse in @($arquivo2022, $arquivo2026)) {

  $dados =
    Import-Csv `
      -LiteralPath $arquivoTse `
      -Delimiter ";" `
      -Encoding Default

  foreach ($linha in $dados) {

    $cpf =
      ([string]$linha.NR_CPF_CANDIDATO).Trim()

    $candidaturaId =
      [string]$linha.SQ_CANDIDATO

    if (
      [string]::IsNullOrWhiteSpace($cpf) -or
      $cpf -eq "#NULO" -or
      $cpf -eq "#NE"
    ) {
      continue
    }

    if (-not $pessoaPorCandidatura.ContainsKey($candidaturaId)) {
      continue
    }

    $pessoaPoliticaId =
      $pessoaPorCandidatura[$candidaturaId]

    if (
      $cpfParaPessoa.ContainsKey($cpf) -and
      $cpfParaPessoa[$cpf] -ne $pessoaPoliticaId
    ) {
      [void]$conflitosCpf.Add(
        [pscustomobject]@{
          candidaturaId = $candidaturaId
          pessoaPoliticaId = $pessoaPoliticaId
        }
      )

      continue
    }

    $cpfParaPessoa[$cpf] =
      $pessoaPoliticaId
  }
}

if ($conflitosCpf.Count -gt 0) {
  throw "Foram encontrados conflitos de identidade pessoal no TSE."
}

Write-Host "Pessoas indexadas internamente: $($cpfParaPessoa.Count)"

Write-Host ""
Write-Host "3. Obtendo deputados unicos da Camara..." -ForegroundColor Yellow

$votos =
  Import-Csv `
    -LiteralPath $arquivoVotosCamara `
    -Delimiter ";" `
    -Encoding UTF8

# O CSV pode variar no nome formal da coluna.
# Descobrimos automaticamente qual coluna contem o ID.
$colunas =
  @($votos[0].PSObject.Properties.Name)

$colunaDeputadoId =
  @(
    "deputado_id",
    "idDeputado",
    "deputadoId"
  ) |
  Where-Object {
    $colunas -contains $_
  } |
  Select-Object -First 1

if (-not $colunaDeputadoId) {
  throw "Nao identifiquei a coluna do deputadoId no CSV da Camara."
}

$deputadosIds =
  @(
    $votos |
    ForEach-Object {
      [string]$_.$colunaDeputadoId
    } |
    Where-Object {
      -not [string]::IsNullOrWhiteSpace($_)
    } |
    Sort-Object -Unique
  )

Write-Host "Deputados unicos: $($deputadosIds.Count)"

Write-Host ""
Write-Host "4. Consultando perfis oficiais da Camara..." -ForegroundColor Yellow

$resultado =
  New-Object System.Collections.ArrayList

$semCpf =
  New-Object System.Collections.ArrayList

$semCorrespondencia =
  New-Object System.Collections.ArrayList

$errosApi =
  New-Object System.Collections.ArrayList

$contador = 0

foreach ($deputadoId in $deputadosIds) {

  $contador++

  if (
    $contador -eq 1 -or
    $contador % 25 -eq 0 -or
    $contador -eq $deputadosIds.Count
  ) {
    Write-Host "   $contador / $($deputadosIds.Count)"
  }

  $url =
    "https://dadosabertos.camara.leg.br/api/v2/deputados/$deputadoId"

  try {
    $resposta =
      Obter-JsonUtf8 $url

    $dadosDeputado =
      $resposta.dados
  }
  catch {
    [void]$errosApi.Add($deputadoId)
    continue
  }

  $cpf =
    ([string]$dadosDeputado.cpf).Trim()

  if (
    [string]::IsNullOrWhiteSpace($cpf) -or
    $cpf -eq "#NULO" -or
    $cpf -eq "#NE"
  ) {
    [void]$semCpf.Add($deputadoId)
    continue
  }

  if (-not $cpfParaPessoa.ContainsKey($cpf)) {
    [void]$semCorrespondencia.Add(
      [pscustomobject]@{
        deputadoIdCamara = $deputadoId
        nomeCivilCamara = [string]$dadosDeputado.nomeCivil
      }
    )

    continue
  }

  $pessoaPoliticaId =
    $cpfParaPessoa[$cpf]

  [void]$resultado.Add(
    [pscustomobject]@{
      pessoaPoliticaId = $pessoaPoliticaId
      deputadoIdCamara = [string]$deputadoId
      nomeCivilCamara = [string]$dadosDeputado.nomeCivil
      fonte = $url
    }
  )
}

# ------------------------------------------------------------
# Validar unicidade
# ------------------------------------------------------------

Write-Host ""
Write-Host "5. Validando unicidade..." -ForegroundColor Yellow

$duplicidadePessoa =
  @(
    $resultado |
    Group-Object pessoaPoliticaId |
    Where-Object {
      $_.Count -gt 1
    }
  )

if ($duplicidadePessoa.Count -gt 0) {

  Write-Host ""
  Write-Host "Pessoas com mais de um deputadoId:" -ForegroundColor Red

  $duplicidadePessoa |
    ForEach-Object {
      Write-Host "$($_.Name): $($_.Count)"
    }

  throw "Encontrada duplicidade pessoaPoliticaId -> deputadoId."
}

$duplicidadeDeputado =
  @(
    $resultado |
    Group-Object deputadoIdCamara |
    Where-Object {
      $_.Count -gt 1
    }
  )

if ($duplicidadeDeputado.Count -gt 0) {
  throw "Encontrado deputadoId associado a mais de uma pessoa."
}

# ------------------------------------------------------------
# SALVAR SEM CPF
# ------------------------------------------------------------

$resultadoOrdenado =
  @(
    $resultado |
    Sort-Object pessoaPoliticaId
  )

$json =
  $resultadoOrdenado |
  ConvertTo-Json -Depth 6

$utf8 =
  New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
  $saida,
  $json,
  $utf8
)

# ------------------------------------------------------------
# GARANTIA CONTRA VAZAMENTO
# ------------------------------------------------------------

$textoGerado =
  Get-Content `
    -LiteralPath $saida `
    -Raw `
    -Encoding UTF8

if (
  $textoGerado -match '"cpf"\s*:' -or
  $textoGerado -match 'NR_CPF_CANDIDATO'
) {
  throw "ERRO: identificador pessoal apareceu no arquivo gerado."
}

# ------------------------------------------------------------
# TESTE DA GLEISI
# ------------------------------------------------------------

$gleisi =
  $resultadoOrdenado |
  Where-Object {
    $_.deputadoIdCamara -eq "107283"
  } |
  Select-Object -First 1

if (-not $gleisi) {
  throw "Teste falhou: deputadoId 107283 nao foi vinculado."
}

$identidadeGleisi =
  $identidades |
  Where-Object {
    $_.pessoaPoliticaId -eq
      $gleisi.pessoaPoliticaId
  } |
  Select-Object -First 1

if (
  -not $identidadeGleisi -or
  $identidadeGleisi.candidaturas.candidaturaId `
    -notcontains "160002547656"
) {
  throw "Teste falhou: vinculo da candidatura 2026 nao confere."
}

Write-Host ""
Write-Host "=== TESTE DE CONTROLE ===" -ForegroundColor Cyan

Write-Host "Pessoa politica:"
Write-Host $gleisi.pessoaPoliticaId

Write-Host "DeputadoId Camara:"
Write-Host $gleisi.deputadoIdCamara

Write-Host "Nome civil:"
Write-Host $gleisi.nomeCivilCamara

Write-Host ""
Write-Host "=== RESUMO ===" -ForegroundColor Cyan
Write-Host "Vinculos seguros gerados: $($resultadoOrdenado.Count)"
Write-Host "Deputados sem CPF utilizavel: $($semCpf.Count)"
Write-Host "Sem correspondencia no TSE 2022/2026: $($semCorrespondencia.Count)"
Write-Host "Erros de API: $($errosApi.Count)"

Write-Host ""
Write-Host "CPF usado apenas durante o processamento." -ForegroundColor Green
Write-Host "Nenhum CPF foi gravado no resultado." -ForegroundColor Green

Write-Host ""
Write-Host "Arquivo:"
Write-Host $saida
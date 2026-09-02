$ErrorActionPreference = "Stop"

$raiz = Resolve-Path (Join-Path $PSScriptRoot "..")

$arquivo2022 =
  Join-Path $raiz "data\eleicoes\bruto\consulta_cand_2022\consulta_cand_2022_BRASIL.csv"

$arquivo2026 =
  Join-Path $raiz "data\eleicoes\bruto\consulta_cand_2026\consulta_cand_2026_BRASIL.csv"

$saida =
  Join-Path $raiz "data\eleicoes\gerado\identidades-politicas.json"

foreach ($arquivo in @($arquivo2022, $arquivo2026)) {
  if (-not (Test-Path -LiteralPath $arquivo)) {
    throw "Nao encontrei: $arquivo"
  }
}

Write-Host ""
Write-Host "Lendo bases do TSE..." -ForegroundColor Cyan

$dados2022 =
  Import-Csv `
    -LiteralPath $arquivo2022 `
    -Delimiter ";" `
    -Encoding Default

$dados2026 =
  Import-Csv `
    -LiteralPath $arquivo2026 `
    -Delimiter ";" `
    -Encoding Default

Write-Host "2022: $($dados2022.Count) registros"
Write-Host "2026: $($dados2026.Count) registros"

# ------------------------------------------------------------
# Recupera IDs internos ja existentes, se houver.
# Isso preserva a estabilidade entre regeneracoes.
# ------------------------------------------------------------

$idsAnterioresPorCandidatura = @{}

if (Test-Path -LiteralPath $saida) {

  $anterior =
    Get-Content `
      -LiteralPath $saida `
      -Raw `
      -Encoding UTF8 |
    ConvertFrom-Json

  foreach ($pessoa in @($anterior)) {
    foreach ($cand in @($pessoa.candidaturas)) {
      $idsAnterioresPorCandidatura[[string]$cand.candidaturaId] =
        [string]$pessoa.pessoaPoliticaId
    }
  }
}

# ------------------------------------------------------------
# Reune somente campos necessarios.
# CPF fica APENAS em memoria nesta etapa.
# ------------------------------------------------------------

$registros = @()

foreach ($linha in @($dados2022) + @($dados2026)) {

  $cpf = ([string]$linha.NR_CPF_CANDIDATO).Trim()

  if (
    [string]::IsNullOrWhiteSpace($cpf) -or
    $cpf -eq "#NULO" -or
    $cpf -eq "#NE"
  ) {
    continue
  }

  $registros += [pscustomobject]@{
    cpf = $cpf
    candidaturaId = [string]$linha.SQ_CANDIDATO
    eleicao = [int]$linha.ANO_ELEICAO
    nomeCompleto = [string]$linha.NM_CANDIDATO
    nomeUrna = [string]$linha.NM_URNA_CANDIDATO
    cargo = [string]$linha.DS_CARGO
    uf = [string]$linha.SG_UF
  }
}

Write-Host ""
Write-Host "Registros com identificador pessoal utilizavel: $($registros.Count)"

# ------------------------------------------------------------
# Agrupa por pessoa
# ------------------------------------------------------------

$grupos =
  $registros |
  Group-Object cpf

$resultado = New-Object System.Collections.ArrayList

foreach ($grupo in $grupos) {

  $candidaturas =
    @(
      $grupo.Group |
      Sort-Object eleicao, candidaturaId |
      ForEach-Object {
        [pscustomobject]@{
          candidaturaId = $_.candidaturaId
          eleicao = $_.eleicao
          nomeCompleto = $_.nomeCompleto
          nomeUrna = $_.nomeUrna
          cargo = $_.cargo
          uf = $_.uf
        }
      }
    )

  # Tenta preservar um pessoaPoliticaId ja existente.
  $idsExistentes =
    @(
      $candidaturas |
      ForEach-Object {
        if (
          $idsAnterioresPorCandidatura.ContainsKey(
            [string]$_.candidaturaId
          )
        ) {
          $idsAnterioresPorCandidatura[
            [string]$_.candidaturaId
          ]
        }
      } |
      Where-Object {
        -not [string]::IsNullOrWhiteSpace($_)
      } |
      Select-Object -Unique
    )

  if ($idsExistentes.Count -gt 1) {
    throw "Conflito: candidaturas da mesma pessoa possuem IDs internos diferentes."
  }

  if ($idsExistentes.Count -eq 1) {
    $pessoaPoliticaId = [string]$idsExistentes[0]
  }
  else {
    $pessoaPoliticaId =
      "politico-" + [guid]::NewGuid().ToString("N")
  }

  [void]$resultado.Add(
    [pscustomobject]@{
      pessoaPoliticaId = $pessoaPoliticaId
      candidaturas = $candidaturas
    }
  )
}

# ------------------------------------------------------------
# Salva SOMENTE dados seguros.
# CPF nao faz parte do resultado.
# ------------------------------------------------------------

$json =
  $resultado |
  ConvertTo-Json -Depth 8

$utf8 =
  New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
  $saida,
  $json,
  $utf8
)

# ------------------------------------------------------------
# Validacoes de seguranca
# ------------------------------------------------------------

$textoGerado =
  Get-Content `
    -LiteralPath $saida `
    -Raw `
    -Encoding UTF8

if ($textoGerado -match "NR_CPF_CANDIDATO") {
  throw "ERRO: referencia a CPF apareceu no arquivo gerado."
}

# CPF da Gleisi usado apenas para validacao em memoria,
# sem imprimir nem salvar o numero.
$gleisi2022 =
  $registros |
  Where-Object {
    $_.candidaturaId -eq "160001614512"
  } |
  Select-Object -First 1

$gleisi2026 =
  $registros |
  Where-Object {
    $_.candidaturaId -eq "160002547656"
  } |
  Select-Object -First 1

if (-not $gleisi2022 -or -not $gleisi2026) {
  throw "Nao encontrei as duas candidaturas de teste."
}

if ($gleisi2022.cpf -ne $gleisi2026.cpf) {
  throw "As duas candidaturas de teste nao pertencem a mesma identidade."
}

$teste =
  $resultado |
  Where-Object {
    $_.candidaturas.candidaturaId -contains "160002547656"
  } |
  Select-Object -First 1

if (-not $teste) {
  throw "Identidade politica da candidatura de teste nao foi gerada."
}

$idsTeste =
  @($teste.candidaturas.candidaturaId)

if (
  $idsTeste -notcontains "160001614512" -or
  $idsTeste -notcontains "160002547656"
) {
  throw "As candidaturas de 2022 e 2026 nao foram unificadas."
}

Write-Host ""
Write-Host "=== TESTE DE IDENTIDADE ===" -ForegroundColor Yellow
Write-Host "Pessoa politica: $($teste.pessoaPoliticaId)"
Write-Host "Candidaturas ligadas:"

$teste.candidaturas |
  Select-Object `
    eleicao,
    candidaturaId,
    nomeUrna,
    cargo,
    uf |
  Format-Table -AutoSize

Write-Host ""
Write-Host "Identidades geradas: $($resultado.Count)"
Write-Host "CPF nao foi gravado no arquivo final." -ForegroundColor Green
Write-Host ""
Write-Host "Arquivo:"
Write-Host $saida
$ErrorActionPreference = "Stop"

$raiz =
  Resolve-Path (Join-Path $PSScriptRoot "..")

$arquivoVinculos =
  Join-Path $raiz "data\eleicoes\gerado\vinculos-camara-identidades.json"

$arquivoHistoricoInstitucional =
  Join-Path $raiz "data\eleicoes\gerado\historico-institucional-politico.json"

$arquivoVotos =
  Join-Path $raiz "data\eleicoes\camara\votacoesVotos-2026.csv"

$saidaVotos =
  Join-Path $raiz "data\eleicoes\gerado\atuacao-votacoes-politicas.json"

$saidaUnificada =
  Join-Path $raiz "data\eleicoes\gerado\historico-politico-unificado.json"

foreach ($arquivo in @(
  $arquivoVinculos,
  $arquivoHistoricoInstitucional,
  $arquivoVotos
)) {
  if (-not (Test-Path -LiteralPath $arquivo)) {
    throw "Nao encontrei: $arquivo"
  }
}

Write-Host ""
Write-Host "1. Lendo vinculos Camara -> pessoa politica..." -ForegroundColor Yellow

$vinculosRaw =
  Get-Content `
    -LiteralPath $arquivoVinculos `
    -Raw `
    -Encoding UTF8 |
  ConvertFrom-Json

$vinculos =
  New-Object System.Collections.ArrayList

foreach ($item in $vinculosRaw) {
  [void]$vinculos.Add($item)
}

Write-Host "Vinculos: $($vinculos.Count)"

if ($vinculos.Count -ne 566) {
  throw "Esperava 566 vinculos. Encontrei $($vinculos.Count)."
}

# ------------------------------------------------------------
# deputadoId -> pessoaPoliticaId
# ------------------------------------------------------------

$pessoaPorDeputado =
  @{}

foreach ($vinculo in $vinculos) {

  $deputadoId =
    [string]$vinculo.deputadoIdCamara

  $pessoaPoliticaId =
    [string]$vinculo.pessoaPoliticaId

  if ($pessoaPorDeputado.ContainsKey($deputadoId)) {
    throw "DeputadoId duplicado nos vinculos: $deputadoId"
  }

  $pessoaPorDeputado[$deputadoId] =
    $pessoaPoliticaId
}

Write-Host ""
Write-Host "2. Lendo votacoes nominais de 2026..." -ForegroundColor Yellow

$votos =
  Import-Csv `
    -LiteralPath $arquivoVotos `
    -Delimiter ";" `
    -Encoding UTF8

Write-Host "Linhas de voto: $($votos.Count)"

if ($votos.Count -eq 0) {
  throw "Arquivo de votos vazio."
}

# ------------------------------------------------------------
# Detectar nomes das colunas
# ------------------------------------------------------------

$colunas =
  @($votos[0].PSObject.Properties.Name)

function Encontrar-Coluna(
  [string[]]$opcoes,
  [string]$descricao
) {

  foreach ($opcao in $opcoes) {
    if ($colunas -contains $opcao) {
      return $opcao
    }
  }

  throw "Nao encontrei a coluna: $descricao"
}

$colunaVotacaoId =
  Encontrar-Coluna `
    @("idVotacao","votacao_id","id") `
    "id da votacao"

$colunaUriVotacao =
  Encontrar-Coluna `
    @("uriVotacao","votacao_uri","uri") `
    "URI da votacao"

$colunaData =
  Encontrar-Coluna `
    @("dataHoraVoto","dataHora","data") `
    "data/hora do voto"

$colunaVoto =
  Encontrar-Coluna `
    @("voto","tipoVoto") `
    "resultado do voto"

$colunaDeputadoId =
  Encontrar-Coluna `
    @("deputado_id","deputadoId","idDeputado") `
    "deputadoId"

$colunaNomeDeputado =
  Encontrar-Coluna `
    @("deputado_nome","nomeDeputado","nome") `
    "nome do deputado"

Write-Host ""
Write-Host "Colunas detectadas:"
Write-Host "  Votacao:    $colunaVotacaoId"
Write-Host "  URI:        $colunaUriVotacao"
Write-Host "  Data:       $colunaData"
Write-Host "  Voto:       $colunaVoto"
Write-Host "  DeputadoId: $colunaDeputadoId"

# ------------------------------------------------------------
# NORMALIZAR VOTOS
# ------------------------------------------------------------

Write-Host ""
Write-Host "3. Associando votos as pessoas politicas..." -ForegroundColor Yellow

$resultadoPorPessoa =
  @{}

$semVinculo =
  New-Object System.Collections.ArrayList

$contador =
  0

foreach ($linha in $votos) {

  $contador++

  $deputadoId =
    [string]$linha.$colunaDeputadoId

  if ([string]::IsNullOrWhiteSpace($deputadoId)) {
    continue
  }

  if (-not $pessoaPorDeputado.ContainsKey($deputadoId)) {

    [void]$semVinculo.Add(
      [pscustomobject]@{
        deputadoId = $deputadoId
        nome = [string]$linha.$colunaNomeDeputado
      }
    )

    continue
  }

  $pessoaPoliticaId =
    $pessoaPorDeputado[$deputadoId]

  if (-not $resultadoPorPessoa.ContainsKey($pessoaPoliticaId)) {

    $resultadoPorPessoa[$pessoaPoliticaId] =
      [pscustomobject]@{
        pessoaPoliticaId = $pessoaPoliticaId
        deputadoIdCamara = $deputadoId
        votacoes = New-Object System.Collections.ArrayList
      }
  }

  $dataHora =
    [string]$linha.$colunaData

  $data =
    $dataHora

  if ($dataHora -match "^(\d{4}-\d{2}-\d{2})") {
    $data =
      $Matches[1]
  }

  $votacaoId =
    [string]$linha.$colunaVotacaoId

  $uri =
    [string]$linha.$colunaUriVotacao

  $resultadoVoto =
    [string]$linha.$colunaVoto

  [void]$resultadoPorPessoa[$pessoaPoliticaId].votacoes.Add(
    [pscustomobject]@{
      tipo = "votacao-nominal"
      votacaoId = $votacaoId
      data = $data
      dataHora = $dataHora
      voto = $resultadoVoto
      titulo = "Votacao nominal"
      descricao = "Registrou voto: $resultadoVoto"
      fonte = [pscustomobject]@{
        titulo = "Camara dos Deputados - Votacao nominal"
        url = $uri
      }
    }
  )
}

Write-Host "Pessoas com votos: $($resultadoPorPessoa.Count)"
Write-Host "Linhas sem vinculo seguro: $($semVinculo.Count)"

if ($semVinculo.Count -gt 0) {

  $idsSemVinculo =
    @(
      $semVinculo |
      Select-Object -ExpandProperty deputadoId |
      Sort-Object -Unique
    )

  Write-Host "Deputados unicos sem vinculo: $($idsSemVinculo.Count)"
}

# ------------------------------------------------------------
# REMOVER DUPLICIDADES E ORDENAR
# ------------------------------------------------------------

Write-Host ""
Write-Host "4. Removendo duplicidades e ordenando..." -ForegroundColor Yellow

$saidaVotosObjetos =
  New-Object System.Collections.ArrayList

foreach ($registro in $resultadoPorPessoa.Values) {

  $votacoesUnicas =
    @(
      $registro.votacoes |
      Group-Object {
        "$($_.votacaoId)|$($_.dataHora)|$($_.voto)"
      } |
      ForEach-Object {
        $_.Group |
        Select-Object -First 1
      } |
      Sort-Object dataHora -Descending
    )

  [void]$saidaVotosObjetos.Add(
    [pscustomobject]@{
      pessoaPoliticaId =
        $registro.pessoaPoliticaId

      deputadoIdCamara =
        $registro.deputadoIdCamara

      votacoes =
        $votacoesUnicas
    }
  )
}

# ------------------------------------------------------------
# SALVAR VOTACOES
# ------------------------------------------------------------

$utf8Bom =
  New-Object System.Text.UTF8Encoding($true)

$jsonVotos =
  $saidaVotosObjetos |
  Sort-Object pessoaPoliticaId |
  ConvertTo-Json -Depth 12

[System.IO.File]::WriteAllText(
  $saidaVotos,
  $jsonVotos,
  $utf8Bom
)

Write-Host ""
Write-Host "5. Criando linha do tempo unificada..." -ForegroundColor Yellow

# ------------------------------------------------------------
# HISTORICO INSTITUCIONAL
# ------------------------------------------------------------

$historicoRaw =
  Get-Content `
    -LiteralPath $arquivoHistoricoInstitucional `
    -Raw `
    -Encoding UTF8 |
  ConvertFrom-Json

$historicoInstitucional =
  New-Object System.Collections.ArrayList

foreach ($item in $historicoRaw) {
  [void]$historicoInstitucional.Add($item)
}

$institucionalPorPessoa =
  @{}

foreach ($item in $historicoInstitucional) {
  $institucionalPorPessoa[
    [string]$item.pessoaPoliticaId
  ] = $item
}

$votosPorPessoa =
  @{}

foreach ($item in $saidaVotosObjetos) {
  $votosPorPessoa[
    [string]$item.pessoaPoliticaId
  ] = $item
}

# ------------------------------------------------------------
# UNIFICAR EVENTOS
# ------------------------------------------------------------

$todasPessoas =
  @(
    @($institucionalPorPessoa.Keys) +
    @($votosPorPessoa.Keys) |
    Sort-Object -Unique
  )

$linhaDoTempoFinal =
  New-Object System.Collections.ArrayList

foreach ($pessoaPoliticaId in $todasPessoas) {

  $eventos =
    New-Object System.Collections.ArrayList

  if (
    $institucionalPorPessoa.ContainsKey(
      $pessoaPoliticaId
    )
  ) {

    foreach (
      $item in
      @(
        $institucionalPorPessoa[
          $pessoaPoliticaId
        ].trajetoria
      )
    ) {

      [void]$eventos.Add(
        [pscustomobject]@{
          tipo = [string]$item.tipo
          dataOrdenacao = [string]$item.periodo
          titulo = [string]$item.titulo
          descricao = [string]$item.descricao
          fonte = $item.fonte
          dados = $item
        }
      )
    }
  }

  if (
    $votosPorPessoa.ContainsKey(
      $pessoaPoliticaId
    )
  ) {

    foreach (
      $voto in
      @(
        $votosPorPessoa[
          $pessoaPoliticaId
        ].votacoes
      )
    ) {

      [void]$eventos.Add(
        [pscustomobject]@{
          tipo = "votacao-nominal"
          dataOrdenacao = [string]$voto.dataHora
          titulo = [string]$voto.titulo
          descricao = [string]$voto.descricao
          fonte = $voto.fonte
          dados = $voto
        }
      )
    }
  }

  $ordenados =
    @(
      $eventos |
      Sort-Object dataOrdenacao -Descending
    )

  [void]$linhaDoTempoFinal.Add(
    [pscustomobject]@{
      pessoaPoliticaId =
        $pessoaPoliticaId

      eventos =
        $ordenados
    }
  )
}

$jsonUnificado =
  $linhaDoTempoFinal |
  Sort-Object pessoaPoliticaId |
  ConvertTo-Json -Depth 14

[System.IO.File]::WriteAllText(
  $saidaUnificada,
  $jsonUnificado,
  $utf8Bom
)

# ------------------------------------------------------------
# GARANTIAS DE PRIVACIDADE
# ------------------------------------------------------------

foreach ($arquivoSeguro in @(
  $saidaVotos,
  $saidaUnificada
)) {

  $texto =
    Get-Content `
      -LiteralPath $arquivoSeguro `
      -Raw `
      -Encoding UTF8

  if (
    $texto -match '"cpf"\s*:' -or
    $texto -match "NR_CPF_CANDIDATO"
  ) {
    throw "CPF apareceu em arquivo gerado: $arquivoSeguro"
  }
}

# ------------------------------------------------------------
# TESTE GLEISI
# ------------------------------------------------------------

$gleisi =
  $linhaDoTempoFinal |
  Where-Object {
    $_.pessoaPoliticaId -eq
      "politico-0e79a887b973490786f70ed44046a434"
  } |
  Select-Object -First 1

if (-not $gleisi) {
  throw "Linha do tempo da Gleisi nao encontrada."
}

Write-Host ""
Write-Host "=== RESUMO FASE 3B ===" -ForegroundColor Cyan

$totalVotos =
  (
    $saidaVotosObjetos |
    ForEach-Object {
      @($_.votacoes).Count
    } |
    Measure-Object -Sum
  ).Sum

Write-Host "Pessoas com votos: $($saidaVotosObjetos.Count)"
Write-Host "Votos nominais unicos: $totalVotos"
Write-Host "Pessoas na linha do tempo: $($linhaDoTempoFinal.Count)"
Write-Host "Linhas sem vinculo: $($semVinculo.Count)"

Write-Host ""
Write-Host "=== TESTE GLEISI — 15 EVENTOS MAIS RECENTES ===" -ForegroundColor Yellow

$gleisi.eventos |
  Select-Object -First 15 |
  Select-Object `
    dataOrdenacao,
    tipo,
    titulo,
    descricao |
  Format-Table -AutoSize -Wrap

Write-Host ""
Write-Host "CPF nao foi gravado." -ForegroundColor Green
Write-Host ""
Write-Host "Arquivos:"
Write-Host $saidaVotos
Write-Host $saidaUnificada
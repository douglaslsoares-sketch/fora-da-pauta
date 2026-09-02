$ErrorActionPreference = "Stop"

[Net.ServicePointManager]::SecurityProtocol =
  [Net.SecurityProtocolType]::Tls12

$raiz =
  Resolve-Path (Join-Path $PSScriptRoot "..")

$dirCamara =
  Join-Path $raiz "data\eleicoes\camara"

$arquivoVotosPessoa =
  Join-Path $raiz "data\eleicoes\gerado\atuacao-votacoes-politicas.json"

$arquivoInstitucional =
  Join-Path $raiz "data\eleicoes\gerado\historico-institucional-politico.json"

$arquivoVotacoes =
  Join-Path $dirCamara "votacoes-2026.csv"

$arquivoObjetos =
  Join-Path $dirCamara "votacoesObjetos-2026.csv"

$saidaContexto =
  Join-Path $raiz "data\eleicoes\gerado\contexto-votacoes-2026.json"

$saidaEnriquecida =
  Join-Path $raiz "data\eleicoes\gerado\atuacao-votacoes-politicas-enriquecida.json"

$saidaUnificada =
  Join-Path $raiz "data\eleicoes\gerado\historico-politico-unificado.json"

$urlVotacoes =
  "https://dadosabertos.camara.leg.br/arquivos/votacoes/csv/votacoes-2026.csv"

$urlObjetos =
  "https://dadosabertos.camara.leg.br/arquivos/votacoesObjetos/csv/votacoesObjetos-2026.csv"

foreach ($arquivo in @(
  $arquivoVotosPessoa,
  $arquivoInstitucional
)) {
  if (-not (Test-Path -LiteralPath $arquivo)) {
    throw "Nao encontrei: $arquivo"
  }
}

New-Item `
  -ItemType Directory `
  -Path $dirCamara `
  -Force |
Out-Null

function Baixar-Arquivo(
  [string]$url,
  [string]$destino
) {

  $temporario =
    "$destino.tmp"

  Write-Host "Baixando:"
  Write-Host $url

  Invoke-WebRequest `
    -Uri $url `
    -OutFile $temporario `
    -UseBasicParsing

  if (
    -not (Test-Path -LiteralPath $temporario) -or
    (Get-Item -LiteralPath $temporario).Length -eq 0
  ) {
    throw "Download vazio: $url"
  }

  Move-Item `
    -LiteralPath $temporario `
    -Destination $destino `
    -Force
}

function Escrever-JsonArrayStreaming(
  [System.Collections.IEnumerable]$itens,
  [string]$destino,
  [int]$depth = 12
) {

  $utf8Bom =
    New-Object System.Text.UTF8Encoding($true)

  $writer =
    New-Object System.IO.StreamWriter(
      $destino,
      $false,
      $utf8Bom
    )

  try {

    $writer.WriteLine("[")

    $primeiro =
      $true

    foreach ($item in $itens) {

      if (-not $primeiro) {
        $writer.WriteLine(",")
      }

      $jsonItem =
        $item |
        ConvertTo-Json `
          -Depth $depth `
          -Compress

      $writer.Write($jsonItem)

      $primeiro =
        $false
    }

    $writer.WriteLine("")
    $writer.WriteLine("]")
  }
  finally {
    $writer.Dispose()
  }
}

function Valor-PrimeiraColuna(
  $objeto,
  [string[]]$nomes
) {

  foreach ($nome in $nomes) {

    $prop =
      $objeto.PSObject.Properties[$nome]

    if (
      $null -ne $prop -and
      -not [string]::IsNullOrWhiteSpace(
        [string]$prop.Value
      )
    ) {
      return [string]$prop.Value
    }
  }

  return ""
}

Write-Host ""
Write-Host "1. Atualizando arquivos oficiais da Camara..." -ForegroundColor Yellow

Baixar-Arquivo `
  $urlVotacoes `
  $arquivoVotacoes

Baixar-Arquivo `
  $urlObjetos `
  $arquivoObjetos

Write-Host ""
Write-Host "2. Lendo metadados das votacoes..." -ForegroundColor Yellow

$votacoes =
  Import-Csv `
    -LiteralPath $arquivoVotacoes `
    -Delimiter ";" `
    -Encoding UTF8

$objetos =
  Import-Csv `
    -LiteralPath $arquivoObjetos `
    -Delimiter ";" `
    -Encoding UTF8

Write-Host "Votacoes: $($votacoes.Count)"
Write-Host "Relacoes com possiveis objetos: $($objetos.Count)"

if ($votacoes.Count -eq 0) {
  throw "Arquivo votacoes-2026.csv vazio."
}

Write-Host ""
Write-Host "Colunas de votacoes:"
$votacoes[0].PSObject.Properties.Name |
  ForEach-Object {
    Write-Host "  $_"
  }

if ($objetos.Count -gt 0) {
  Write-Host ""
  Write-Host "Colunas de objetos:"
  $objetos[0].PSObject.Properties.Name |
    ForEach-Object {
      Write-Host "  $_"
    }
}

# ------------------------------------------------------------
# INDEXAR POSSIVEIS OBJETOS POR VOTACAO
# ------------------------------------------------------------

Write-Host ""
Write-Host "3. Indexando possiveis objetos..." -ForegroundColor Yellow

$objetosPorVotacao =
  @{}

foreach ($item in $objetos) {

  $idVotacao =
    Valor-PrimeiraColuna `
      $item `
      @(
        "idVotacao",
        "votacao_id",
        "id"
      )

  if ([string]::IsNullOrWhiteSpace($idVotacao)) {
    continue
  }

  if (-not $objetosPorVotacao.ContainsKey($idVotacao)) {
    $objetosPorVotacao[$idVotacao] =
      New-Object System.Collections.ArrayList
  }

  $proposicaoId =
    Valor-PrimeiraColuna `
      $item `
      @(
        "proposicao_id",
        "idProposicao",
        "proposicaoId"
      )

  $uri =
    Valor-PrimeiraColuna `
      $item `
      @(
        "proposicao_uri",
        "uriProposicao",
        "proposicaoUri"
      )

  $sigla =
    Valor-PrimeiraColuna `
      $item `
      @(
        "proposicao_siglaTipo",
        "siglaTipo"
      )

  $numero =
    Valor-PrimeiraColuna `
      $item `
      @(
        "proposicao_numero",
        "numero"
      )

  $ano =
    Valor-PrimeiraColuna `
      $item `
      @(
        "proposicao_ano",
        "ano"
      )

  $ementa =
    Valor-PrimeiraColuna `
      $item `
      @(
        "proposicao_ementa",
        "ementa"
      )

  $identificacao =
    @(
      $sigla,
      $numero,
      $(if ($ano) { "/$ano" } else { "" })
    ) -join " "

  $identificacao =
    $identificacao `
      -replace "\s+", " "

  $identificacao =
    $identificacao.Trim()

  [void]$objetosPorVotacao[$idVotacao].Add(
    [pscustomobject]@{
      proposicaoId = $proposicaoId
      identificacao = $identificacao
      ementa = $ementa
      url = $uri
      naturezaDaAssociacao = "possivel-objeto"
    }
  )
}

Write-Host "Votacoes com objeto relacionado: $($objetosPorVotacao.Count)"

# ------------------------------------------------------------
# INDEXAR DADOS BASICOS DAS VOTACOES
# ------------------------------------------------------------

Write-Host ""
Write-Host "4. Construindo contexto das votacoes..." -ForegroundColor Yellow

$contextoPorId =
  @{}

foreach ($item in $votacoes) {

  $id =
    Valor-PrimeiraColuna `
      $item `
      @(
        "id",
        "idVotacao",
        "votacao_id"
      )

  if ([string]::IsNullOrWhiteSpace($id)) {
    continue
  }

  $uri =
    Valor-PrimeiraColuna `
      $item `
      @(
        "uri",
        "uriVotacao",
        "votacao_uri"
      )

  $data =
    Valor-PrimeiraColuna `
      $item `
      @(
        "data",
        "dataHoraRegistro",
        "dataHora"
      )

  $descricao =
    Valor-PrimeiraColuna `
      $item `
      @(
        "descricao",
        "descricaoVotacao"
      )

  $resultado =
    Valor-PrimeiraColuna `
      $item `
      @(
        "descricaoResultado",
        "descResultado",
        "resultado"
      )

  $aprovacao =
    Valor-PrimeiraColuna `
      $item `
      @(
        "aprovacao"
      )

  $objetosDaVotacao =
    @()

  if ($objetosPorVotacao.ContainsKey($id)) {
    $objetosDaVotacao =
      @($objetosPorVotacao[$id])
  }

  $contextoPorId[$id] =
    [pscustomobject]@{
      votacaoId = $id
      data = $data
      descricao = $descricao
      resultado = $resultado
      aprovacao = $aprovacao
      fonte = $uri
      possiveisObjetos = $objetosDaVotacao
    }
}

$contextoFinal =
  @(
    $contextoPorId.Values |
    Sort-Object votacaoId
  )

Escrever-JsonArrayStreaming `
  $contextoFinal `
  $saidaContexto `
  10

# ------------------------------------------------------------
# ENRIQUECER VOTOS DAS PESSOAS
# ------------------------------------------------------------

Write-Host ""
Write-Host "5. Enriquecendo votos das pessoas..." -ForegroundColor Yellow

$votosPessoaRaw =
  Get-Content `
    -LiteralPath $arquivoVotosPessoa `
    -Raw `
    -Encoding UTF8 |
  ConvertFrom-Json

$votosPessoa =
  New-Object System.Collections.ArrayList

foreach ($item in $votosPessoaRaw) {
  [void]$votosPessoa.Add($item)
}

$resultadoPessoas =
  New-Object System.Collections.ArrayList

$totalEnriquecidos =
  0

$totalSemContexto =
  0

foreach ($pessoa in $votosPessoa) {

  $novosVotos =
    New-Object System.Collections.ArrayList

  foreach ($voto in @($pessoa.votacoes)) {

    $id =
      [string]$voto.votacaoId

    if ($contextoPorId.ContainsKey($id)) {

      $ctx =
        $contextoPorId[$id]

      $objetos =
        @($ctx.possiveisObjetos)

      $rotuloObjeto =
        ""

      if ($objetos.Count -eq 1) {
        $rotuloObjeto =
          [string]$objetos[0].identificacao
      }
      elseif ($objetos.Count -gt 1) {
        $rotuloObjeto =
          "$($objetos.Count) possiveis proposicoes relacionadas"
      }

      $titulo =
        "Votacao nominal"

      if (-not [string]::IsNullOrWhiteSpace($rotuloObjeto)) {
        $titulo =
          "Votacao nominal - $rotuloObjeto"
      }

      $partes =
        New-Object System.Collections.ArrayList

      [void]$partes.Add(
        "Voto registrado: $([string]$voto.voto)"
      )

      if (-not [string]::IsNullOrWhiteSpace($ctx.descricao)) {
        [void]$partes.Add(
          [string]$ctx.descricao
        )
      }

      if (-not [string]::IsNullOrWhiteSpace($ctx.resultado)) {
        [void]$partes.Add(
          "Resultado da votacao: $([string]$ctx.resultado)"
        )
      }

      $descricaoFinal =
        ($partes | Select-Object -Unique) -join ". "

      [void]$novosVotos.Add(
        [pscustomobject]@{
          tipo = "votacao-nominal"
          votacaoId = $id
          data = [string]$voto.data
          dataHora = [string]$voto.dataHora
          voto = [string]$voto.voto
          titulo = $titulo
          descricao = $descricaoFinal
          contexto = [pscustomobject]@{
            descricaoVotacao = [string]$ctx.descricao
            resultadoVotacao = [string]$ctx.resultado
            aprovacao = [string]$ctx.aprovacao
            possiveisObjetos = $objetos
            associacaoDeObjetoEhCerta = $false
          }
          fonte = [pscustomobject]@{
            titulo = "Camara dos Deputados - Votacao"
            url = [string]$ctx.fonte
          }
        }
      )

      $totalEnriquecidos++
    }
    else {

      [void]$novosVotos.Add($voto)
      $totalSemContexto++
    }
  }

  [void]$resultadoPessoas.Add(
    [pscustomobject]@{
      pessoaPoliticaId =
        [string]$pessoa.pessoaPoliticaId

      deputadoIdCamara =
        [string]$pessoa.deputadoIdCamara

      votacoes =
        @(
          $novosVotos |
          Sort-Object dataHora -Descending
        )
    }
  )
}

Escrever-JsonArrayStreaming `
  ($resultadoPessoas | Sort-Object pessoaPoliticaId) `
  $saidaEnriquecida `
  14

# ------------------------------------------------------------
# REFAZER LINHA DO TEMPO UNICA
# ------------------------------------------------------------

Write-Host ""
Write-Host "6. Recriando linha do tempo unica..." -ForegroundColor Yellow

$institucionalRaw =
  Get-Content `
    -LiteralPath $arquivoInstitucional `
    -Raw `
    -Encoding UTF8 |
  ConvertFrom-Json

$institucional =
  New-Object System.Collections.ArrayList

foreach ($item in $institucionalRaw) {
  [void]$institucional.Add($item)
}

$institucionalPorPessoa =
  @{}

foreach ($item in $institucional) {
  $institucionalPorPessoa[
    [string]$item.pessoaPoliticaId
  ] = $item
}

$votosPorPessoa =
  @{}

foreach ($item in $resultadoPessoas) {
  $votosPorPessoa[
    [string]$item.pessoaPoliticaId
  ] = $item
}

$todasPessoas =
  @(
    @($institucionalPorPessoa.Keys) +
    @($votosPorPessoa.Keys) |
    Sort-Object -Unique
  )

$linhaDoTempo =
  New-Object System.Collections.ArrayList

foreach ($pessoaId in $todasPessoas) {

  $eventos =
    New-Object System.Collections.ArrayList

  if ($institucionalPorPessoa.ContainsKey($pessoaId)) {

    foreach (
      $evento in
      @($institucionalPorPessoa[$pessoaId].trajetoria)
    ) {

      [void]$eventos.Add(
        [pscustomobject]@{
          tipo = [string]$evento.tipo
          dataOrdenacao = [string]$evento.periodo
          titulo = [string]$evento.titulo
          descricao = [string]$evento.descricao
          fonte = $evento.fonte
          dados = $evento
        }
      )
    }
  }

  if ($votosPorPessoa.ContainsKey($pessoaId)) {

    foreach (
      $voto in
      @($votosPorPessoa[$pessoaId].votacoes)
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

  [void]$linhaDoTempo.Add(
    [pscustomobject]@{
      pessoaPoliticaId = $pessoaId
      eventos = @(
        $eventos |
        Sort-Object dataOrdenacao -Descending
      )
    }
  )
}

Escrever-JsonArrayStreaming `
  ($linhaDoTempo | Sort-Object pessoaPoliticaId) `
  $saidaUnificada `
  16

# ------------------------------------------------------------
# PRIVACIDADE
# ------------------------------------------------------------

foreach ($arquivo in @(
  $saidaContexto,
  $saidaEnriquecida,
  $saidaUnificada
)) {

  $texto =
    Get-Content `
      -LiteralPath $arquivo `
      -Raw `
      -Encoding UTF8

  if (
    $texto -match '"cpf"\s*:' -or
    $texto -match "NR_CPF_CANDIDATO"
  ) {
    throw "CPF apareceu em arquivo gerado."
  }
}

# ------------------------------------------------------------
# TESTES
# ------------------------------------------------------------

Write-Host ""
Write-Host "=== RESUMO FASE 3C ===" -ForegroundColor Cyan

Write-Host "Contextos de votacao: $($contextoFinal.Count)"
Write-Host "Votos enriquecidos: $totalEnriquecidos"
Write-Host "Votos sem contexto: $totalSemContexto"
Write-Host "Pessoas na linha do tempo: $($linhaDoTempo.Count)"

$testePec =
  $contextoPorId["2233802-424"]

Write-Host ""
Write-Host "=== TESTE VOTACAO PEC 221 — 2233802-424 ===" -ForegroundColor Yellow

if ($testePec) {

  Write-Host "Descricao:"
  Write-Host $testePec.descricao

  Write-Host ""
  Write-Host "Resultado:"
  Write-Host $testePec.resultado

  Write-Host ""
  Write-Host "Possiveis objetos:"
  Write-Host @($testePec.possiveisObjetos).Count

  $testePec.possiveisObjetos |
    Select-Object `
      identificacao,
      ementa |
    Format-Table -AutoSize -Wrap
}
else {
  Write-Host "Votacao nao localizada." -ForegroundColor Red
}

$gleisi =
  $linhaDoTempo |
  Where-Object {
    $_.pessoaPoliticaId -eq
      "politico-0e79a887b973490786f70ed44046a434"
  } |
  Select-Object -First 1

if (-not $gleisi) {
  throw "Linha do tempo de teste nao encontrada."
}

Write-Host ""
Write-Host "=== TESTE GLEISI — 10 EVENTOS MAIS RECENTES ===" -ForegroundColor Yellow

$gleisi.eventos |
  Select-Object -First 10 |
  Select-Object `
    dataOrdenacao,
    tipo,
    titulo,
    descricao |
  Format-Table -AutoSize -Wrap

Write-Host ""
Write-Host "Nenhum CPF foi gravado." -ForegroundColor Green

Write-Host ""
Write-Host "Arquivos:"
Write-Host $saidaContexto
Write-Host $saidaEnriquecida
Write-Host $saidaUnificada
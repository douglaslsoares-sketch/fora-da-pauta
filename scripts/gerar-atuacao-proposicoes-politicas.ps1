$ErrorActionPreference = "Stop"

[Net.ServicePointManager]::SecurityProtocol =
  [Net.SecurityProtocolType]::Tls12

$raiz =
  Resolve-Path (Join-Path $PSScriptRoot "..")

$dirCamara =
  Join-Path $raiz "data\eleicoes\camara"

$arquivoVinculos =
  Join-Path $raiz "data\eleicoes\gerado\vinculos-camara-identidades.json"

$arquivoLinhaAtual =
  Join-Path $raiz "data\eleicoes\gerado\historico-politico-unificado.json"

$arquivoProposicoes =
  Join-Path $dirCamara "proposicoes-2026.csv"

$arquivoAutores =
  Join-Path $dirCamara "proposicoesAutores-2026.csv"

$saidaProposicoes =
  Join-Path $raiz "data\eleicoes\gerado\atuacao-proposicoes-politicas.json"

$saidaUnificada =
  Join-Path $raiz "data\eleicoes\gerado\historico-politico-unificado.json"

$urlProposicoes =
  "https://dadosabertos.camara.leg.br/arquivos/proposicoes/csv/proposicoes-2026.csv"

$urlAutores =
  "https://dadosabertos.camara.leg.br/arquivos/proposicoesAutores/csv/proposicoesAutores-2026.csv"

foreach ($arquivo in @(
  $arquivoVinculos,
  $arquivoLinhaAtual
)) {
  if (-not (Test-Path -LiteralPath $arquivo)) {
    throw "Nao encontrei: $arquivo"
  }
}

function Baixar-Arquivo(
  [string]$url,
  [string]$destino
) {

  $tmp =
    "$destino.tmp"

  Write-Host "Baixando:"
  Write-Host $url

  Invoke-WebRequest `
    -Uri $url `
    -OutFile $tmp `
    -UseBasicParsing

  if (
    -not (Test-Path -LiteralPath $tmp) -or
    (Get-Item -LiteralPath $tmp).Length -eq 0
  ) {
    throw "Download vazio: $url"
  }

  Move-Item `
    -LiteralPath $tmp `
    -Destination $destino `
    -Force
}

function Encontrar-Coluna(
  [string[]]$colunas,
  [string[]]$opcoes,
  [string]$descricao,
  [bool]$obrigatoria = $true
) {

  foreach ($opcao in $opcoes) {
    if ($colunas -contains $opcao) {
      return $opcao
    }
  }

  if ($obrigatoria) {
    throw "Nao encontrei coluna: $descricao"
  }

  return $null
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

      $json =
        $item |
        ConvertTo-Json `
          -Depth $depth `
          -Compress

      $writer.Write($json)

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

Write-Host ""
Write-Host "1. Atualizando arquivos oficiais..." -ForegroundColor Yellow

Baixar-Arquivo `
  $urlProposicoes `
  $arquivoProposicoes

Baixar-Arquivo `
  $urlAutores `
  $arquivoAutores

Write-Host ""
Write-Host "2. Lendo vinculos..." -ForegroundColor Yellow

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

$pessoaPorDeputado =
  @{}

foreach ($vinculo in $vinculos) {

  $deputadoId =
    [string]$vinculo.deputadoIdCamara

  $pessoaPoliticaId =
    [string]$vinculo.pessoaPoliticaId

  $pessoaPorDeputado[$deputadoId] =
    $pessoaPoliticaId
}

Write-Host ""
Write-Host "3. Lendo proposicoes..." -ForegroundColor Yellow

$proposicoes =
  Import-Csv `
    -LiteralPath $arquivoProposicoes `
    -Delimiter ";" `
    -Encoding UTF8

$autores =
  Import-Csv `
    -LiteralPath $arquivoAutores `
    -Delimiter ";" `
    -Encoding UTF8

Write-Host "Proposicoes: $($proposicoes.Count)"
Write-Host "Relacoes de autoria: $($autores.Count)"

if ($proposicoes.Count -eq 0) {
  throw "Arquivo de proposicoes vazio."
}

if ($autores.Count -eq 0) {
  throw "Arquivo de autores vazio."
}

$colunasProp =
  @($proposicoes[0].PSObject.Properties.Name)

$colunasAutores =
  @($autores[0].PSObject.Properties.Name)

Write-Host ""
Write-Host "Colunas de proposicoes:"
$colunasProp |
  ForEach-Object {
    Write-Host "  $_"
  }

Write-Host ""
Write-Host "Colunas de autores:"
$colunasAutores |
  ForEach-Object {
    Write-Host "  $_"
  }

# ------------------------------------------------------------
# DETECTAR COLUNAS — PROPOSICOES
# ------------------------------------------------------------

$colPropId =
  Encontrar-Coluna `
    $colunasProp `
    @(
      "id",
      "idProposicao",
      "proposicao_id"
    ) `
    "id da proposicao"

$colPropUri =
  Encontrar-Coluna `
    $colunasProp `
    @(
      "uri",
      "uriProposicao",
      "proposicao_uri"
    ) `
    "uri da proposicao"

$colPropSigla =
  Encontrar-Coluna `
    $colunasProp `
    @(
      "siglaTipo",
      "siglaTipoProposicao",
      "proposicao_siglaTipo"
    ) `
    "sigla do tipo"

$colPropNumero =
  Encontrar-Coluna `
    $colunasProp `
    @(
      "numero",
      "numeroProposicao",
      "proposicao_numero"
    ) `
    "numero"

$colPropAno =
  Encontrar-Coluna `
    $colunasProp `
    @(
      "ano",
      "anoProposicao",
      "proposicao_ano"
    ) `
    "ano"

$colPropEmenta =
  Encontrar-Coluna `
    $colunasProp `
    @(
      "ementa",
      "descricao"
    ) `
    "ementa"

$colPropData =
  Encontrar-Coluna `
    $colunasProp `
    @(
      "dataApresentacao",
      "data",
      "dataHora"
    ) `
    "data de apresentacao"

# ------------------------------------------------------------
# DETECTAR COLUNAS — AUTORES
# ------------------------------------------------------------

$colAutorPropId =
  Encontrar-Coluna `
    $colunasAutores `
    @(
      "idProposicao",
      "proposicao_id",
      "id"
    ) `
    "id da proposicao no arquivo de autores"

$colAutorDeputadoId =
  Encontrar-Coluna `
    $colunasAutores `
    @(
      "idDeputadoAutor",
      "deputado_id",
      "deputadoId",
      "idDeputado"
    ) `
    "id do deputado autor"

$colAutorNome =
  Encontrar-Coluna `
    $colunasAutores `
    @(
      "nomeAutor",
      "nome",
      "deputado_nome"
    ) `
    "nome do autor" `
    $false

$colAutorOrdem =
  Encontrar-Coluna `
    $colunasAutores `
    @(
      "ordemAssinatura",
      "ordemAutoria",
      "ordem"
    ) `
    "ordem de autoria" `
    $false

$colAutorProponente =
  Encontrar-Coluna `
    $colunasAutores `
    @(
      "proponente",
      "isProponente",
      "principal"
    ) `
    "indicador de proponente" `
    $false

Write-Host ""
Write-Host "Colunas detectadas:"
Write-Host "  Proposicao ID: $colPropId"
Write-Host "  Autor deputadoId: $colAutorDeputadoId"
Write-Host "  Ordem: $colAutorOrdem"
Write-Host "  Proponente: $colAutorProponente"

# ------------------------------------------------------------
# INDEXAR PROPOSICOES
# ------------------------------------------------------------

Write-Host ""
Write-Host "4. Indexando proposicoes..." -ForegroundColor Yellow

$proposicaoPorId =
  @{}

foreach ($prop in $proposicoes) {

  $id =
    [string]$prop.$colPropId

  if ([string]::IsNullOrWhiteSpace($id)) {
    continue
  }

  $sigla =
    [string]$prop.$colPropSigla

  $numero =
    [string]$prop.$colPropNumero

  $ano =
    [string]$prop.$colPropAno

  $identificacao =
    "$sigla $numero/$ano".Trim()

  $proposicaoPorId[$id] =
    [pscustomobject]@{
      proposicaoId = $id
      identificacao = $identificacao
      siglaTipo = $sigla
      numero = $numero
      ano = $ano
      ementa = [string]$prop.$colPropEmenta
      dataApresentacao = [string]$prop.$colPropData
      url = [string]$prop.$colPropUri
    }
}

Write-Host "Proposicoes indexadas: $($proposicaoPorId.Count)"

# ------------------------------------------------------------
# ASSOCIAR AUTORES AS PESSOAS POLITICAS
# ------------------------------------------------------------

Write-Host ""
Write-Host "5. Associando autoria as pessoas politicas..." -ForegroundColor Yellow

$atuacaoPorPessoa =
  @{}

$semVinculo =
  New-Object System.Collections.ArrayList

$semProposicao =
  New-Object System.Collections.ArrayList

foreach ($autor in $autores) {

  $deputadoId =
    [string]$autor.$colAutorDeputadoId

  if ([string]::IsNullOrWhiteSpace($deputadoId)) {
    continue
  }

  if (-not $pessoaPorDeputado.ContainsKey($deputadoId)) {

    [void]$semVinculo.Add(
      [pscustomobject]@{
        deputadoId = $deputadoId
        nome = $(if ($colAutorNome) {
          [string]$autor.$colAutorNome
        } else {
          ""
        })
      }
    )

    continue
  }

  $proposicaoId =
    [string]$autor.$colAutorPropId

  if (-not $proposicaoPorId.ContainsKey($proposicaoId)) {

    [void]$semProposicao.Add(
      [pscustomobject]@{
        deputadoId = $deputadoId
        proposicaoId = $proposicaoId
      }
    )

    continue
  }

  $pessoaPoliticaId =
    $pessoaPorDeputado[$deputadoId]

  if (-not $atuacaoPorPessoa.ContainsKey($pessoaPoliticaId)) {

    $atuacaoPorPessoa[$pessoaPoliticaId] =
      [pscustomobject]@{
        pessoaPoliticaId = $pessoaPoliticaId
        deputadoIdCamara = $deputadoId
        proposicoes = New-Object System.Collections.ArrayList
      }
  }

  $prop =
    $proposicaoPorId[$proposicaoId]

  $ordem =
    ""

  if ($colAutorOrdem) {
    $ordem =
      [string]$autor.$colAutorOrdem
  }

  $proponente =
    ""

  if ($colAutorProponente) {
    $proponente =
      [string]$autor.$colAutorProponente
  }

  $tipoAutoria =
    "autoria"

  if (
    $ordem -and
    $ordem -ne "1"
  ) {
    $tipoAutoria =
      "coautoria"
  }

  if (
    $proponente -match "^(S|SIM|TRUE|1)$"
  ) {
    $tipoAutoria =
      "autoria"
  }

  $titulo =
    "Autoria de $($prop.identificacao)"

  if ($tipoAutoria -eq "coautoria") {
    $titulo =
      "Coautoria de $($prop.identificacao)"
  }

  [void]$atuacaoPorPessoa[$pessoaPoliticaId].proposicoes.Add(
    [pscustomobject]@{
      tipo = "proposicao"
      subtipo = $tipoAutoria
      proposicaoId = $prop.proposicaoId
      identificacao = $prop.identificacao
      data = $prop.dataApresentacao
      titulo = $titulo
      descricao = $prop.ementa
      ordemAutoria = $ordem
      fonte = [pscustomobject]@{
        titulo = "Camara dos Deputados - Proposicao"
        url = $prop.url
      }
    }
  )
}

Write-Host "Pessoas com proposicoes: $($atuacaoPorPessoa.Count)"
Write-Host "Relacoes sem vinculo: $($semVinculo.Count)"
Write-Host "Relacoes sem proposicao localizada: $($semProposicao.Count)"

# ------------------------------------------------------------
# DEDUPLICAR E SALVAR
# ------------------------------------------------------------

Write-Host ""
Write-Host "6. Deduplicando proposicoes..." -ForegroundColor Yellow

$resultadoFinal =
  New-Object System.Collections.ArrayList

foreach ($registro in $atuacaoPorPessoa.Values) {

  $unicas =
    @(
      $registro.proposicoes |
      Group-Object {
        "$($_.proposicaoId)|$($_.subtipo)"
      } |
      ForEach-Object {
        $_.Group |
        Select-Object -First 1
      } |
      Sort-Object data -Descending
    )

  [void]$resultadoFinal.Add(
    [pscustomobject]@{
      pessoaPoliticaId =
        $registro.pessoaPoliticaId

      deputadoIdCamara =
        $registro.deputadoIdCamara

      proposicoes =
        $unicas
    }
  )
}

Escrever-JsonArrayStreaming `
  ($resultadoFinal | Sort-Object pessoaPoliticaId) `
  $saidaProposicoes `
  12

# ------------------------------------------------------------
# CARREGAR LINHA DO TEMPO EXISTENTE
# ------------------------------------------------------------

Write-Host ""
Write-Host "7. Incorporando a linha do tempo unica..." -ForegroundColor Yellow

$linhaRaw =
  Get-Content `
    -LiteralPath $arquivoLinhaAtual `
    -Raw `
    -Encoding UTF8 |
  ConvertFrom-Json

$linhaPorPessoa =
  @{}

foreach ($item in $linhaRaw) {

  $eventos =
    New-Object System.Collections.ArrayList

  foreach ($evento in @($item.eventos)) {
    [void]$eventos.Add($evento)
  }

  $linhaPorPessoa[[string]$item.pessoaPoliticaId] =
    [pscustomobject]@{
      pessoaPoliticaId =
        [string]$item.pessoaPoliticaId

      eventos =
        $eventos
    }
}

# ------------------------------------------------------------
# ADICIONAR PROPOSICOES
# ------------------------------------------------------------

foreach ($registro in $resultadoFinal) {

  $pessoaId =
    [string]$registro.pessoaPoliticaId

  if (-not $linhaPorPessoa.ContainsKey($pessoaId)) {

    $linhaPorPessoa[$pessoaId] =
      [pscustomobject]@{
        pessoaPoliticaId = $pessoaId
        eventos = New-Object System.Collections.ArrayList
      }
  }

  foreach ($prop in @($registro.proposicoes)) {

    [void]$linhaPorPessoa[$pessoaId].eventos.Add(
      [pscustomobject]@{
        tipo = "proposicao"
        dataOrdenacao = [string]$prop.data
        titulo = [string]$prop.titulo
        descricao = [string]$prop.descricao
        fonte = $prop.fonte
        dados = $prop
      }
    )
  }
}

$linhaFinal =
  New-Object System.Collections.ArrayList

foreach ($item in $linhaPorPessoa.Values) {

  $eventosOrdenados =
    @(
      $item.eventos |
      Sort-Object dataOrdenacao -Descending
    )

  [void]$linhaFinal.Add(
    [pscustomobject]@{
      pessoaPoliticaId =
        $item.pessoaPoliticaId

      eventos =
        $eventosOrdenados
    }
  )
}

Escrever-JsonArrayStreaming `
  ($linhaFinal | Sort-Object pessoaPoliticaId) `
  $saidaUnificada `
  16

# ------------------------------------------------------------
# PRIVACIDADE
# ------------------------------------------------------------

foreach ($arquivo in @(
  $saidaProposicoes,
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
# RESUMO
# ------------------------------------------------------------

$totalProposicoes =
  (
    $resultadoFinal |
    ForEach-Object {
      @($_.proposicoes).Count
    } |
    Measure-Object -Sum
  ).Sum

Write-Host ""
Write-Host "=== RESUMO FASE 3D ===" -ForegroundColor Cyan
Write-Host "Pessoas com proposicoes: $($resultadoFinal.Count)"
Write-Host "Proposicoes/autorias unicas: $totalProposicoes"
Write-Host "Relacoes sem vinculo: $($semVinculo.Count)"
Write-Host "Relacoes sem proposicao: $($semProposicao.Count)"
Write-Host "Pessoas na linha do tempo: $($linhaFinal.Count)"

# ------------------------------------------------------------
# TESTE GLEISI
# ------------------------------------------------------------

$gleisi =
  $resultadoFinal |
  Where-Object {
    $_.deputadoIdCamara -eq "107283"
  } |
  Select-Object -First 1

Write-Host ""
Write-Host "=== TESTE GLEISI — PROPOSICOES MAIS RECENTES ===" -ForegroundColor Yellow

if ($gleisi) {

  Write-Host "Registros: $(@($gleisi.proposicoes).Count)"
  Write-Host ""

  $gleisi.proposicoes |
    Select-Object -First 15 |
    Select-Object `
      data,
      subtipo,
      identificacao,
      descricao |
    Format-Table -AutoSize -Wrap
}
else {
  Write-Host "Nenhuma proposicao localizada para o deputadoId 107283."
}

Write-Host ""
Write-Host "Nenhum CPF foi gravado." -ForegroundColor Green

Write-Host ""
Write-Host "Arquivos:"
Write-Host $saidaProposicoes
Write-Host $saidaUnificada
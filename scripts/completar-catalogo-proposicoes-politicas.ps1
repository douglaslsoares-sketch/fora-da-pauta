$ErrorActionPreference = "Stop"

[Net.ServicePointManager]::SecurityProtocol =
  [Net.SecurityProtocolType]::Tls12

$raiz =
  Resolve-Path (Join-Path $PSScriptRoot "..")

$arquivoProposicoes =
  Join-Path $raiz "data\eleicoes\camara\proposicoes-2026.csv"

$arquivoAutores =
  Join-Path $raiz "data\eleicoes\camara\proposicoesAutores-2026.csv"

$arquivoVinculos =
  Join-Path $raiz "data\eleicoes\gerado\vinculos-camara-identidades.json"

$arquivoLinhaAtual =
  Join-Path $raiz "data\eleicoes\gerado\historico-politico-unificado.json"

$saidaComplementar =
  Join-Path $raiz "data\eleicoes\gerado\proposicoes-complementares-api.json"

$saidaAtuacao =
  Join-Path $raiz "data\eleicoes\gerado\atuacao-proposicoes-politicas-completa.json"

$saidaLinha =
  Join-Path $raiz "data\eleicoes\gerado\historico-politico-unificado.json"

foreach ($arquivo in @(
  $arquivoProposicoes,
  $arquivoAutores,
  $arquivoVinculos,
  $arquivoLinhaAtual
)) {
  if (-not (Test-Path -LiteralPath $arquivo)) {
    throw "Nao encontrei: $arquivo"
  }
}

function Obter-ProposicaoUtf8([string]$url) {

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

function Corrigir-Texto([string]$texto) {

  if ([string]::IsNullOrWhiteSpace($texto)) {
    return $texto
  }

  if ($texto -notmatch "Ã|Â|â") {
    return $texto
  }

  try {
    $bytes =
      [System.Text.Encoding]::GetEncoding(1252).GetBytes($texto)

    return [System.Text.Encoding]::UTF8.GetString($bytes)
  }
  catch {
    return $texto
  }
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

    $primeiro = $true

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

      $primeiro = $false
    }

    $writer.WriteLine("")
    $writer.WriteLine("]")
  }
  finally {
    $writer.Dispose()
  }
}

function Encontrar-Coluna(
  [string[]]$colunas,
  [string[]]$opcoes,
  [string]$descricao
) {

  foreach ($opcao in $opcoes) {
    if ($colunas -contains $opcao) {
      return $opcao
    }
  }

  throw "Nao encontrei coluna: $descricao"
}

Write-Host ""
Write-Host "1. Lendo bases..." -ForegroundColor Yellow

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

Write-Host "Proposicoes CSV: $($proposicoes.Count)"
Write-Host "Relacoes de autoria: $($autores.Count)"
Write-Host "Vinculos politicos: $($vinculos.Count)"

$colProp =
  @($proposicoes[0].PSObject.Properties.Name)

$colAutor =
  @($autores[0].PSObject.Properties.Name)

$colPropId =
  Encontrar-Coluna `
    $colProp `
    @("id","idProposicao","proposicao_id") `
    "id da proposicao"

$colPropUri =
  Encontrar-Coluna `
    $colProp `
    @("uri","uriProposicao","proposicao_uri") `
    "uri"

$colPropSigla =
  Encontrar-Coluna `
    $colProp `
    @("siglaTipo","proposicao_siglaTipo") `
    "sigla"

$colPropNumero =
  Encontrar-Coluna `
    $colProp `
    @("numero","proposicao_numero") `
    "numero"

$colPropAno =
  Encontrar-Coluna `
    $colProp `
    @("ano","proposicao_ano") `
    "ano"

$colPropEmenta =
  Encontrar-Coluna `
    $colProp `
    @("ementa","descricao") `
    "ementa"

$colPropData =
  Encontrar-Coluna `
    $colProp `
    @("dataApresentacao","data","dataHora") `
    "data"

$colAutorPropId =
  Encontrar-Coluna `
    $colAutor `
    @("idProposicao","proposicao_id","id") `
    "id proposicao em autores"

$colAutorDeputadoId =
  Encontrar-Coluna `
    $colAutor `
    @("idDeputadoAutor","deputado_id","deputadoId","idDeputado") `
    "deputado autor"

Write-Host ""
Write-Host "2. Montando indices..." -ForegroundColor Yellow

$catalogo =
  @{}

foreach ($prop in $proposicoes) {

  $id =
    [string]$prop.$colPropId

  if ([string]::IsNullOrWhiteSpace($id)) {
    continue
  }

  $catalogo[$id] =
    [pscustomobject]@{
      id = $id
      siglaTipo = [string]$prop.$colPropSigla
      numero = [string]$prop.$colPropNumero
      ano = [string]$prop.$colPropAno
      dataApresentacao = [string]$prop.$colPropData
      descricaoTipo = ""
      ementa = [string]$prop.$colPropEmenta
      uri = [string]$prop.$colPropUri
      origem = "csv-2026"
    }
}

$pessoaPorDeputado =
  @{}

foreach ($vinculo in $vinculos) {
  $pessoaPorDeputado[
    [string]$vinculo.deputadoIdCamara
  ] =
    [string]$vinculo.pessoaPoliticaId
}

Write-Host "Catalogo inicial: $($catalogo.Count)"

Write-Host ""
Write-Host "3. Identificando IDs ausentes..." -ForegroundColor Yellow

$idsAusentes =
  New-Object System.Collections.ArrayList

foreach ($autor in $autores) {

  $deputadoId =
    [string]$autor.$colAutorDeputadoId

  if (-not $pessoaPorDeputado.ContainsKey($deputadoId)) {
    continue
  }

  $proposicaoId =
    [string]$autor.$colAutorPropId

  if (
    -not [string]::IsNullOrWhiteSpace($proposicaoId) -and
    -not $catalogo.ContainsKey($proposicaoId)
  ) {
    [void]$idsAusentes.Add($proposicaoId)
  }
}

$idsAusentes =
  @(
    $idsAusentes |
    Sort-Object -Unique
  )

Write-Host "IDs ausentes unicos: $($idsAusentes.Count)"

# ------------------------------------------------------------
# RECUPERAR CHECKPOINT
# ------------------------------------------------------------

$complementares =
  @{}

if (Test-Path -LiteralPath $saidaComplementar) {

  Write-Host ""
  Write-Host "4. Recuperando checkpoint anterior..." -ForegroundColor Yellow

  try {

    $anterioresRaw =
      Get-Content `
        -LiteralPath $saidaComplementar `
        -Raw `
        -Encoding UTF8 |
      ConvertFrom-Json

    foreach ($item in $anterioresRaw) {
      $complementares[[string]$item.id] = $item
    }

    Write-Host "Ja recuperados: $($complementares.Count)"
  }
  catch {
    Write-Host "Checkpoint anterior invalido. Ignorando." -ForegroundColor DarkYellow
    $complementares = @{}
  }
}
else {
  Write-Host ""
  Write-Host "4. Nenhum checkpoint anterior."
}

function Salvar-Complementares {

  Escrever-JsonArrayStreaming `
    ($complementares.Values | Sort-Object id) `
    $saidaComplementar `
    8
}

Write-Host ""
Write-Host "5. Consultando proposicoes ausentes na API..." -ForegroundColor Yellow

$contador = 0
$novas = 0
$erros = New-Object System.Collections.ArrayList

foreach ($id in $idsAusentes) {

  $contador++

  if ($complementares.ContainsKey($id)) {
    continue
  }

  if (
    $contador -eq 1 -or
    $contador % 100 -eq 0 -or
    $contador -eq $idsAusentes.Count
  ) {
    Write-Host "   $contador / $($idsAusentes.Count)"
  }

  $url =
    "https://dadosabertos.camara.leg.br/api/v2/proposicoes/$id"

  $sucesso = $false

  for ($tentativa = 1; $tentativa -le 3; $tentativa++) {

    try {

      $r =
        Obter-ProposicaoUtf8 $url

      $d =
        $r.dados

      $complementares[$id] =
        [pscustomobject]@{
          id = [string]$d.id
          siglaTipo = [string]$d.siglaTipo
          numero = [string]$d.numero
          ano = [string]$d.ano
          dataApresentacao = [string]$d.dataApresentacao
          descricaoTipo = [string]$d.descricaoTipo
          ementa = [string]$d.ementa
          uri = [string]$d.uri
          origem = "api"
        }

      $sucesso = $true
      $novas++
      break
    }
    catch {

      if ($tentativa -eq 3) {

        [void]$erros.Add(
          [pscustomobject]@{
            id = $id
            erro = $_.Exception.Message
          }
        )
      }
      else {
        Start-Sleep -Seconds 1
      }
    }
  }

  if ($novas -gt 0 -and $novas % 100 -eq 0) {
    Salvar-Complementares
  }

  Start-Sleep -Milliseconds 60
}

Salvar-Complementares

Write-Host ""
Write-Host "=== API CONCLUIDA ===" -ForegroundColor Cyan
Write-Host "Complementares recuperadas: $($complementares.Count)"
Write-Host "Novas nesta execucao: $novas"
Write-Host "Erros: $($erros.Count)"

# ------------------------------------------------------------
# INCORPORAR COMPLEMENTARES AO CATALOGO
# ------------------------------------------------------------

foreach ($item in $complementares.Values) {
  $catalogo[[string]$item.id] = $item
}

Write-Host ""
Write-Host "Catalogo total apos API: $($catalogo.Count)"

# ------------------------------------------------------------
# CLASSIFICACAO ESTRUTURADA DO PAPEL LEGISLATIVO
# ------------------------------------------------------------

function Normalizar-TextoLegislativo {
  param(
    [AllowNull()]
    [string]$Texto
  )

  if ([string]::IsNullOrWhiteSpace($Texto)) {
    return ""
  }

  $formD =
    $Texto.Normalize(
      [System.Text.NormalizationForm]::FormD
    )

  $sb =
    New-Object System.Text.StringBuilder

  foreach ($ch in $formD.ToCharArray()) {

    $categoria =
      [System.Globalization.CharUnicodeInfo]::GetUnicodeCategory(
        $ch
      )

    if (
      $categoria -ne
      [System.Globalization.UnicodeCategory]::NonSpacingMark
    ) {
      [void]$sb.Append($ch)
    }
  }

  $normalizado =
    $sb.ToString().Normalize(
      [System.Text.NormalizationForm]::FormC
    )

  $normalizado =
    $normalizado.ToLowerInvariant()

  $normalizado =
    [regex]::Replace(
      $normalizado,
      "[^a-z0-9]+",
      " "
    )

  return (
    [regex]::Replace(
      $normalizado,
      "\s+",
      " "
    )
  ).Trim()
}

function Obter-FamiliaDocumentoLegislativo {
  param(
    [string]$Sigla
  )

  $s =
    ([string]$Sigla).Trim().ToUpperInvariant()

  if (@(
    "PL",
    "PEC",
    "PDL",
    "PLP",
    "PRC",
    "PFC"
  ) -contains $s) {
    return "proposicao-principal"
  }

  if (@(
    "EMP",
    "EMC",
    "EMR",
    "EMA",
    "ERD",
    "SBT",
    "SSP",
    "SBR",
    "ESB"
  ) -contains $s) {
    return "emenda-ou-substitutivo"
  }

  if (@(
    "PRL",
    "PRLE",
    "PRLP",
    "PEP",
    "PPP",
    "PSS",
    "PPR",
    "PES",
    "PRV",
    "RLP",
    "REL"
  ) -contains $s) {
    return "parecer-ou-relatorio"
  }

  if (@(
    "REQ",
    "RIC",
    "RCP",
    "RRL"
  ) -contains $s) {
    return "requerimento"
  }

  if ($s -eq "REC") {
    return "recurso"
  }

  if (@(
    "RPD",
    "DTQ",
    "RPDR"
  ) -contains $s) {
    return "procedimento-de-votacao"
  }

  if (@(
    "RDF",
    "DOC",
    "OF"
  ) -contains $s) {
    return "redacao-ou-documento"
  }

  if ($s -eq "INC") {
    return "indicacao"
  }

  if ($s -eq "VTS") {
    return "voto-em-separado"
  }

  if ($s -eq "CVO") {
    return "complementacao-de-voto"
  }

  if ($s -eq "SIT") {
    return "solicitacao-de-informacao"
  }

  if ($s -eq "PROC") {
    return "processo-interno"
  }

  if ($s -eq "SOR") {
    return "emenda-orcamentaria"
  }

  if ([string]::IsNullOrWhiteSpace($s)) {
    return "metadados-indisponiveis"
  }

  return "outro"
}

function Obter-PapelLegislativo {
  param(
    [string]$Sigla,
    [string]$DescricaoTipo,
    [string]$Ementa,
    [string]$NomeAutor,
    [string]$Proponente,
    [string]$OrdemAssinatura,
    [bool]$MetadadosDisponiveis
  )

  $familia =
    Obter-FamiliaDocumentoLegislativo `
      -Sigla $Sigla

  $papelEspecifico =
    ""

  $criterioPapelEspecifico =
    ""

  $confiancaPapelEspecifico =
    ""

  $siglaNormalizada =
    ([string]$Sigla).Trim().ToUpperInvariant()

  $descricaoNormalizada =
    Normalizar-TextoLegislativo `
      -Texto $DescricaoTipo

  $ementaNormalizada =
    Normalizar-TextoLegislativo `
      -Texto $Ementa

  $nomeNormalizado =
    Normalizar-TextoLegislativo `
      -Texto $NomeAutor

  # PRL com descricao oficial "Parecer do Relator"
  # e PPR "Parecer Reformulado de Plenario"
  # constituem evidencias estruturais do papel.
  $relatoriaPorTipo =
    (
      (
        $siglaNormalizada -eq "PRL" -and
        $descricaoNormalizada -match
          "\bparecer do relator\b|\bparecer da relatora\b"
      ) -or
      (
        $siglaNormalizada -eq "PPR" -and
        $descricaoNormalizada -match
          "\bparecer reformulado de plenario\b"
      )
    )

  # Nos demais documentos, nao basta que o nome e a palavra
  # relator aparecam em qualquer lugar da ementa.
  # Exigimos proximidade maxima de 140 caracteres.
  $relatoriaPorTexto =
    $false

  if (
    $familia -eq "parecer-ou-relatorio" -and
    -not [string]::IsNullOrWhiteSpace($nomeNormalizado)
  ) {

    $matchesRelator =
      @(
        [regex]::Matches(
          $ementaNormalizada,
          "\brelator(?:a|ia)?\b"
        )
      )

    $indicesNome =
      New-Object System.Collections.ArrayList

    $inicioNome =
      0

    while ($true) {

      $indiceNome =
        $ementaNormalizada.IndexOf(
          $nomeNormalizado,
          $inicioNome,
          [System.StringComparison]::Ordinal
        )

      if ($indiceNome -lt 0) {
        break
      }

      [void]$indicesNome.Add($indiceNome)

      $inicioNome =
        $indiceNome +
        [math]::Max(
          1,
          $nomeNormalizado.Length
        )
    }

    $menorDistancia =
      [int]::MaxValue

    foreach ($mRelator in $matchesRelator) {

      foreach ($indiceNome in $indicesNome) {

        $distancia =
          [math]::Abs(
            $mRelator.Index -
            [int]$indiceNome
          )

        if ($distancia -lt $menorDistancia) {
          $menorDistancia =
            $distancia
        }
      }
    }

    if ($menorDistancia -le 140) {
      $relatoriaPorTexto =
        $true
    }
  }
  if ($relatoriaPorTipo) {

    $papelEspecifico =
      "relator"

    $criterioPapelEspecifico =
      "tipo-documental-oficial"

    $confiancaPapelEspecifico =
      "alta"
  }
  elseif ($relatoriaPorTexto) {

    $papelEspecifico =
      "relator"

    $criterioPapelEspecifico =
      "proximidade-nome-relator"

    $confiancaPapelEspecifico =
      "alta"
  }

  $proponenteOficial =
    $false

  if (
    ([string]$Proponente).Trim() -match
      "^(S|SIM|TRUE|1)$"
  ) {
    $proponenteOficial =
      $true
  }

  $primeiroSignatario =
    (
      ([string]$OrdemAssinatura).Trim() -eq "1"
    )

  return [pscustomobject]@{
    vinculoOficial =
      "autoria-oficial"

    familiaDocumento =
      $familia

    papelEspecifico =
      $papelEspecifico

    confiancaPapelEspecifico =
      $confiancaPapelEspecifico

    criterioPapelEspecifico =
      $criterioPapelEspecifico

    proponenteOficial =
      $proponenteOficial

    primeiroSignatario =
      $primeiroSignatario

    ordemAssinatura =
      ([string]$OrdemAssinatura).Trim()

    metadadosDisponiveis =
      $MetadadosDisponiveis
  }
}

# ------------------------------------------------------------
# REFAZER ATUACAO POR PESSOA
# ------------------------------------------------------------

Write-Host ""
Write-Host "6. Refazendo atuacao legislativa..." -ForegroundColor Yellow

$atuacaoPorPessoa =
  @{}

$semCatalogo =
  New-Object System.Collections.ArrayList

foreach ($autor in $autores) {

  $deputadoId =
    [string]$autor.$colAutorDeputadoId

  if (-not $pessoaPorDeputado.ContainsKey($deputadoId)) {
    continue
  }

  $proposicaoId =
    [string]$autor.$colAutorPropId

  $pessoaId =
    $pessoaPorDeputado[$deputadoId]

  if (-not $atuacaoPorPessoa.ContainsKey($pessoaId)) {

    $atuacaoPorPessoa[$pessoaId] =
      [pscustomobject]@{
        pessoaPoliticaId = $pessoaId
        deputadoIdCamara = $deputadoId
        proposicoes = New-Object System.Collections.ArrayList
      }
  }

  if (-not $catalogo.ContainsKey($proposicaoId)) {

    $uriProposicao =
      [string]$autor.uriProposicao

    $mensagemPublica =
      "A Câmara registra esta atuação, mas os detalhes da proposição não estão disponíveis na API pública no momento."

    [void]$semCatalogo.Add(
      [pscustomobject]@{
        deputadoId = $deputadoId
        proposicaoId = $proposicaoId
        statusResolucao = "metadados-indisponiveis"
      }
    )

    [void]$atuacaoPorPessoa[$pessoaId].proposicoes.Add(
      [pscustomobject]@{
        tipo = "ato-legislativo"

        proposicaoId = $proposicaoId

        siglaTipo = ""
        numero = ""
        ano = ""

        identificacao =
          "Registro legislativo $proposicaoId"

        data = ""

        descricaoTipo =
          "Registro legislativo com detalhes indisponíveis"

        ementa =
          $mensagemPublica

        origemCatalogo =
          "autoria-oficial-sem-metadados"

        statusResolucao =
          "metadados-indisponiveis"

        metadadosDisponiveis =
          $false

        mensagemPublica =
          $mensagemPublica

        papelLegislativo =
          Obter-PapelLegislativo `
            -Sigla "" `
            -DescricaoTipo "Registro legislativo com detalhes indisponíveis" `
            -Ementa $mensagemPublica `
            -NomeAutor ([string]$autor.nomeAutor) `
            -Proponente ([string]$autor.proponente) `
            -OrdemAssinatura ([string]$autor.ordemAssinatura) `
            -MetadadosDisponiveis $false

        autoria =
          [pscustomobject]@{
            deputadoIdCamara =
              $deputadoId

            tipoAutor =
              [string]$autor.tipoAutor

            nomeAutor =
              [string]$autor.nomeAutor

            partidoAutor =
              [string]$autor.siglaPartidoAutor

            ufAutor =
              [string]$autor.siglaUFAutor

            ordemAssinatura =
              [string]$autor.ordemAssinatura

            proponente =
              [string]$autor.proponente
          }

        uriProposicaoOriginal =
          $uriProposicao

        fonte =
          [pscustomobject]@{
            titulo =
              "Camara dos Deputados - Base oficial de autoria de proposicoes"

            url =
              "https://dadosabertos.camara.leg.br/arquivos/proposicoesAutores/csv/proposicoesAutores-2026.csv"
          }
      }
    )

    continue
  }

  $prop =
    $catalogo[$proposicaoId]

  $sigla =
    [string]$prop.siglaTipo

  $numero =
    [string]$prop.numero

  $ano =
    [string]$prop.ano

  if (
    $ano -and
    $ano -ne "0"
  ) {
    $identificacao =
      "$sigla $numero/$ano"
  }
  else {
    $identificacao =
      "$sigla $numero"
  }

  [void]$atuacaoPorPessoa[$pessoaId].proposicoes.Add(
    [pscustomobject]@{
      tipo = "ato-legislativo"
      proposicaoId = $proposicaoId
      siglaTipo = $sigla
      numero = $numero
      ano = $ano
      identificacao = $identificacao
      data = [string]$prop.dataApresentacao
      descricaoTipo = [string]$prop.descricaoTipo
      ementa = [string]$prop.ementa
      origemCatalogo = [string]$prop.origem

      papelLegislativo =
        Obter-PapelLegislativo `
          -Sigla $sigla `
          -DescricaoTipo ([string]$prop.descricaoTipo) `
          -Ementa ([string]$prop.ementa) `
          -NomeAutor ([string]$autor.nomeAutor) `
          -Proponente ([string]$autor.proponente) `
          -OrdemAssinatura ([string]$autor.ordemAssinatura) `
          -MetadadosDisponiveis $true

      autoria =
        [pscustomobject]@{
          deputadoIdCamara =
            $deputadoId

          tipoAutor =
            [string]$autor.tipoAutor

          nomeAutor =
            [string]$autor.nomeAutor

          partidoAutor =
            [string]$autor.siglaPartidoAutor

          ufAutor =
            [string]$autor.siglaUFAutor

          ordemAssinatura =
            [string]$autor.ordemAssinatura

          proponente =
            [string]$autor.proponente
        }

      fonte = [pscustomobject]@{
        titulo = "Camara dos Deputados - Proposicao"
        url = [string]$prop.uri
      }
    }
  )
}

$resultadoFinal =
  New-Object System.Collections.ArrayList

foreach ($registro in $atuacaoPorPessoa.Values) {

  $unicos =
    @(
      $registro.proposicoes |
        Group-Object {
          "$($_.proposicaoId)"
        } |
        ForEach-Object {

          $grupoProposicao =
            @($_.Group)

          $base =
            $grupoProposicao |
              Select-Object -First 1

          # --------------------------------------------------
          # Preservar TODAS as relacoes oficiais da Camara
          # para esta pessoa + proposicao.
          # --------------------------------------------------

          $relacoesAutoriaOficial =
            @(
              $grupoProposicao |
                ForEach-Object {

                  if ($null -ne $_.autoria) {
                    $_.autoria
                  }
                }
            )

          $ordensAssinatura =
            @(
              $relacoesAutoriaOficial |
                ForEach-Object {
                  ([string]$_.ordemAssinatura).Trim()
                } |
                Where-Object {
                  -not [string]::IsNullOrWhiteSpace($_)
                } |
                Sort-Object -Unique
            )

          $temProponenteOficial =
            @(
              $relacoesAutoriaOficial |
                Where-Object {
                  ([string]$_.proponente).Trim() -match
                    "^(S|SIM|TRUE|1)$"
                }
            ).Count -gt 0

          $temOrdemUm =
            $ordensAssinatura -contains "1"

          $ordemAssinaturaAmbigua =
            $ordensAssinatura.Count -gt 1

          # So afirmamos "primeiro signatario" quando
          # existe ordem 1 E nao existem ordens conflitantes
          # para a mesma pessoa + proposicao.
          $primeiroSignatarioConfirmado =
            (
              $temOrdemUm -and
              -not $ordemAssinaturaAmbigua
            )

          # --------------------------------------------------
          # Se qualquer uma das relacoes produziu evidencia
          # forte de relatoria, preservamos essa classificacao.
          # --------------------------------------------------

          $evidenciaRelatoria =
            $grupoProposicao |
              Where-Object {
                $null -ne $_.papelLegislativo -and
                $_.papelLegislativo.papelEspecifico -eq
                  "relator"
              } |
              Select-Object -First 1

          if (
            $null -ne $base.papelLegislativo
          ) {

            $base.papelLegislativo.proponenteOficial =
              $temProponenteOficial

            $base.papelLegislativo.primeiroSignatario =
              $primeiroSignatarioConfirmado

            if ($ordensAssinatura.Count -eq 1) {
              $base.papelLegislativo.ordemAssinatura =
                [string]$ordensAssinatura[0]
            }
            else {
              $base.papelLegislativo.ordemAssinatura =
                ""
            }

            $base.papelLegislativo |
              Add-Member `
                -NotePropertyName ordensAssinatura `
                -NotePropertyValue @($ordensAssinatura) `
                -Force

            $base.papelLegislativo |
              Add-Member `
                -NotePropertyName ordemAssinaturaAmbigua `
                -NotePropertyValue $ordemAssinaturaAmbigua `
                -Force

            $base.papelLegislativo |
              Add-Member `
                -NotePropertyName quantidadeRelacoesAutoriaOficial `
                -NotePropertyValue $relacoesAutoriaOficial.Count `
                -Force

            if ($null -ne $evidenciaRelatoria) {

              $base.papelLegislativo.papelEspecifico =
                [string]$evidenciaRelatoria.papelLegislativo.papelEspecifico

              $base.papelLegislativo.confiancaPapelEspecifico =
                [string]$evidenciaRelatoria.papelLegislativo.confiancaPapelEspecifico

              $base.papelLegislativo.criterioPapelEspecifico =
                [string]$evidenciaRelatoria.papelLegislativo.criterioPapelEspecifico
            }
          }

          # --------------------------------------------------
          # O campo autoria singular e mantido por
          # compatibilidade, mas TODAS as relacoes oficiais
          # ficam explicitamente preservadas neste array.
          # --------------------------------------------------

          $base |
            Add-Member `
              -NotePropertyName relacoesAutoriaOficial `
              -NotePropertyValue @($relacoesAutoriaOficial) `
              -Force

          $base |
            Add-Member `
              -NotePropertyName relacaoAutoriaMultipla `
              -NotePropertyValue ($relacoesAutoriaOficial.Count -gt 1) `
              -Force

          $base
        } |
        Sort-Object data -Descending
    )

  [void]$resultadoFinal.Add(
    [pscustomobject]@{
      pessoaPoliticaId = $registro.pessoaPoliticaId
      deputadoIdCamara = $registro.deputadoIdCamara
      proposicoes = $unicos
    }
  )
}

Escrever-JsonArrayStreaming `
  ($resultadoFinal | Sort-Object pessoaPoliticaId) `
  $saidaAtuacao `
  12

# ------------------------------------------------------------
# RECRIAR LINHA DO TEMPO SEM DUPLICAR A FASE 3D ANTIGA
# ------------------------------------------------------------

Write-Host ""
Write-Host "7. Atualizando linha do tempo..." -ForegroundColor Yellow

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

    # Remove apenas os eventos de proposicao da Fase 3D anterior.
    if (
      @(
        "proposicao",
        "ato-legislativo"
      ) -contains [string]$evento.tipo
    ) {
      continue
    }

    [void]$eventos.Add($evento)
  }

  $linhaPorPessoa[[string]$item.pessoaPoliticaId] =
    [pscustomobject]@{
      pessoaPoliticaId = [string]$item.pessoaPoliticaId
      eventos = $eventos
    }
}

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
        tipo = "ato-legislativo"
        dataOrdenacao = [string]$prop.data
        titulo = [string]$prop.identificacao
        descricao = [string]$prop.ementa
        fonte = $prop.fonte
        dados = $prop
      }
    )
  }
}

$linhaFinal =
  New-Object System.Collections.ArrayList

foreach ($item in $linhaPorPessoa.Values) {

  [void]$linhaFinal.Add(
    [pscustomobject]@{
      pessoaPoliticaId = $item.pessoaPoliticaId
      eventos = @(
        $item.eventos |
        Sort-Object dataOrdenacao -Descending
      )
    }
  )
}

Escrever-JsonArrayStreaming `
  ($linhaFinal | Sort-Object pessoaPoliticaId) `
  $saidaLinha `
  16

# ------------------------------------------------------------
# VALIDACOES
# ------------------------------------------------------------

Write-Host ""
Write-Host "=== RESUMO FASE 3D.3 ===" -ForegroundColor Cyan

$totalAtos =
  (
    $resultadoFinal |
    ForEach-Object {
      @($_.proposicoes).Count
    } |
    Measure-Object -Sum
  ).Sum

Write-Host "Proposicoes complementares: $($complementares.Count)"
Write-Host "Pessoas com atos legislativos: $($resultadoFinal.Count)"
Write-Host "Atos legislativos unicos: $totalAtos"
Write-Host "Relacoes preservadas sem catalogo: $($semCatalogo.Count)"
Write-Host "Pessoas na linha do tempo: $($linhaFinal.Count)"
Write-Host "Erros de API: $($erros.Count)"

$gleisi =
  $resultadoFinal |
  Where-Object {
    $_.deputadoIdCamara -eq "107283"
  } |
  Select-Object -First 1

Write-Host ""
Write-Host "=== TESTE GLEISI — ATOS MAIS RECENTES ===" -ForegroundColor Yellow

if ($gleisi) {

  Write-Host "Registros: $(@($gleisi.proposicoes).Count)"
  Write-Host ""

  $gleisi.proposicoes |
    Select-Object -First 20 |
    Select-Object `
      data,
      siglaTipo,
      identificacao,
      descricaoTipo,
      ementa |
    Format-Table -AutoSize -Wrap
}

foreach ($arquivo in @(
  $saidaComplementar,
  $saidaAtuacao,
  $saidaLinha
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

Write-Host ""
Write-Host "Nenhum CPF foi gravado." -ForegroundColor Green

if ($erros.Count -gt 0) {

  Write-Host ""
  Write-Host "=== ERROS DE API ===" -ForegroundColor DarkYellow

  $erros |
    Select-Object -First 30 |
    Format-Table -AutoSize -Wrap
}

Write-Host ""
Write-Host "Arquivos:"
Write-Host $saidaComplementar
Write-Host $saidaAtuacao
Write-Host $saidaLinha
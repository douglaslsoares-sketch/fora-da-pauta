$ErrorActionPreference = "Stop"

$raiz = Resolve-Path (Join-Path $PSScriptRoot "..")

$arquivoVinculos =
  Join-Path $raiz "data\eleicoes\gerado\vinculos-camara-identidades.json"

$saida =
  Join-Path $raiz "data\eleicoes\gerado\historico-institucional-politico.json"

if (-not (Test-Path -LiteralPath $arquivoVinculos)) {
  throw "Arquivo de vinculos nao encontrado."
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
function Obter-DadosApi([string]$urlInicial) {

  $todos =
    New-Object System.Collections.ArrayList

  $url =
    $urlInicial

  while (-not [string]::IsNullOrWhiteSpace($url)) {

    $resposta = $null

    for ($tentativa = 1; $tentativa -le 3; $tentativa++) {

      try {
        $resposta =
          Obter-JsonUtf8 $url

        break
      }
      catch {

        if ($tentativa -eq 3) {
          throw
        }

        Start-Sleep -Seconds 2
      }
    }

    foreach ($item in @($resposta.dados)) {
      [void]$todos.Add($item)
    }

    $proximo =
      @(
        $resposta.links |
        Where-Object {
          [string]$_.rel -eq "next"
        } |
        Select-Object -First 1
      )

    if ($proximo.Count -eq 1) {
      $url = [string]$proximo[0].href
    }
    else {
      $url = $null
    }
  }

  return @($todos)
}

function Obter-TituloHistorico($item) {

  $descricao =
    [string]$item.descricaoStatus

  $situacao =
    [string]$item.situacao

  if ($descricao -match "Posse") {
    return "Posse como deputado federal"
  }

  if ($descricao -match "Reassun") {
    return "Reassuncao do mandato"
  }

  if (
    $descricao -match "Afastamento" -or
    $situacao -match "Licen"
  ) {
    return "Afastamento do mandato"
  }

  if (
    $descricao -match "rmino da Legislatura" -or
    $situacao -eq "FIM_MANDATO"
  ) {
    return "Fim de mandato"
  }

  if (-not [string]::IsNullOrWhiteSpace($descricao)) {
    return "Registro parlamentar"
  }

  return "Atuacao na Camara dos Deputados"
}

Write-Host ""
Write-Host "1. Lendo vinculos seguros..." -ForegroundColor Yellow

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

Write-Host "Pessoas vinculadas a Camara: $($vinculos.Count)"

if ($vinculos.Count -ne 566) {
  throw "Esperava 566 vinculos da Camara, mas encontrei $($vinculos.Count)."
}

$resultadoPorPessoa = @{}

if (Test-Path -LiteralPath $saida) {

  Write-Host ""
  Write-Host "2. Recuperando processamento anterior..." -ForegroundColor Yellow

  try {
    $anteriorRaw =
      Get-Content `
        -LiteralPath $saida `
        -Raw `
        -Encoding UTF8 |
      ConvertFrom-Json

    $anterior =
      New-Object System.Collections.ArrayList

    foreach ($registroAnterior in $anteriorRaw) {
      [void]$anterior.Add($registroAnterior)
    }

    foreach ($item in $anterior) {
      $resultadoPorPessoa[[string]$item.pessoaPoliticaId] =
        $item
    }

    Write-Host "Ja processados: $($resultadoPorPessoa.Count)"
  }
  catch {
    Write-Host "Arquivo anterior invalido. Sera recriado." -ForegroundColor DarkYellow
    $resultadoPorPessoa = @{}
  }
}
else {
  Write-Host ""
  Write-Host "2. Nenhum processamento anterior encontrado."
}

function Salvar-Resultado {

  $ordenado =
    @(
      $resultadoPorPessoa.Values |
      Sort-Object pessoaPoliticaId
    )

  $json =
    $ordenado |
    ConvertTo-Json -Depth 12

  $utf8Bom =
    New-Object System.Text.UTF8Encoding($true)

  [System.IO.File]::WriteAllText(
    $saida,
    $json,
    $utf8Bom
  )
}

Write-Host ""
Write-Host "3. Consultando trajetorias..." -ForegroundColor Yellow

$contador = 0
$novos = 0

$erros =
  New-Object System.Collections.ArrayList

foreach ($vinculo in $vinculos) {

  $contador++

  $pessoaPoliticaId =
    [string]$vinculo.pessoaPoliticaId

  $deputadoId =
    [string]$vinculo.deputadoIdCamara

  if ($resultadoPorPessoa.ContainsKey($pessoaPoliticaId)) {

    if (
      $contador -eq 1 -or
      $contador % 25 -eq 0 -or
      $contador -eq $vinculos.Count
    ) {
      Write-Host "   $contador / $($vinculos.Count) - ja existente"
    }

    continue
  }

  if (
    $contador -eq 1 -or
    $contador % 10 -eq 0 -or
    $contador -eq $vinculos.Count
  ) {
    Write-Host "   $contador / $($vinculos.Count)"
  }

  try {

    $urlHistorico =
      "https://dadosabertos.camara.leg.br/api/v2/deputados/$deputadoId/historico"

    $urlMandatos =
      "https://dadosabertos.camara.leg.br/api/v2/deputados/$deputadoId/mandatosExternos"

    $historico =
      @(Obter-DadosApi $urlHistorico)

    $mandatos =
      @(Obter-DadosApi $urlMandatos)

    $trajetoria =
      New-Object System.Collections.ArrayList

    foreach ($item in $historico) {

      $descricao =
        [string]$item.descricaoStatus

      $situacao =
        [string]$item.situacao

      if ($descricao -match "Nome no in.cio da legislatura") {
        continue
      }

      $data =
        [string]$item.dataHora

      $periodo = $data

      if ($data -match "^(\d{4}-\d{2}-\d{2})") {
        $periodo = $Matches[1]
      }

      $titulo =
        Obter-TituloHistorico $item

      $partes =
        New-Object System.Collections.ArrayList

      if (-not [string]::IsNullOrWhiteSpace($descricao)) {
        [void]$partes.Add($descricao)
      }

      if (
        -not [string]::IsNullOrWhiteSpace($situacao) -and
        $situacao -ne "FIM_MANDATO"
      ) {
        [void]$partes.Add("Situacao: $situacao")
      }

      $descricaoFinal =
        ($partes | Select-Object -Unique) -join ". "

      [void]$trajetoria.Add(
        [pscustomobject]@{
          tipo = "historico-camara"
          titulo = $titulo
          periodo = $periodo
          descricao = $descricaoFinal
          legislatura = [string]$item.idLegislatura
          fonte = [pscustomobject]@{
            titulo = "Camara dos Deputados - Historico parlamentar"
            url = $urlHistorico
          }
        }
      )
    }

    foreach ($mandato in $mandatos) {

      $cargo =
        [string]$mandato.cargo

      $municipio =
        [string]$mandato.municipio

      $anoInicio =
        [string]$mandato.anoInicio

      $anoFim =
        [string]$mandato.anoFim

      if ($anoInicio -and $anoFim) {
        $periodo = "$anoInicio-$anoFim"
      }
      elseif ($anoInicio) {
        $periodo = $anoInicio
      }
      else {
        $periodo = ""
      }

      if (-not [string]::IsNullOrWhiteSpace($municipio)) {
        $descricao = $municipio
      }
      elseif (-not [string]::IsNullOrWhiteSpace([string]$mandato.siglaUf)) {
        $descricao = [string]$mandato.siglaUf
      }
      else {
        $descricao = ""
      }

      [void]$trajetoria.Add(
        [pscustomobject]@{
          tipo = "mandato-externo"
          titulo = $cargo
          periodo = $periodo
          descricao = $descricao
          partidoNaEleicao =
            [string]$mandato.siglaPartidoEleicao
          fonte = [pscustomobject]@{
            titulo = "Camara dos Deputados - Mandatos externos"
            url = $urlMandatos
          }
        }
      )
    }

    $trajetoriaUnica =
      @(
        $trajetoria |
        Group-Object {
          "$($_.tipo)|$($_.titulo)|$($_.periodo)|$($_.descricao)"
        } |
        ForEach-Object {
          $_.Group | Select-Object -First 1
        }
      )

    $trajetoriaOrdenada =
      @(
        $trajetoriaUnica |
        Sort-Object periodo -Descending
      )

    $resultadoPorPessoa[$pessoaPoliticaId] =
      [pscustomobject]@{
        pessoaPoliticaId = $pessoaPoliticaId
        deputadoIdCamara = $deputadoId
        nomeCivilCamara =
          [string]$vinculo.nomeCivilCamara
        trajetoria = $trajetoriaOrdenada
        fontes = @(
          $urlHistorico,
          $urlMandatos
        )
      }

    $novos++

    if ($novos % 10 -eq 0) {
      Salvar-Resultado
    }
  }
  catch {

    [void]$erros.Add(
      [pscustomobject]@{
        pessoaPoliticaId = $pessoaPoliticaId
        deputadoIdCamara = $deputadoId
        erro = $_.Exception.Message
      }
    )

    Write-Host ""
    Write-Host "Falha em deputadoId $deputadoId" -ForegroundColor Red
    Write-Host $_.Exception.Message

    Salvar-Resultado
  }
}

Salvar-Resultado

Write-Host ""
Write-Host "=== RESUMO DA FASE 3A ===" -ForegroundColor Cyan
Write-Host "Vinculos totais: $($vinculos.Count)"
Write-Host "Historicos gerados: $($resultadoPorPessoa.Count)"
Write-Host "Novos nesta execucao: $novos"
Write-Host "Erros: $($erros.Count)"

$gleisi =
  $resultadoPorPessoa.Values |
  Where-Object {
    [string]$_.deputadoIdCamara -eq "107283"
  } |
  Select-Object -First 1

if (-not $gleisi) {
  throw "Teste falhou: historico da Gleisi nao foi gerado."
}

Write-Host ""
Write-Host "=== TESTE GLEISI ===" -ForegroundColor Yellow
Write-Host "Pessoa politica: $($gleisi.pessoaPoliticaId)"
Write-Host "DeputadoId: $($gleisi.deputadoIdCamara)"
Write-Host "Registros: $(@($gleisi.trajetoria).Count)"
Write-Host ""

$gleisi.trajetoria |
  Select-Object periodo, titulo, descricao |
  Format-Table -AutoSize -Wrap

$textoFinal =
  Get-Content `
    -LiteralPath $saida `
    -Raw `
    -Encoding UTF8

if (
  $textoFinal -match '"cpf"\s*:' -or
  $textoFinal -match "NR_CPF_CANDIDATO"
) {
  throw "Identificador pessoal apareceu no arquivo gerado."
}

Write-Host ""
Write-Host "Nenhum CPF foi gravado." -ForegroundColor Green

if ($erros.Count -gt 0) {
  Write-Host ""
  Write-Host "=== ERROS PARA REVISAR ===" -ForegroundColor Red
  $erros | Format-Table -AutoSize -Wrap
}

Write-Host ""
Write-Host "Arquivo:"
Write-Host $saida
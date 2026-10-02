$ErrorActionPreference = "Stop"

$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$marca = Get-Date -Format "yyyyMMdd-HHmmss-fff"
$pasta = Join-Path (Split-Path $raiz -Parent) "conferencia-alepa-$marca"
$perfil = Join-Path $pasta "perfil-chrome"

$chrome = @(
  "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
  "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if (!$chrome) { throw "Google Chrome nao encontrado." }

New-Item -ItemType Directory -Path $perfil -Force | Out-Null
$saida = Join-Path $pasta "proposicoes-alepa-2026.json"
$processo = $null

Push-Location $raiz
try {
  $processo = Start-Process -FilePath $chrome -PassThru -ArgumentList @(
    "--headless=new"
    "--disable-extensions"
    "--no-first-run"
    "--no-default-browser-check"
    "--remote-debugging-port=0"
    "--user-data-dir=`"$perfil`""
    "about:blank"
  )

  $arquivoPorta = Join-Path $perfil "DevToolsActivePort"
  $limite = (Get-Date).AddSeconds(30)

  while (!(Test-Path -LiteralPath $arquivoPorta)) {
    if ((Get-Date) -ge $limite) {
      throw "Chrome nao disponibilizou a porta de depuracao."
    }
    Start-Sleep -Milliseconds 300
  }

  $porta = (Get-Content -LiteralPath $arquivoPorta)[0]
  if ($porta -notmatch '^\d+$') {
    throw "Porta do Chrome invalida."
  }

  $aba = Invoke-RestMethod -Method Put `
    -Uri "http://127.0.0.1:$porta/json/new?about:blank"

  if ($aba.type -ne "page" -or $aba.url -ne "about:blank" -or
      !$aba.webSocketDebuggerUrl) {
    throw "Nao foi possivel criar uma aba exclusiva."
  }

  Write-Host "Pasta de conferencia: $pasta"

  node "./scripts/coletar-proposicoes-alepa.mjs" `
    $aba.webSocketDebuggerUrl $saida

  if ($LASTEXITCODE -ne 0) {
    throw "Coleta incompleta. Fichas do projeto preservadas."
  }

  if (!(Test-Path -LiteralPath $saida)) {
    throw "Arquivo final da coleta nao encontrado."
  }

  Write-Host "Coleta concluida: $saida"
}
finally {
  if ($processo -and !$processo.HasExited) {
    Stop-Process -Id $processo.Id -Force -ErrorAction SilentlyContinue
  }
  Pop-Location
}
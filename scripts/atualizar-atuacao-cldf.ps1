$ErrorActionPreference = "Stop"

$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$marca = Get-Date -Format "yyyyMMdd-HHmmss-fff"
$backup = Join-Path (Split-Path $raiz -Parent) "backup-atualizacao-cldf-$marca"
$destino = Join-Path $raiz "data/eleicoes/gerado/atuacao-estadual-candidatos"

New-Item -ItemType Directory -Path $backup | Out-Null

if (Test-Path -LiteralPath $destino) {
  Copy-Item -LiteralPath $destino -Destination $backup -Recurse
}

$coleta = Join-Path $backup "proposicoes-2026.json"

Push-Location $raiz
try {
  Write-Output "Backup: $backup"

  node "scripts/coletar-proposicoes-cldf.mjs" $coleta
  if ($LASTEXITCODE -ne 0) {
    throw "Coleta falhou; geração não executada."
  }

  node "scripts/gerar-atuacao-cldf.mjs" $coleta
  if ($LASTEXITCODE -ne 0) {
    throw "Geração falhou. O conjunto anterior está no backup."
  }

  Write-Output "Atualização da CLDF concluída."
}
finally {
  Pop-Location
}
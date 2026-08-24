$ErrorActionPreference = "Stop"

$ano = 2026
$url = "https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_$ano.zip"

$baseDir = Join-Path $PSScriptRoot "..\data\eleicoes\bruto"
$zipPath = Join-Path $baseDir "consulta_cand_$ano.zip"
$extractDir = Join-Path $baseDir "consulta_cand_$ano"

Write-Host "Baixando dados oficiais do TSE..."
Invoke-WebRequest -Uri $url -OutFile $zipPath

if (Test-Path $extractDir) {
  Remove-Item $extractDir -Recurse -Force
}

New-Item -ItemType Directory -Force $extractDir | Out-Null

Write-Host "Extraindo arquivos..."
Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force

Write-Host ""
Write-Host "Arquivos encontrados:"
Get-ChildItem $extractDir -File |
  Select-Object Name, Length |
  Format-Table -AutoSize

Write-Host ""
Write-Host "Dados do TSE atualizados."

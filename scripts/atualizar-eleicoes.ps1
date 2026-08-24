$ErrorActionPreference = "Stop"

$inicio = Get-Date
$raiz = Resolve-Path (Join-Path $PSScriptRoot "..")

function Etapa([string]$texto) {
  Write-Host ""
  Write-Host "============================================================" -ForegroundColor Cyan
  Write-Host " $texto" -ForegroundColor Cyan
  Write-Host "============================================================" -ForegroundColor Cyan
}

function Executar-Script([string]$nome) {
  $arquivo = Join-Path $PSScriptRoot $nome

  if (-not (Test-Path $arquivo)) {
    throw "Script nao encontrado: $arquivo"
  }

  & powershell.exe `
    -NoProfile `
    -ExecutionPolicy Bypass `
    -File $arquivo

  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao executar $nome. Codigo: $LASTEXITCODE"
  }
}

$dirCamara = Join-Path $raiz "data\eleicoes\camara"

$arquivoVotos =
  Join-Path $dirCamara "votacoesVotos-2026.csv"

$urlVotos =
  "https://dadosabertos.camara.leg.br/arquivos/votacoesVotos/csv/votacoesVotos-2026.csv"

$arquivoCandidaturas =
  Join-Path $raiz "data\eleicoes\gerado\candidaturas-2026.json"

$arquivoValidado =
  Join-Path $dirCamara "cruzamento-validado.csv"

$arquivoNomeCivil =
  Join-Path $dirCamara "cruzamento-confirmado-nome-civil.csv"

$arquivoFinal =
  Join-Path $dirCamara "cruzamento-validado-final.csv"

# ------------------------------------------------------------
# 0. TSE
# ------------------------------------------------------------

Etapa "0/9 - Atualizando candidaturas do TSE"

Executar-Script "atualizar-tse-2026.ps1"

# ------------------------------------------------------------
# 1. CHECAGEM
# ------------------------------------------------------------

Etapa "1/9 - Verificando arquivos"

if (-not (Test-Path $arquivoCandidaturas)) {
  throw "Base TSE nao encontrada: $arquivoCandidaturas"
}

$candidatosTeste =
  Get-Content $arquivoCandidaturas -Raw |
  ConvertFrom-Json

if ($candidatosTeste.Count -lt 1000) {
  throw "Base TSE parece invalida. Registros: $($candidatosTeste.Count)"
}

Write-Host "Base TSE: OK"
Write-Host "Candidaturas: $($candidatosTeste.Count)"

New-Item -ItemType Directory -Force $dirCamara |
  Out-Null

# ------------------------------------------------------------
# 2. CAMARA
# ------------------------------------------------------------

Etapa "2/9 - Atualizando votos da Camara"

$arquivoTemporario = "$arquivoVotos.tmp"

if (Test-Path $arquivoTemporario) {
  Remove-Item $arquivoTemporario -Force
}

try {
  Invoke-WebRequest `
    -Uri $urlVotos `
    -OutFile $arquivoTemporario `
    -UseBasicParsing

  $tamanho = (Get-Item $arquivoTemporario).Length

  if ($tamanho -lt 1000) {
    throw "Arquivo da Camara parece invalido: $tamanho bytes."
  }

  Move-Item `
    -Force `
    $arquivoTemporario `
    $arquivoVotos

  Write-Host "Votos da Camara atualizados."
  Write-Host "Tamanho: $tamanho bytes"
}
catch {
  if (Test-Path $arquivoTemporario) {
    Remove-Item $arquivoTemporario -Force
  }

  if (Test-Path $arquivoVotos) {
    Write-Warning "Falha no download. Usando arquivo local existente."
  }
  else {
    throw
  }
}

# ------------------------------------------------------------
# 3. CRUZAMENTO
# ------------------------------------------------------------

Etapa "3/9 - Cruzando Camara com TSE"

Executar-Script "cruzar-pec221-candidaturas-2026.ps1"

# ------------------------------------------------------------
# 4. VALIDACAO PRIMARIA
# ------------------------------------------------------------

Etapa "4/9 - Validando nome e UF"

Executar-Script "validar-cruzamento-pec221.ps1"

if (-not (Test-Path $arquivoValidado)) {
  throw "cruzamento-validado.csv nao foi produzido."
}

# ------------------------------------------------------------
# 5. NOME CIVIL
# ------------------------------------------------------------

Etapa "5/9 - Validando divergencias por nome civil"

Executar-Script "validar-por-nome-civil.ps1"

if (-not (Test-Path $arquivoNomeCivil)) {
  throw "cruzamento-confirmado-nome-civil.csv nao foi produzido."
}

# ------------------------------------------------------------
# 6. CRUZAMENTO FINAL
# ------------------------------------------------------------

Etapa "6/9 - Construindo cruzamento final"

$validado = @(
  Import-Csv $arquivoValidado
)

$nomeCivil = @(
  Import-Csv $arquivoNomeCivil
)

$unificado = @(
  @($validado) + @($nomeCivil) |
    Group-Object candidaturaId |
    ForEach-Object {
      $_.Group | Select-Object -First 1
    } |
    Sort-Object uf2026, nomeUrna
)

if ($unificado.Count -lt 100) {
  throw "Cruzamento final parece invalido. Registros: $($unificado.Count)"
}

$unificado |
  Export-Csv `
    $arquivoFinal `
    -NoTypeInformation `
    -Encoding UTF8

Write-Host "Registros finais validados: $($unificado.Count)"
Write-Host ""

$unificado |
  Group-Object voto |
  Select-Object Name, Count |
  Format-Table -AutoSize

# ------------------------------------------------------------
# 7. GERACAO
# ------------------------------------------------------------

Etapa "7/9 - Gerando posicionamentos"

Executar-Script "gerar-posicionamentos-pec221.ps1"

# ------------------------------------------------------------
# 8. AUDITORIA
# ------------------------------------------------------------

Etapa "8/9 - Auditando base eleitoral"

Executar-Script "auditar-eleicoes.ps1"

# ------------------------------------------------------------
# 9. BUILD
# ------------------------------------------------------------

Etapa "9/9 - Executando build de producao"

Push-Location $raiz

try {
  & npm.cmd run build

  if ($LASTEXITCODE -ne 0) {
    throw "npm run build falhou. Codigo: $LASTEXITCODE"
  }
}
finally {
  Pop-Location
}

# ------------------------------------------------------------
# FINAL
# ------------------------------------------------------------

$fim = Get-Date
$duracao = $fim - $inicio

$metadataPath = Join-Path $raiz "data\eleicoes\ultima-atualizacao.json"

$metadata = [ordered]@{
  atualizadoEm = $fim.ToString("yyyy-MM-ddTHH:mm:ss")
  candidaturasTse = $candidatosTeste.Count
  registrosValidados = $unificado.Count
}

$jsonMetadata = $metadata | ConvertTo-Json

$utf8SemBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
  $metadataPath,
  $jsonMetadata,
  $utf8SemBom
)

Etapa "ATUALIZACAO CONCLUIDA"

Write-Host "Pipeline eleitoral concluido com sucesso." -ForegroundColor Green
Write-Host ""
Write-Host "Candidaturas TSE:   $($candidatosTeste.Count)"
Write-Host "Registros validados: $($unificado.Count)"
Write-Host "Inicio: $($inicio.ToString('yyyy-MM-dd HH:mm:ss'))"
Write-Host "Fim:    $($fim.ToString('yyyy-MM-dd HH:mm:ss'))"
Write-Host ("Duracao: {0:mm\:ss}" -f $duracao)
Write-Host ""

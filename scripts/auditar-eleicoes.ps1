$ErrorActionPreference = "Stop"

$raiz = Resolve-Path (Join-Path $PSScriptRoot "..")

$arquivoCandidatos = Join-Path $raiz "data\eleicoes\gerado\candidaturas-2026.json"
$arquivoManual = Join-Path $raiz "data\eleicoes\posicionamentos.ts"
$arquivoGerado = Join-Path $raiz "data\eleicoes\posicionamentos-pec221-gerados.ts"
$arquivoValidado = Join-Path $raiz "data\eleicoes\camara\cruzamento-validado-final.csv"

$erros = New-Object System.Collections.ArrayList
$avisos = New-Object System.Collections.ArrayList

function Erro([string]$texto) {
  [void]$erros.Add($texto)
}

function Aviso([string]$texto) {
  [void]$avisos.Add($texto)
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " AUDITORIA ELEITORAL — FORA DA PAUTA"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------
# 1. CANDIDATURAS
# ------------------------------------------------------------

Write-Host "1. Carregando candidaturas..." -ForegroundColor Yellow

$candidatos = Get-Content $arquivoCandidatos -Raw | ConvertFrom-Json

$candidatosPorId = @{}

foreach ($c in $candidatos) {
  $id = [string]$c.id

  if ($candidatosPorId.ContainsKey($id)) {
    Erro "Candidatura duplicada no JSON: $id"
  }
  else {
    $candidatosPorId[$id] = $c
  }
}

Write-Host "   Candidaturas carregadas: $($candidatos.Count)"

# ------------------------------------------------------------
# 2. POSICIONAMENTOS MANUAIS
# ------------------------------------------------------------

Write-Host ""
Write-Host "2. Auditando posicionamentos manuais..." -ForegroundColor Yellow

$manualTexto = [System.IO.File]::ReadAllText($arquivoManual)

$idsPosicionamentoManual = @(
  [regex]::Matches(
    $manualTexto,
    '(?m)^\s*id:\s*"([^"]+)"'
  ) |
    ForEach-Object { $_.Groups[1].Value }
)

$idsCandidaturaManual = @(
  [regex]::Matches(
    $manualTexto,
    'candidaturaId:\s*"([^"]+)"'
  ) |
    ForEach-Object { $_.Groups[1].Value }
)

Write-Host "   Posicionamentos manuais: $($idsCandidaturaManual.Count)"

# ------------------------------------------------------------
# 3. POSICIONAMENTOS GERADOS
# ------------------------------------------------------------

Write-Host ""
Write-Host "3. Auditando posicionamentos automáticos..." -ForegroundColor Yellow

$geradoTexto = [System.IO.File]::ReadAllText($arquivoGerado)

$blocosGerados = [regex]::Matches(
  $geradoTexto,
  '(?s)\{\s*id:\s*"auto-pec221-(?<id>[^"]+)".*?' +
  'candidaturaId:\s*"(?<cid>[^"]+)".*?' +
  'posicao:\s*"(?<pos>[^"]+)".*?' +
  'resultadoVoto:\s*"(?<voto>[^"]+)".*?' +
  'atualizadoEm:\s*"(?<data>[^"]+)".*?\n\s*\},'
)

$gerados = foreach ($m in $blocosGerados) {
  [pscustomobject]@{
    id = "auto-pec221-" + $m.Groups["id"].Value
    candidaturaId = $m.Groups["cid"].Value
    posicao = $m.Groups["pos"].Value
    resultadoVoto = $m.Groups["voto"].Value
    atualizadoEm = $m.Groups["data"].Value
  }
}

Write-Host "   Posicionamentos automáticos: $($gerados.Count)"

# ------------------------------------------------------------
# 4. TOTAL PUBLICADO
# ------------------------------------------------------------

$total = $idsCandidaturaManual.Count + $gerados.Count

Write-Host ""
Write-Host "4. Contagem final..." -ForegroundColor Yellow
Write-Host "   Manual:      $($idsCandidaturaManual.Count)"
Write-Host "   Automático:  $($gerados.Count)"
Write-Host "   TOTAL:       $total"

if ($total -ne 345) {
  Erro "Total esperado 345, mas foram encontrados $total."
}

# ------------------------------------------------------------
# 5. REFERÊNCIAS A CANDIDATURAS EXISTENTES
# ------------------------------------------------------------

Write-Host ""
Write-Host "5. Verificando referências às candidaturas..." -ForegroundColor Yellow

$todosCandidaturaIds = @(
  $idsCandidaturaManual
  $gerados.candidaturaId
)

foreach ($id in $todosCandidaturaIds) {
  if (-not $candidatosPorId.ContainsKey([string]$id)) {
    Erro "Posicionamento aponta para candidatura inexistente: $id"
  }
}

# ------------------------------------------------------------
# 6. DUPLICIDADE DE CANDIDATURA
# ------------------------------------------------------------

Write-Host ""
Write-Host "6. Procurando candidaturas duplicadas..." -ForegroundColor Yellow

$duplicados = @(
  $todosCandidaturaIds |
    Group-Object |
    Where-Object { $_.Count -gt 1 }
)

foreach ($dup in $duplicados) {
  Erro "Candidatura aparece em mais de um posicionamento: $($dup.Name) ($($dup.Count)x)"
}

# ------------------------------------------------------------
# 7. DUPLICIDADE DE ID DE POSICIONAMENTO
# ------------------------------------------------------------

Write-Host ""
Write-Host "7. Verificando IDs de posicionamento..." -ForegroundColor Yellow

$todosIdsPosicionamento = @(
  $idsPosicionamentoManual
  $gerados.id
)

$duplicadosIds = @(
  $todosIdsPosicionamento |
    Group-Object |
    Where-Object { $_.Count -gt 1 }
)

foreach ($dup in $duplicadosIds) {
  Erro "ID de posicionamento duplicado: $($dup.Name)"
}

# ------------------------------------------------------------
# 8. POSIÇÃO X VOTO
# ------------------------------------------------------------

Write-Host ""
Write-Host "8. Verificando coerência entre voto e classificação..." -ForegroundColor Yellow

foreach ($g in $gerados) {
  if ($g.resultadoVoto -eq "sim" -and $g.posicao -ne "favoravel") {
    Erro "$($g.candidaturaId): voto sim classificado como $($g.posicao)"
  }

  if ($g.resultadoVoto -eq "nao" -and $g.posicao -ne "contrario") {
    Erro "$($g.candidaturaId): voto não classificado como $($g.posicao)"
  }

  if ($g.resultadoVoto -notin @("sim", "nao")) {
    Erro "$($g.candidaturaId): resultadoVoto automático inesperado: $($g.resultadoVoto)"
  }
}

# ------------------------------------------------------------
# 9. CSV FINAL DA CÂMARA
# ------------------------------------------------------------

Write-Host ""
Write-Host "9. Auditando cruzamento final da Câmara..." -ForegroundColor Yellow

$validado = Import-Csv $arquivoValidado

Write-Host "   Registros no CSV final: $($validado.Count)"

$distribuicao = $validado |
  Group-Object voto |
  Select-Object Name, Count

$distribuicao | Format-Table -AutoSize

$votosInesperados = @(
  $validado |
    Where-Object {
      $_.voto -notin @("Sim", "Não", "Obstrução")
    }
)

foreach ($v in $votosInesperados) {
  Erro "Voto inesperado no CSV final: '$($v.voto)' — $($v.nomeUrna)"
}

$obstrucoes = @(
  $validado |
    Where-Object { $_.voto -eq "Obstrução" }
)

if ($obstrucoes.Count -gt 0) {
  foreach ($o in $obstrucoes) {
    Aviso "Obstrução não convertida automaticamente em posição: $($o.nomeUrna) / $($o.candidaturaId)"
  }
}

# ------------------------------------------------------------
# 10. ROSANGELA MORO E TIRIRICA
# ------------------------------------------------------------

Write-Host ""
Write-Host "10. Conferindo casos validados por nome civil..." -ForegroundColor Yellow

$casosEspeciais = @{
  "60002537025"  = "TIRIRICA"
  "160002547585" = "ROSANGELA MORO"
}

foreach ($id in $casosEspeciais.Keys) {
  $encontrado = $gerados |
    Where-Object { $_.candidaturaId -eq $id }

  if (-not $encontrado) {
    Erro "$($casosEspeciais[$id]) não está no arquivo automático."
  }
  else {
    Write-Host "   OK: $($casosEspeciais[$id])"
  }
}

# ------------------------------------------------------------
# 11. CAMPOS ESSENCIAIS
# ------------------------------------------------------------

Write-Host ""
Write-Host "11. Verificando campos essenciais das candidaturas publicadas..." -ForegroundColor Yellow

foreach ($id in $todosCandidaturaIds) {
  if (-not $candidatosPorId.ContainsKey([string]$id)) {
    continue
  }

  $c = $candidatosPorId[[string]$id]

  if ([string]::IsNullOrWhiteSpace([string]$c.nomeUrna)) {
    Erro "$id sem nomeUrna."
  }

  if ([string]::IsNullOrWhiteSpace([string]$c.uf)) {
    Erro "$id sem UF."
  }

  if ([string]::IsNullOrWhiteSpace([string]$c.cargo)) {
    Erro "$id sem cargo."
  }

  if ([string]::IsNullOrWhiteSpace([string]$c.siglaPartido)) {
    Erro "$id sem siglaPartido."
  }
}

# ------------------------------------------------------------
# RESULTADO
# ------------------------------------------------------------

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " RESULTADO DA AUDITORIA"
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Posicionamentos auditados: $total"
Write-Host "Erros:  $($erros.Count)"
Write-Host "Avisos: $($avisos.Count)"
Write-Host ""

if ($erros.Count -gt 0) {
  Write-Host "ERROS:" -ForegroundColor Red

  foreach ($e in $erros) {
    Write-Host "  [ERRO] $e" -ForegroundColor Red
  }

  Write-Host ""
}

if ($avisos.Count -gt 0) {
  Write-Host "AVISOS:" -ForegroundColor Yellow

  foreach ($a in $avisos) {
    Write-Host "  [AVISO] $a" -ForegroundColor Yellow
  }

  Write-Host ""
}

if ($erros.Count -eq 0) {
  Write-Host "AUDITORIA APROVADA." -ForegroundColor Green
  Write-Host "Nenhuma inconsistência crítica foi encontrada." -ForegroundColor Green
}
else {
  Write-Host "AUDITORIA REPROVADA." -ForegroundColor Red
  Write-Host "Corrija os erros antes de publicar." -ForegroundColor Red
}

Write-Host ""

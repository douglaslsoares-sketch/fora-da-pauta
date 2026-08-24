$ErrorActionPreference = "Stop"

$arquivo = Join-Path $PSScriptRoot "..\data\eleicoes\bruto\consulta_cand_2026\consulta_cand_2026_BRASIL.csv"
$saidaDir = Join-Path $PSScriptRoot "..\data\eleicoes\gerado"
$saida = Join-Path $saidaDir "candidaturas-2026.json"

New-Item -ItemType Directory -Force $saidaDir | Out-Null

Write-Host "Lendo base oficial do TSE..."
$dados = Import-Csv $arquivo -Delimiter ";" -Encoding Default

$cargosPermitidos = @{
  "PRESIDENTE"          = "presidente"
  "GOVERNADOR"          = "governador"
  "SENADOR"             = "senador"
  "DEPUTADO FEDERAL"    = "deputado-federal"
  "DEPUTADO ESTADUAL"   = "deputado-estadual"
  "DEPUTADO DISTRITAL"  = "deputado-distrital"
}

function Limpar-Valor([string]$valor) {
  if ([string]::IsNullOrWhiteSpace($valor)) {
    return $null
  }

  if ($valor -eq "#NULO") {
    return $null
  }

  return $valor.Trim()
}

function Normalizar-Situacao([string]$situacao) {
  switch -Regex ($situacao) {
    "^DEFERID"       { return "deferida" }
    "^INDEFERID"     { return "indeferida" }
    "REN.NCIA"       { return "renuncia" }
    "FALECID"        { return "falecido" }
    "CANCELAD"       { return "cancelada" }
    "SUBSTITU"       { return "substituida" }
    "^#NE$"          { return "nao-informada" }
    default          { return "outra" }
  }
}

$candidaturas = foreach ($linha in $dados) {
  if (-not $cargosPermitidos.ContainsKey($linha.DS_CARGO)) {
    continue
  }

  $federacao = Limpar-Valor $linha.NM_FEDERACAO

  $item = [ordered]@{
    id                  = [string]$linha.SQ_CANDIDATO
    eleicao             = [int]$linha.ANO_ELEICAO
    nomeUrna            = [string]$linha.NM_URNA_CANDIDATO
    nomeCompleto        = [string]$linha.NM_CANDIDATO
    numero              = [int]$linha.NR_CANDIDATO
    cargo               = $cargosPermitidos[$linha.DS_CARGO]
    uf                  = [string]$linha.SG_UF
    partido             = [string]$linha.NM_PARTIDO
    siglaPartido        = [string]$linha.SG_PARTIDO
    situacao            = Normalizar-Situacao $linha.DS_SITUACAO_CANDIDATURA
    situacaoTse         = [string]$linha.DS_SITUACAO_CANDIDATURA
    fonteOficial        = "https://dadosabertos.tse.jus.br/dataset/candidatos-2026"
    ultimaVerificacao   = (Get-Date).ToString("yyyy-MM-dd")
  }

  if ($federacao) {
    $item["federacao"] = $federacao
  }

  [pscustomobject]$item
}

$candidaturas = @(
  $candidaturas |
    Sort-Object uf, cargo, nomeUrna
)

$candidaturas |
  ConvertTo-Json -Depth 5 |
  Set-Content $saida -Encoding UTF8

Write-Host ""
Write-Host "Importação concluída."
Write-Host "Total de candidaturas:" $candidaturas.Count
Write-Host "Arquivo:" $saida

Write-Host ""
Write-Host "Por cargo:"
$candidaturas |
  Group-Object cargo |
  Sort-Object Name |
  Select-Object Name, Count |
  Format-Table -AutoSize

$ErrorActionPreference = "Stop"

$arquivoRevisar = Join-Path $PSScriptRoot "..\data\eleicoes\camara\cruzamento-revisar.csv"
$saidaConfirmados = Join-Path $PSScriptRoot "..\data\eleicoes\camara\cruzamento-confirmado-nome-civil.csv"
$saidaRejeitados = Join-Path $PSScriptRoot "..\data\eleicoes\camara\cruzamento-nao-confirmado.csv"

function Normalizar-Nome([string]$nome) {
  if ([string]::IsNullOrWhiteSpace($nome)) {
    return ""
  }

  $texto = $nome.Normalize([System.Text.NormalizationForm]::FormD)

  $texto = -join (
    $texto.ToCharArray() |
      Where-Object {
        [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne
        [Globalization.UnicodeCategory]::NonSpacingMark
      }
  )

  return (
    $texto.ToUpperInvariant() `
      -replace '[^A-Z0-9 ]', ' ' `
      -replace '\s+', ' '
  ).Trim()
}

$revisar = Import-Csv $arquivoRevisar

$cacheDeputados = @{}
$confirmados = New-Object System.Collections.ArrayList
$naoConfirmados = New-Object System.Collections.ArrayList

foreach ($item in $revisar) {
  $deputadoId = [string]$item.deputadoId

  if (-not $cacheDeputados.ContainsKey($deputadoId)) {
    try {
      $url = "https://dadosabertos.camara.leg.br/api/v2/deputados/$deputadoId"
      $resposta = Invoke-RestMethod -Uri $url
      $cacheDeputados[$deputadoId] = [string]$resposta.dados.nomeCivil
    }
    catch {
      $cacheDeputados[$deputadoId] = ""
    }
  }

  $nomeCivil = $cacheDeputados[$deputadoId]

  $nomeCivilNormalizado = Normalizar-Nome $nomeCivil
  $nomeTseNormalizado = Normalizar-Nome $item.nomeCompleto

  $registro = [pscustomobject]@{
    candidaturaId = $item.candidaturaId
    nomeUrna = $item.nomeUrna
    nomeCompleto = $item.nomeCompleto
    cargo2026 = $item.cargo2026
    uf2026 = $item.uf2026
    partido2026 = $item.partido2026
    deputadoId = $item.deputadoId
    nomeCamara = $item.nomeCamara
    nomeCivilCamara = $nomeCivil
    ufCamara = $item.ufCamara
    voto = $item.voto
  }

  if (
    $nomeCivilNormalizado -and
    $nomeCivilNormalizado -eq $nomeTseNormalizado
  ) {
    [void]$confirmados.Add($registro)
  }
  else {
    [void]$naoConfirmados.Add($registro)
  }
}

$confirmados |
  Export-Csv $saidaConfirmados -NoTypeInformation -Encoding UTF8

$naoConfirmados |
  Export-Csv $saidaRejeitados -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "Validação por nome civil concluída."
Write-Host "Confirmados:" $confirmados.Count
Write-Host "Não confirmados:" $naoConfirmados.Count
Write-Host ""

$confirmados |
  Select-Object candidaturaId, nomeUrna, nomeCivilCamara, ufCamara, uf2026, voto |
  Format-Table -AutoSize

$ErrorActionPreference = "Stop"

$arquivoVotos = Join-Path $PSScriptRoot "..\data\eleicoes\camara\votacoesVotos-2026.csv"
$arquivoCandidatos = Join-Path $PSScriptRoot "..\data\eleicoes\gerado\candidaturas-2026.json"
$arquivoSaida = Join-Path $PSScriptRoot "..\data\eleicoes\camara\cruzamento-pec221-2026.csv"

$idVotacao = "2233802-424"

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

Write-Host "Carregando candidaturas..."
$candidatos = Get-Content $arquivoCandidatos -Raw | ConvertFrom-Json

Write-Host "Criando índice de nomes..."
$indice = @{}

foreach ($candidato in $candidatos) {
  $nomes = @(
    (Normalizar-Nome $candidato.nomeUrna),
    (Normalizar-Nome $candidato.nomeCompleto)
  ) | Where-Object { $_ }

  foreach ($nome in $nomes) {
    if (-not $indice.ContainsKey($nome)) {
      $indice[$nome] = New-Object System.Collections.ArrayList
    }

    [void]$indice[$nome].Add($candidato)
  }
}

Write-Host "Carregando votos da PEC..."
$votos = Import-Csv $arquivoVotos -Delimiter ";" |
  Where-Object { $_.idVotacao -eq $idVotacao }

Write-Host "Cruzando dados..."
$resultados = New-Object System.Collections.ArrayList

foreach ($voto in $votos) {
  $nomeCamara = Normalizar-Nome $voto.deputado_nome

  if ($indice.ContainsKey($nomeCamara)) {
    foreach ($candidato in $indice[$nomeCamara]) {
      [void]$resultados.Add(
        [pscustomobject]@{
          candidaturaId = $candidato.id
          nomeUrna = $candidato.nomeUrna
          nomeCompleto = $candidato.nomeCompleto
          cargo2026 = $candidato.cargo
          uf2026 = $candidato.uf
          partido2026 = $candidato.siglaPartido
          nomeCamara = $voto.deputado_nome
          deputadoId = $voto.deputado_id
          voto = $voto.voto
        }
      )
    }
  }
}

$resultados |
  Sort-Object uf2026, nomeUrna |
  Export-Csv $arquivoSaida -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "Cruzamento concluído."
Write-Host "Total encontrado:" $resultados.Count
Write-Host ""

$resultados |
  Group-Object voto |
  Select-Object Name, Count |
  Format-Table -AutoSize

Write-Host ""
Write-Host "Arquivo:"
Write-Host $arquivoSaida

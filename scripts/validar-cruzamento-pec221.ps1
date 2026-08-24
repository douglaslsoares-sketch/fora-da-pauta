$ErrorActionPreference = "Stop"

$arquivoCruzamento = Join-Path $PSScriptRoot "..\data\eleicoes\camara\cruzamento-pec221-2026.csv"
$arquivoVotos = Join-Path $PSScriptRoot "..\data\eleicoes\camara\votacoesVotos-2026.csv"

$saidaValidado = Join-Path $PSScriptRoot "..\data\eleicoes\camara\cruzamento-validado.csv"
$saidaRevisar = Join-Path $PSScriptRoot "..\data\eleicoes\camara\cruzamento-revisar.csv"

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

Write-Host "Carregando cruzamento..."
$cruzamento = Import-Csv $arquivoCruzamento

Write-Host "Carregando votos oficiais..."
$votos = Import-Csv $arquivoVotos -Delimiter ";" |
  Where-Object { $_.idVotacao -eq $idVotacao }

$votosPorDeputado = @{}

foreach ($voto in $votos) {
  $votosPorDeputado[[string]$voto.deputado_id] = $voto
}

$validados = New-Object System.Collections.ArrayList
$revisar = New-Object System.Collections.ArrayList

foreach ($item in $cruzamento) {
  $deputadoId = [string]$item.deputadoId

  if (-not $votosPorDeputado.ContainsKey($deputadoId)) {
    $item | Add-Member -NotePropertyName motivoRevisao -NotePropertyValue "Deputado não localizado na votação oficial"
    [void]$revisar.Add($item)
    continue
  }

  $votoOficial = $votosPorDeputado[$deputadoId]

  $nomeCamara = Normalizar-Nome $item.nomeCamara
  $nomeUrna = Normalizar-Nome $item.nomeUrna
  $nomeCompleto = Normalizar-Nome $item.nomeCompleto

  $nomeConfere =
    ($nomeCamara -eq $nomeUrna) -or
    ($nomeCamara -eq $nomeCompleto)

  $ufConfere =
    ([string]$item.uf2026 -eq [string]$votoOficial.deputado_siglaUf)

  if ($nomeConfere -and $ufConfere) {
    $item | Add-Member -NotePropertyName ufCamara -NotePropertyValue $votoOficial.deputado_siglaUf
    $item | Add-Member -NotePropertyName statusValidacao -NotePropertyValue "validado"
    [void]$validados.Add($item)
  }
  else {
    $motivos = @()

    if (-not $nomeConfere) {
      $motivos += "Nome parlamentar não bate exatamente"
    }

    if (-not $ufConfere) {
      $motivos += "UF da candidatura difere da UF do deputado"
    }

    $item | Add-Member -NotePropertyName ufCamara -NotePropertyValue $votoOficial.deputado_siglaUf
    $item | Add-Member -NotePropertyName motivoRevisao -NotePropertyValue ($motivos -join "; ")
    [void]$revisar.Add($item)
  }
}

$validados |
  Sort-Object uf2026, nomeUrna |
  Export-Csv $saidaValidado -NoTypeInformation -Encoding UTF8

$revisar |
  Sort-Object uf2026, nomeUrna |
  Export-Csv $saidaRevisar -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "Validação concluída."
Write-Host "Validados automaticamente:" $validados.Count
Write-Host "Precisam de revisão:" $revisar.Count

Write-Host ""
Write-Host "Votos entre os validados:"
$validados |
  Group-Object voto |
  Select-Object Name, Count |
  Format-Table -AutoSize

Write-Host ""
Write-Host "Arquivos gerados:"
Write-Host $saidaValidado
Write-Host $saidaRevisar

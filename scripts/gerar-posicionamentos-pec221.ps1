$ErrorActionPreference = "Stop"

$arquivoValidado = Join-Path $PSScriptRoot "..\data\eleicoes\camara\cruzamento-validado-final.csv"
$arquivoManual = Join-Path $PSScriptRoot "..\data\eleicoes\posicionamentos.ts"
$arquivoSaida = Join-Path $PSScriptRoot "..\data\eleicoes\posicionamentos-pec221-gerados.ts"

$verificadoEm = "2026-08-17"
$dataVotacao = "2026-05-27"
$proposicao = "PEC 221/2019"
$urlFonte = "https://dadosabertos.camara.leg.br/api/v2/votacoes/2233802-424/votos"

Write-Host "Carregando cruzamentos validados..."
$registros = Import-Csv $arquivoValidado

Write-Host "Identificando registros já cadastrados manualmente..."
$manual = [System.IO.File]::ReadAllText($arquivoManual)

$idsManuais = @{}

[regex]::Matches(
  $manual,
  'candidaturaId:\s*"([^"]+)"'
) | ForEach-Object {
  $idsManuais[$_.Groups[1].Value] = $true
}

$automaticos = @(
  $registros |
    Where-Object {
      ($_.voto -eq "Sim" -or $_.voto -eq "Não") -and
      -not $idsManuais.ContainsKey([string]$_.candidaturaId)
    }
)

# Remove duplicidades da mesma candidatura
$automaticos = @(
  $automaticos |
    Group-Object candidaturaId |
    ForEach-Object {
      $_.Group | Select-Object -First 1
    }
)

function Escapar([string]$texto) {
  if ($null -eq $texto) {
    return ""
  }

  return $texto.Replace("\", "\\").Replace('"', '\"')
}

$linhas = New-Object System.Collections.Generic.List[string]

$linhas.Add('import type { Posicionamento } from "./tipos";')
$linhas.Add("")
$linhas.Add("/*")
$linhas.Add(" * ARQUIVO GERADO AUTOMATICAMENTE.")
$linhas.Add(" *")
$linhas.Add(" * Fonte: votação nominal da PEC 221/2019 na Câmara dos Deputados.")
$linhas.Add(" * Não editar manualmente. Rode novamente o script gerador.")
$linhas.Add(" */")
$linhas.Add("export const posicionamentosGerados: Posicionamento[] = [")

foreach ($item in $automaticos) {
  $id = [string]$item.candidaturaId
  $nome = Escapar $item.nomeUrna

  if ($item.voto -eq "Sim") {
    $posicao = "favoravel"
    $resultado = "sim"
    $rotulo = "favorável"
    $resumo = "Votou Sim na votação nominal da PEC 221/2019 sobre o fim da escala 6x1."
  }
  else {
    $posicao = "contrario"
    $resultado = "nao"
    $rotulo = "contrário"
    $resumo = "Votou Não na votação nominal da PEC 221/2019 sobre o fim da escala 6x1."
  }

  $linhas.Add("  {")
  $linhas.Add("    id: `"auto-pec221-$id`",")
  $linhas.Add("    candidaturaId: `"$id`",")
  $linhas.Add('    pautaId: "fim-escala-6x1",')
  $linhas.Add("    posicao: `"$posicao`",")
  $linhas.Add("    resumo: `"$resumo`",")
  $linhas.Add("    fontes: [")
  $linhas.Add("      {")
  $linhas.Add('        titulo: "Votação nominal da PEC 221/2019",')
  $linhas.Add("        url: `"$urlFonte`",")
  $linhas.Add('        veiculoOuInstituicao: "Câmara dos Deputados",')
  $linhas.Add("        publicadoEm: `"$dataVotacao`",")
  $linhas.Add("        verificadoEm: `"$verificadoEm`",")
  $linhas.Add("      },")
  $linhas.Add("    ],")
  $linhas.Add("    evidencias: [")
  $linhas.Add("      {")
  $linhas.Add('        tipo: "voto-nominal",')
  $linhas.Add("        titulo: `"Voto nominal $rotulo na PEC 221/2019`",")
  $linhas.Add("        descricao: `"$nome $resumo`",")
  $linhas.Add("        resultadoVoto: `"$resultado`",")
  $linhas.Add("        proposicao: `"$proposicao`",")
  $linhas.Add("        data: `"$dataVotacao`",")
  $linhas.Add("        fonte: {")
  $linhas.Add('          titulo: "Votação nominal da PEC 221/2019",')
  $linhas.Add("          url: `"$urlFonte`",")
  $linhas.Add('          veiculoOuInstituicao: "Câmara dos Deputados",')
  $linhas.Add("          publicadoEm: `"$dataVotacao`",")
  $linhas.Add("          verificadoEm: `"$verificadoEm`",")
  $linhas.Add("        },")
  $linhas.Add("      },")
  $linhas.Add("    ],")
  $linhas.Add("    atualizadoEm: `"$verificadoEm`",")
  $linhas.Add("  },")
}

$linhas.Add("];")

$utf8SemBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllLines(
  $arquivoSaida,
  $linhas,
  $utf8SemBom
)

Write-Host ""
Write-Host "Geração concluída."
Write-Host "Validados recebidos:" $registros.Count
Write-Host "Já existentes manualmente:" $idsManuais.Count
Write-Host "Posicionamentos automáticos gerados:" $automaticos.Count
Write-Host ""

$automaticos |
  Group-Object voto |
  Select-Object Name, Count |
  Format-Table -AutoSize

Write-Host "Arquivo:"
Write-Host $arquivoSaida

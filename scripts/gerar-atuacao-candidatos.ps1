$ErrorActionPreference = "Stop"

$raiz =
    Resolve-Path (
        Join-Path $PSScriptRoot ".."
    )

$dirGerado =
    Join-Path `
        $raiz `
        "data\eleicoes\gerado"

$arquivoIdentidades =
    Join-Path `
        $dirGerado `
        "identidades-politicas.json"

$arquivoVotos =
    Join-Path `
        $dirGerado `
        "atuacao-votacoes-politicas.json"

$arquivoContextos =
    Join-Path `
        $dirGerado `
        "contexto-votacoes-2026.json"

$arquivoProposicoes =
    Join-Path `
        $dirGerado `
        "atuacao-proposicoes-politicas-completa.json"

$saidaFinal =
    Join-Path `
        $dirGerado `
        "atuacao-candidatos"

$timestamp =
    Get-Date -Format "yyyyMMdd-HHmmss"

$saidaTemporaria =
    Join-Path `
        $dirGerado `
        "atuacao-candidatos.tmp-$timestamp"

foreach ($arquivo in @(
    $arquivoIdentidades,
    $arquivoVotos,
    $arquivoContextos,
    $arquivoProposicoes
)) {

    if (-not (Test-Path -LiteralPath $arquivo)) {
        throw "Arquivo não encontrado: $arquivo"
    }
}

Write-Host ""
Write-Host "1. Carregando identidades..." -ForegroundColor Yellow

$identidades =
    Get-Content `
        -LiteralPath $arquivoIdentidades `
        -Encoding UTF8 `
        -Raw |
    ConvertFrom-Json

Write-Host "Identidades:" $identidades.Count

Write-Host ""
Write-Host "2. Carregando votações..." -ForegroundColor Yellow

$registrosVotos =
    Get-Content `
        -LiteralPath $arquivoVotos `
        -Encoding UTF8 `
        -Raw |
    ConvertFrom-Json

Write-Host "Pessoas com votos:" $registrosVotos.Count

Write-Host ""
Write-Host "3. Carregando contexto das votações..." -ForegroundColor Yellow

$contextos =
    Get-Content `
        -LiteralPath $arquivoContextos `
        -Encoding UTF8 `
        -Raw |
    ConvertFrom-Json

Write-Host "Contextos:" $contextos.Count

Write-Host ""
Write-Host "4. Carregando proposições..." -ForegroundColor Yellow

$registrosProposicoes =
    Get-Content `
        -LiteralPath $arquivoProposicoes `
        -Encoding UTF8 `
        -Raw |
    ConvertFrom-Json

Write-Host "Pessoas com proposições:" $registrosProposicoes.Count

# ============================================================
# MAPAS DE ACESSO
# ============================================================

Write-Host ""
Write-Host "5. Construindo índices..." -ForegroundColor Yellow

$mapaVotos = @{}

foreach ($registro in $registrosVotos) {

    $mapaVotos[
        [string]$registro.pessoaPoliticaId
    ] = $registro
}

$mapaProposicoes = @{}

foreach ($registro in $registrosProposicoes) {

    $mapaProposicoes[
        [string]$registro.pessoaPoliticaId
    ] = $registro
}

$mapaContextos = @{}

foreach ($contexto in $contextos) {

    $mapaContextos[
        [string]$contexto.votacaoId
    ] = $contexto
}

# ============================================================
# PASTA TEMPORÁRIA
# ============================================================

if (Test-Path -LiteralPath $saidaTemporaria) {

    Remove-Item `
        -LiteralPath $saidaTemporaria `
        -Recurse `
        -Force
}

New-Item `
    -ItemType Directory `
    -Path $saidaTemporaria `
    -Force |
    Out-Null

$utf8SemBom =
    New-Object System.Text.UTF8Encoding($false)

$agora =
    Get-Date

$atualizadoEm =
    $agora.ToString(
        "yyyy-MM-ddTHH:mm:ss"
    )

$quantidadeArquivos = 0
$totalVotos = 0
$totalProposicoes = 0
$arquivosAlterados = 0
$arquivosSemMudanca = 0

# Os arquivos atualmente publicados são usados apenas
# para preservar atualizadoEm quando o conteúdo político
# daquele candidato não mudou.
$saidaAnterior = $saidaFinal

function Descrever-Papel {
    param($Papel)

    if ($null -eq $Papel) {
        return "Vínculo oficial de autoria"
    }

    if ($Papel.primeiroSignatario -eq $true) {
        return "Vínculo oficial de autoria · primeira assinatura"
    }

    if (
        -not [string]::IsNullOrWhiteSpace(
            [string]$Papel.ordemAssinatura
        )
    ) {
        return (
            "Vínculo oficial de autoria · assinatura nº " +
            [string]$Papel.ordemAssinatura
        )
    }

    return "Vínculo oficial de autoria"
}

# ============================================================
# GERAR UM ARQUIVO POR CANDIDATURA 2026
# ============================================================

Write-Host ""
Write-Host "6. Gerando arquivos por candidatura..." -ForegroundColor Yellow

foreach ($identidade in $identidades) {

    $pessoaId =
        [string]$identidade.pessoaPoliticaId

    $candidaturas2026 =
        @(
            $identidade.candidaturas |
            Where-Object {
                [int]$_.eleicao -eq 2026
            }
        )

    if ($candidaturas2026.Count -eq 0) {
        continue
    }

    $votosPessoa = @()

    if ($mapaVotos.ContainsKey($pessoaId)) {

        $registroVotos =
            $mapaVotos[$pessoaId]

        $votosOrdenados =
            @(
                $registroVotos.votacoes |
                Sort-Object `
                    @{
                        Expression = {
                            if ($_.dataHora) {
                                [string]$_.dataHora
                            } else {
                                [string]$_.data
                            }
                        }
                        Descending = $true
                    }
            )

        foreach ($voto in $votosOrdenados) {

            $descricao =
                [string]$voto.descricao

            $votacaoId =
                [string]$voto.votacaoId

            if ($mapaContextos.ContainsKey($votacaoId)) {

                $contexto =
                    $mapaContextos[$votacaoId]

                if (
                    -not [string]::IsNullOrWhiteSpace(
                        [string]$contexto.descricao
                    )
                ) {
                    $descricao =
                        [string]$contexto.descricao
                }
            }

            $votosPessoa +=
                [ordered]@{
                    votacaoId =
                        $votacaoId

                    data =
                        [string]$voto.data

                    dataHora =
                        [string]$voto.dataHora

                    voto =
                        [string]$voto.voto

                    descricao =
                        $descricao

                    fonte =
                        [ordered]@{
                            titulo =
                                [string]$voto.fonte.titulo

                            url =
                                [string]$voto.fonte.url
                        }
                }
        }
    }

    $proposicoesPessoa = @()

    if ($mapaProposicoes.ContainsKey($pessoaId)) {

        $registroProposicoes =
            $mapaProposicoes[$pessoaId]

        $proposicoesValidas =
            @(
                $registroProposicoes.proposicoes |
                Where-Object {
                    $_.papelLegislativo.vinculoOficial -eq
                    "autoria-oficial"
                } |
                Sort-Object `
                    @{
                        Expression = {
                            [string]$_.data
                        }
                        Descending = $true
                    }
            )

        foreach ($item in $proposicoesValidas) {

            $proposicoesPessoa +=
                [ordered]@{
                    proposicaoId =
                        [string]$item.proposicaoId

                    identificacao =
                        [string]$item.identificacao

                    data =
                        [string]$item.data

                    descricaoTipo =
                        [string]$item.descricaoTipo

                    ementa =
                        [string]$item.ementa

                    papel =
                        Descrever-Papel `
                            $item.papelLegislativo

                    fonte =
                        [ordered]@{
                            titulo =
                                [string]$item.fonte.titulo

                            url =
                                [string]$item.fonte.url
                        }
                }
        }
    }

    if (
        $votosPessoa.Count -eq 0 -and
        $proposicoesPessoa.Count -eq 0
    ) {
        continue
    }

    foreach ($candidatura in $candidaturas2026) {

        $candidaturaId =
            [string]$candidatura.candidaturaId

        # ----------------------------------------------------
        # CONTEÚDO POLÍTICO SEM TIMESTAMP
        # ----------------------------------------------------

        $conteudoPolitico =
            [ordered]@{
                candidaturaId =
                    $candidaturaId

                totalVotacoes =
                    $votosPessoa.Count

                totalProposicoes =
                    $proposicoesPessoa.Count

                votacoes =
                    $votosPessoa

                proposicoes =
                    $proposicoesPessoa
            }

        $jsonPoliticoNovo =
            $conteudoPolitico |
            ConvertTo-Json `
                -Depth 12 `
                -Compress

        $arquivoAnterior =
            Join-Path `
                $saidaAnterior `
                "$candidaturaId.json"

        $houveMudanca =
            $true

        $atualizadoEmCandidato =
            $atualizadoEm

        if (
            Test-Path `
                -LiteralPath $arquivoAnterior
        ) {

            try {

                $anterior =
                    Get-Content `
                        -LiteralPath $arquivoAnterior `
                        -Encoding UTF8 `
                        -Raw |
                    ConvertFrom-Json

                $politicoAnterior =
                    [ordered]@{
                        candidaturaId =
                            [string]$anterior.candidaturaId

                        totalVotacoes =
                            [int]$anterior.totalVotacoes

                        totalProposicoes =
                            [int]$anterior.totalProposicoes

                        votacoes =
                            @($anterior.votacoes)

                        proposicoes =
                            @($anterior.proposicoes)
                    }

                $jsonPoliticoAnterior =
                    $politicoAnterior |
                    ConvertTo-Json `
                        -Depth 12 `
                        -Compress

                if (
                    $jsonPoliticoAnterior -eq
                    $jsonPoliticoNovo
                ) {

                    $houveMudanca =
                        $false

                    if (
                        -not [string]::IsNullOrWhiteSpace(
                            [string]$anterior.atualizadoEm
                        )
                    ) {
                        $atualizadoEmCandidato =
                            [string]$anterior.atualizadoEm
                    }
                }

            }
            catch {

                # Se o arquivo anterior estiver inválido,
                # a nova versão será produzida normalmente.
                $houveMudanca =
                    $true
            }
        }

        $objeto =
            [ordered]@{
                candidaturaId =
                    $candidaturaId

                atualizadoEm =
                    $atualizadoEmCandidato

                totalVotacoes =
                    $votosPessoa.Count

                totalProposicoes =
                    $proposicoesPessoa.Count

                votacoes =
                    $votosPessoa

                proposicoes =
                    $proposicoesPessoa
            }

        $json =
            $objeto |
            ConvertTo-Json `
                -Depth 12 `
                -Compress

        $destino =
            Join-Path `
                $saidaTemporaria `
                "$candidaturaId.json"

        [System.IO.File]::WriteAllText(
            $destino,
            $json,
            $utf8SemBom
        )

        if ($houveMudanca) {
            $arquivosAlterados++
        }
        else {
            $arquivosSemMudanca++
        }

        $quantidadeArquivos++

        $totalVotos +=
            $votosPessoa.Count

        $totalProposicoes +=
            $proposicoesPessoa.Count
    }
}

# ============================================================
# METADADOS
# ============================================================

$metadata =
    [ordered]@{
        verificadoEm =
            $atualizadoEm

        candidaturasComAtuacao =
            $quantidadeArquivos

        candidaturasAlteradas =
            $arquivosAlterados

        candidaturasSemMudanca =
            $arquivosSemMudanca

        votacoesDistribuidas =
            $totalVotos

        proposicoesDistribuidas =
            $totalProposicoes
    }

$metadataJson =
    $metadata |
    ConvertTo-Json `
        -Depth 5

[System.IO.File]::WriteAllText(
    (
        Join-Path `
            $saidaTemporaria `
            "_metadata.json"
    ),
    $metadataJson,
    $utf8SemBom
)

# ============================================================
# TROCA SOMENTE DEPOIS DE GERAR TUDO
# ============================================================

Write-Host ""
Write-Host "7. Publicando conjunto compacto..." -ForegroundColor Yellow

if (Test-Path -LiteralPath $saidaFinal) {

    Remove-Item `
        -LiteralPath $saidaFinal `
        -Recurse `
        -Force
}

Move-Item `
    -LiteralPath $saidaTemporaria `
    -Destination $saidaFinal

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " ATUAÇÃO COMPACTA GERADA" -ForegroundColor Green
Write-Host "============================================================"
Write-Host ""
Write-Host "Arquivos de candidaturas:" $quantidadeArquivos
Write-Host "Candidaturas alteradas:" $arquivosAlterados
Write-Host "Candidaturas sem mudança:" $arquivosSemMudanca
Write-Host "Votações distribuídas:" $totalVotos
Write-Host "Proposições distribuídas:" $totalProposicoes
Write-Host "Fonte verificada em:" $atualizadoEm
Write-Host ""
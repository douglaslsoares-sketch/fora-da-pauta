$ErrorActionPreference = "Stop"

$inicio =
    Get-Date

$raiz =
    Resolve-Path (
        Join-Path $PSScriptRoot ".."
    )

$dirCamara =
    Join-Path `
        $raiz `
        "data\eleicoes\camara"

$dirGerado =
    Join-Path `
        $raiz `
        "data\eleicoes\gerado"

function Etapa {
    param(
        [string]$Texto
    )

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " $Texto" -ForegroundColor Cyan
    Write-Host "============================================================"
}

function Executar-Script {
    param(
        [string]$Nome
    )

    $arquivo =
        Join-Path `
            $PSScriptRoot `
            $Nome

    if (-not (Test-Path -LiteralPath $arquivo)) {
        throw "Script não encontrado: $arquivo"
    }

    & powershell.exe `
        -NoProfile `
        -ExecutionPolicy Bypass `
        -File $arquivo

    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao executar $Nome. Código: $LASTEXITCODE"
    }
}

# ============================================================
# 0. ENTRADAS CANÔNICAS
# ============================================================

Etapa "0/6 - Validando entradas canônicas"

$entradas = @(
    (
        Join-Path `
            $dirGerado `
            "identidades-politicas.json"
    ),
    (
        Join-Path `
            $dirGerado `
            "vinculos-camara-identidades.json"
    ),
    (
        Join-Path `
            $dirGerado `
            "historico-institucional-politico.json"
    ),
    (
        Join-Path `
            $dirGerado `
            "proposicoes-complementares-api.json"
    )
)

foreach ($entrada in $entradas) {

    if (-not (Test-Path -LiteralPath $entrada)) {
        throw "Entrada canônica ausente: $entrada"
    }

    if ((Get-Item -LiteralPath $entrada).Length -eq 0) {
        throw "Entrada canônica vazia: $entrada"
    }

    Write-Host "OK:" `
        (Split-Path -Leaf $entrada)
}

# ============================================================
# 1. VOTOS NOMINAIS
# ============================================================

Etapa "1/6 - Baixando votos nominais da Câmara"

New-Item `
    -ItemType Directory `
    -Path $dirCamara `
    -Force |
    Out-Null

$urlVotos =
    "https://dadosabertos.camara.leg.br/arquivos/votacoesVotos/csv/votacoesVotos-2026.csv"

$arquivoVotos =
    Join-Path `
        $dirCamara `
        "votacoesVotos-2026.csv"

$tmpVotos =
    "$arquivoVotos.tmp"

if (Test-Path -LiteralPath $tmpVotos) {
    Remove-Item `
        -LiteralPath $tmpVotos `
        -Force
}

Invoke-WebRequest `
    -Uri $urlVotos `
    -OutFile $tmpVotos `
    -UseBasicParsing

if (
    -not (Test-Path -LiteralPath $tmpVotos) -or
    (Get-Item -LiteralPath $tmpVotos).Length -lt 1000
) {
    throw "Download de votações inválido."
}

Move-Item `
    -LiteralPath $tmpVotos `
    -Destination $arquivoVotos `
    -Force

Write-Host "Votos atualizados."
Write-Host "Bytes:" `
    (Get-Item -LiteralPath $arquivoVotos).Length

# ============================================================
# 2. VOTAÇÕES POR PESSOA
# ============================================================

Etapa "2/6 - Processando votações"

Executar-Script `
    "gerar-atuacao-votacoes-politicas.ps1"

# ============================================================
# 3. CONTEXTO DAS VOTAÇÕES
# ============================================================

Etapa "3/6 - Enriquecendo contexto das votações"

Executar-Script `
    "enriquecer-contexto-votacoes-politicas.ps1"

# ============================================================
# 4. PROPOSIÇÕES
# ============================================================

Etapa "4/6 - Processando proposições"

Executar-Script `
    "gerar-atuacao-proposicoes-politicas.ps1"

# ============================================================
# 5. CATÁLOGO COMPLEMENTAR
# ============================================================

Etapa "5/6 - Atualizando catálogo complementar"

Executar-Script `
    "completar-catalogo-proposicoes-politicas.ps1"

# ============================================================
# 6. ARQUIVOS COMPACTOS
# ============================================================

Etapa "6/6 - Gerando arquivos por candidatura"

Executar-Script `
    "gerar-atuacao-candidatos.ps1"

$dirCompactos =
    Join-Path `
        $dirGerado `
        "atuacao-candidatos"

$arquivosCompactos =
    @(
        Get-ChildItem `
            -LiteralPath $dirCompactos `
            -Filter "*.json" `
            -File |
        Where-Object {
            $_.Name -ne "_metadata.json"
        }
    )

if ($arquivosCompactos.Count -lt 100) {
    throw "Quantidade inesperada de arquivos compactos: $($arquivosCompactos.Count)"
}

$metadata =
    Join-Path `
        $dirCompactos `
        "_metadata.json"

if (-not (Test-Path -LiteralPath $metadata)) {
    throw "Metadata da atualização não foi produzida."
}

$meta =
    Get-Content `
        -LiteralPath $metadata `
        -Encoding UTF8 `
        -Raw |
    ConvertFrom-Json

$fim =
    Get-Date

$duracao =
    $fim - $inicio

Etapa "ATUALIZAÇÃO DA CÂMARA CONCLUÍDA"

Write-Host "Candidaturas com atuação:" `
    $arquivosCompactos.Count

Write-Host "Candidaturas alteradas:" `
    $meta.candidaturasAlteradas

Write-Host "Candidaturas sem mudança:" `
    $meta.candidaturasSemMudanca

Write-Host "Verificação:" `
    $meta.verificadoEm

Write-Host (
    "Duração: {0:hh\:mm\:ss}" -f $duracao
)
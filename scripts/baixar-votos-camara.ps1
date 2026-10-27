# Download isolado: nao substitui o CSV anterior ate validar arquivo completo.
# curl contorna erros de EOF recorrentes no Invoke-WebRequest (PowerShell 5.1).
param(
    [Parameter(Mandatory = $true)]
    [string]$Destino
)

$ErrorActionPreference = "Stop"
$url = "https://dadosabertos.camara.leg.br/arquivos/votacoesVotos/csv/votacoesVotos-2026.csv"
$tmp = "$Destino.tmp"

if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
    throw "curl.exe indisponivel: dados anteriores preservados."
}

$diretorio = Split-Path -Path $Destino -Parent
if (-not (Test-Path -LiteralPath $diretorio)) {
    New-Item -ItemType Directory -Path $diretorio -Force | Out-Null
}

try {
    if (Test-Path -LiteralPath $tmp) {
        Remove-Item -LiteralPath $tmp -Force
    }

    # --retry-all-errors reexecuta transferencias interrompidas, mesmo apos HTTP 200.
    & curl.exe --fail --location --retry 4 --retry-all-errors --retry-delay 6 --connect-timeout 30 --max-time 180 --silent --show-error --output $tmp -- $url

    if ($LASTEXITCODE -ne 0) {
        throw "Download de votos incompleto. Codigo curl: $LASTEXITCODE"
    }
    if (-not (Test-Path -LiteralPath $tmp) -or
        (Get-Item -LiteralPath $tmp).Length -lt 1000) {
        throw "CSV de votos ausente ou pequeno demais."
    }

    $cabecalho = Get-Content -LiteralPath $tmp -TotalCount 1 -Encoding UTF8
    $colunas = @($cabecalho.TrimStart([char]0xFEFF).Split(";") |
        ForEach-Object { $_.Trim('"') })
    Write-Host "Cabecalho CSV recebido (colunas): $($colunas -join ', ')"
    Write-Host "Tamanho CSV recebido: $((Get-Item -LiteralPath $tmp).Length) bytes"
    $grupos = @(
        ,@("idVotacao", "votacao_id", "id"),
        ,@("deputado_id", "deputadoId", "idDeputado"),
        ,@("dataHoraVoto", "dataHora", "data"),
        ,@("voto", "tipoVoto")
    )

    foreach ($grupo in $grupos) {
        if (@($grupo | Where-Object { $colunas -contains $_ }).Count -eq 0) {
            throw "CSV de votos com cabecalho inesperado ou incompleto."
        }
    }

    Move-Item -LiteralPath $tmp -Destination $Destino -Force -ErrorAction Stop
    Write-Host "CSV de votos validado. Bytes: $((Get-Item -LiteralPath $Destino).Length)"
}
finally {
    if (Test-Path -LiteralPath $tmp) {
        Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
    }
}

import json
import shutil
import tempfile
import urllib.request
import zipfile
from datetime import datetime
from pathlib import Path

import xlrd

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "investimento.json"

ZIP_URL = (
    "https://ftp.ibge.gov.br/Contas_Nacionais/"
    "Contas_Nacionais_Trimestrais/"
    "Tabelas_Completas/Tab_Compl_CNT.zip"
)

ABA = "Valores Correntes"
COL_PERIODO = 0
NOME_COL_PIB = "PIB"
NOME_COL_FBCF = "Formação Bruta de Capital Fixo"


def baixar_arquivo(url, destino):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "ForaDaPauta/1.0"}
    )

    with urllib.request.urlopen(req, timeout=60) as response:
        with destino.open("wb") as f:
            shutil.copyfileobj(response, f)


def media(valores):
    if not valores:
        return None

    return round(sum(valores) / len(valores), 1)


def carregar_anterior():
    if not OUT.exists():
        return {}

    with OUT.open("r", encoding="utf-8") as f:
        dados = json.load(f)

    return {
        item["ano"]: item["valor"]
        for item in dados.get("anos", [])
        if item.get("valor") is not None
    }


print("Atualizando taxa de investimento...")
print()

anterior = carregar_anterior()

with tempfile.TemporaryDirectory() as tmpdir:
    tmpdir = Path(tmpdir)

    zip_path = tmpdir / "Tab_Compl_CNT.zip"
    extract_dir = tmpdir / "extraido"

    print("Baixando tabelas completas do IBGE...")
    baixar_arquivo(ZIP_URL, zip_path)

    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(extract_dir)

    planilhas = list(extract_dir.rglob("*.xls"))

    if not planilhas:
        raise RuntimeError(
            "Nenhuma planilha XLS encontrada no ZIP oficial."
        )

    planilha = planilhas[0]

    print("Planilha encontrada:", planilha.name)

    workbook = xlrd.open_workbook(planilha)
    sheet = workbook.sheet_by_name(ABA)

    headers = [
        str(sheet.cell_value(2, c)).strip()
        for c in range(sheet.ncols)
    ]

    try:
        col_pib = headers.index(NOME_COL_PIB)
        col_fbcf = headers.index(NOME_COL_FBCF)
    except ValueError as exc:
        raise RuntimeError(
            "Colunas de PIB/FBCF não encontradas."
        ) from exc

    anos = []

    for r in range(3, sheet.nrows):
        periodo = sheet.cell_value(r, COL_PERIODO)

        if not isinstance(periodo, float):
            continue

        if not periodo.is_integer():
            continue

        ano = int(periodo)

        if ano < 2019:
            continue

        if ano > datetime.now().year:
            continue

        pib = sheet.cell_value(r, col_pib)
        fbcf = sheet.cell_value(r, col_fbcf)

        try:
            pib = float(pib)
            fbcf = float(fbcf)
        except (TypeError, ValueError):
            continue

        if pib <= 0:
            continue

        taxa = round((fbcf / pib) * 100, 1)

        registro = {
            "ano": ano,
            "governo": (
                "bolsonaro"
                if ano <= 2022
                else "lula"
            ),
            "valor": taxa,
            "tipo": "anual-fechado",
            "origem": (
                "IBGE - Contas Nacionais Trimestrais, "
                "Tabelas Completas, aba Valores Correntes"
            )
        }

        if ano == 2020:
            registro["contexto"] = "Pandemia de COVID-19"

        anos.append(registro)

#
# SERIE TRIMESTRAL PARA COMPARACAO DO PERIODO DISPONIVEL
#

trimestres_investimento = []

for r in range(3, sheet.nrows):
    periodo = sheet.cell_value(r, COL_PERIODO)

    if not isinstance(periodo, str):
        continue

    if "." not in periodo:
        continue

    ano_texto = periodo.split(".", 1)[0]

    try:
        ano_trimestre = int(ano_texto)
    except ValueError:
        continue

    if ano_trimestre < 2019 or ano_trimestre > datetime.now().year:
        continue

    pib = sheet.cell_value(r, col_pib)
    fbcf = sheet.cell_value(r, col_fbcf)

    try:
        pib = float(pib)
        fbcf = float(fbcf)
    except (TypeError, ValueError):
        continue

    if pib <= 0:
        continue

    taxa = round((fbcf / pib) * 100, 2)

    trimestres_investimento.append({
        "periodoCodigo": periodo,
        "ano": ano_trimestre,
        "valor": taxa
    })


def ordem_trimestre(item):
    ano, trimestre = item["periodoCodigo"].split(".", 1)

    ordem = {
        "I": 1,
        "II": 2,
        "III": 3,
        "IV": 4,
    }

    return (
        int(ano),
        ordem.get(trimestre, 99)
    )


trimestres_investimento.sort(
    key=ordem_trimestre
)

trimestres_bolsonaro = [
    item
    for item in trimestres_investimento
    if 2019 <= item["ano"] <= 2022
]

trimestres_lula = [
    item
    for item in trimestres_investimento
    if item["ano"] >= 2023
]

if not trimestres_bolsonaro:
    raise RuntimeError(
        "Serie trimestral de investimento de Bolsonaro vazia."
    )

if not trimestres_lula:
    raise RuntimeError(
        "Serie trimestral de investimento de Lula vazia."
    )

media_periodo_bolsonaro = media(
    [item["valor"] for item in trimestres_bolsonaro]
)

media_periodo_lula = media(
    [item["valor"] for item in trimestres_lula]
)

trimestres_2026 = [
    item
    for item in trimestres_investimento
    if item["ano"] == 2026
]

ultimo_2026 = (
    trimestres_2026[-1]
    if trimestres_2026
    else None
)

if ultimo_2026:
    trimestre_nome = {
        "I": "1\u00ba trimestre 2026",
        "II": "2\u00ba trimestre 2026",
        "III": "3\u00ba trimestre 2026",
        "IV": "4\u00ba trimestre 2026",
    }.get(
        ultimo_2026["periodoCodigo"].split(".", 1)[1],
        ultimo_2026["periodoCodigo"]
    )

    anos.append({
        "ano": 2026,
        "governo": "lula",
        "valor": None,
        "tipo": "ano-em-andamento",
        "ultimoDado": {
            "periodoCodigo": ultimo_2026["periodoCodigo"],
            "periodo": trimestre_nome,
            "valor": ultimo_2026["valor"],
        },
        "origem": (
            "IBGE - Contas Nacionais Trimestrais, "
            "Tabelas Completas, aba Valores Correntes"
        )
    })

anos.sort(key=lambda item: item["ano"])

anos = [
    item for item in anos
    if 2019 <= item["ano"] <= 2026
]

if len(anos) != 8:
    raise RuntimeError(
        f"Quantidade inesperada de anos: {len(anos)}"
    )


#
# REVISÕES
#

print()
print("Comparando com a versão anterior...")

revisoes = []

for item in anos:
    ano = item["ano"]
    novo = item["valor"]
    antigo = anterior.get(ano)

    if antigo is None:
        continue

    if abs(antigo - novo) > 0.000001:
        revisoes.append({
            "ano": ano,
            "valorAnterior": antigo,
            "valorNovo": novo
        })

        print(
            f"REVISAO: {ano}: "
            f"{antigo} -> {novo}"
        )

if not revisoes:
    print("Nenhuma revisão histórica detectada.")


bolsonaro_3 = [
    item for item in anos
    if item["ano"] in (2019, 2020, 2021)
]

lula_3 = [
    item for item in anos
    if item["ano"] in (2023, 2024, 2025)
]

if len(bolsonaro_3) != 3:
    raise RuntimeError(
        "Comparação Bolsonaro incompleta."
    )

if len(lula_3) != 3:
    raise RuntimeError(
        "Comparação Lula incompleta."
    )


documento = {
    "id": "investimento",
    "titulo": "Taxa de investimento",
    "unidade": "% do PIB",
    "metodologia": (
        "Taxa de investimento calculada como a Formação Bruta "
        "de Capital Fixo dividida pelo Produto Interno Bruto, "
        "ambos em valores correntes anuais das Contas Nacionais "
        "Trimestrais do IBGE."
    ),
    "fonte": {
        "instituicao": "IBGE",
        "pesquisa": "Contas Nacionais Trimestrais",
        "arquivo": "Tabelas Completas",
        "aba": ABA,
        "url": ZIP_URL
    },
    "anos": anos,
    "comparacaoPeriodoDisponivel": {
        "descricao": "Media da taxa de investimento no periodo disponivel",
        "bolsonaro": {
            "periodo": "2019-2022",
            "media": media_periodo_bolsonaro
        },
        "lula": {
            "periodo": "2023-2026",
            "media": media_periodo_lula,
            "parcial": True,
            "ate": (
                ultimo_2026["periodoCodigo"]
                if ultimo_2026
                else None
            )
        }
    },
    "comparacaoMesmaDuracao": {
        "bolsonaro": {
            "periodo": "2019-2021",
            "media": media(
                [item["valor"] for item in bolsonaro_3]
            )
        },
        "lula": {
            "periodo": "2023-2025",
            "media": media(
                [item["valor"] for item in lula_3]
            )
        }
    },
    "ultimoAnoDisponivel": max(
        item["ano"]
        for item in anos
        if item["valor"] is not None
    ),
    "revisoesDetectadas": revisoes,
    "atualizadoEm": datetime.now().isoformat(
        timespec="seconds"
    )
}


tmp = OUT.with_suffix(".json.tmp")

with tmp.open("w", encoding="utf-8") as f:
    json.dump(
        documento,
        f,
        ensure_ascii=False,
        indent=2
    )

with tmp.open("r", encoding="utf-8") as f:
    teste = json.load(f)

if len(teste["anos"]) != 8:
    raise RuntimeError(
        "Validação final encontrou quantidade errada de anos."
    )

tmp.replace(OUT)

print()
print("Investimento atualizado com sucesso.")
print()

for item in anos:
    print(item["ano"], item["valor"])

print()
print(
    "Bolsonaro 2019-2021 média:",
    documento["comparacaoMesmaDuracao"]
    ["bolsonaro"]["media"],
    "%"
)

print(
    "Lula 2023-2025 média:",
    documento["comparacaoMesmaDuracao"]
    ["lula"]["media"],
    "%"
)

print()
print("Arquivo:", OUT)

import json
import shutil
import tempfile
import urllib.request
import zipfile
from datetime import datetime
from pathlib import Path

import xlrd

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "extrema-pobreza.json"

ZIP_URL = (
    "https://ftp.ibge.gov.br/Indicadores_Sociais/"
    "Sintese_de_Indicadores_Sociais/"
    "Sintese_de_Indicadores_Sociais_2025/"
    "Tabelas/xls/2_Distribuicao_Renda_xls.zip"
)

ARQUIVO = "Tabela 2.18 (Pobr_Geo).xls"
COL_EXTREMA = 2


def baixar(url, destino):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "ForaDaPauta/1.0"}
    )

    with urllib.request.urlopen(req, timeout=60) as response:
        with destino.open("wb") as f:
            shutil.copyfileobj(response, f)


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


print("Atualizando extrema pobreza...")
print()

anterior = carregar_anterior()

with tempfile.TemporaryDirectory() as tmpdir:
    tmpdir = Path(tmpdir)

    zip_path = tmpdir / "renda.zip"
    extract_dir = tmpdir / "extraido"

    print("Baixando planilhas da Síntese de Indicadores Sociais...")
    baixar(ZIP_URL, zip_path)

    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(extract_dir)

    candidatos = list(extract_dir.rglob(ARQUIVO))

    if not candidatos:
        raise RuntimeError(
            f"Arquivo {ARQUIVO} não encontrado."
        )

    planilha = candidatos[0]
    workbook = xlrd.open_workbook(planilha)

    anos = []

    for ano in range(2019, 2025):
        aba = workbook.sheet_by_name(str(ano))

        linha_brasil = None

        for r in range(aba.nrows):
            if str(aba.cell_value(r, 0)).strip() == "Brasil":
                linha_brasil = r
                break

        if linha_brasil is None:
            raise RuntimeError(
                f"Brasil não encontrado na aba {ano}."
            )

        valor = float(
            aba.cell_value(linha_brasil, COL_EXTREMA)
        )

        registro = {
            "ano": ano,
            "governo": (
                "bolsonaro"
                if ano <= 2022
                else "lula"
            ),
            "valor": round(valor, 1),
            "tipo": "anual-fechado",
            "origem": (
                "IBGE - Síntese de Indicadores Sociais, "
                "Tabela 2.18"
            )
        }

        if ano == 2020:
            registro["contexto"] = "Pandemia de COVID-19"

        anos.append(registro)

print()
print("Comparando com a versão anterior...")

revisoes = []

for item in anos:
    antigo = anterior.get(item["ano"])

    if antigo is not None and antigo != item["valor"]:
        revisoes.append({
            "ano": item["ano"],
            "valorAnterior": antigo,
            "valorNovo": item["valor"]
        })

        print(
            f"REVISAO: {item['ano']}: "
            f"{antigo} -> {item['valor']}"
        )

if not revisoes:
    print("Nenhuma revisão histórica detectada.")


documento = {
    "id": "extrema-pobreza",
    "titulo": "População em extrema pobreza",
    "unidade": "%",
    "metodologia": (
        "Proporção de pessoas com rendimento domiciliar "
        "per capita inferior à linha de extrema pobreza "
        "de US$ 2,15 PPC 2017 por dia, utilizada pelo IBGE "
        "com base nos parâmetros do Banco Mundial."
    ),
    "fonte": {
        "instituicao": "IBGE",
        "pesquisa": "Síntese de Indicadores Sociais",
        "tabela": "2.18",
        "linha": "Menos de US$ 2,15 PPC 2017",
        "url": ZIP_URL
    },
    "anos": anos,
    "ultimoAnoDisponivel": max(
        item["ano"] for item in anos
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

if len(teste["anos"]) != 6:
    raise RuntimeError(
        "Quantidade inesperada de anos em extrema pobreza."
    )

tmp.replace(OUT)

print()
print("Extrema pobreza atualizada com sucesso.")
print()

for item in anos:
    print(item["ano"], item["valor"])

print()
print("Arquivo:", OUT)

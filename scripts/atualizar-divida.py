import json
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "divida.json"

BASE_URL = (
    "https://api.bcb.gov.br/dados/serie/"
    "bcdata.sgs.13762/dados"
)

PARAMS = {
    "formato": "json",
    "dataInicial": "01/01/2019",
    "dataFinal": "31/12/2026",
}

def baixar():
    query = urllib.parse.urlencode(PARAMS)
    url = BASE_URL + "?" + query

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        },
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(
            response.read().decode("utf-8")
        )

def numero(valor):
    return float(str(valor).replace(",", "."))

def variacao_pp(inicial, final):
    return round(final - inicial, 2)

print("Consultando DBGG no Banco Central...")

dados = baixar()

if not dados:
    raise RuntimeError("Banco Central retornou serie vazia.")

por_ano = {}

for item in dados:
    data = item["data"]
    valor = numero(item["valor"])

    dia, mes, ano = data.split("/")
    ano = int(ano)

    if ano < 2019 or ano > 2026:
        continue

    por_ano.setdefault(ano, []).append({
        "data": data,
        "mes": int(mes),
        "valor": valor,
    })

anos = []

for ano in range(2019, 2026):
    meses = por_ano.get(ano, [])

    dezembro = [
        x for x in meses
        if x["mes"] == 12
    ]

    if not dezembro:
        raise RuntimeError(
            f"Dezembro de {ano} nao encontrado."
        )

    registro = {
        "ano": ano,
        "governo": (
            "bolsonaro"
            if ano <= 2022
            else "lula"
        ),
        "valor": dezembro[-1]["valor"],
        "tipo": "estoque-fim-do-ano",
        "periodo": dezembro[-1]["data"],
    }

    if ano == 2020:
        registro["contexto"] = "Pandemia de COVID-19"

    anos.append(registro)

meses_2026 = sorted(
    por_ano.get(2026, []),
    key=lambda x: x["mes"]
)

ultimo_2026 = meses_2026[-1] if meses_2026 else None

if ultimo_2026:
    anos.append({
        "ano": 2026,
        "governo": "lula",
        "valor": None,
        "tipo": "ano-em-andamento",
        "ultimoDado": {
            "periodo": ultimo_2026["data"],
            "valor": ultimo_2026["valor"],
        },
    })

bolsonaro_3 = [
    x for x in anos
    if x["ano"] in (2019, 2020, 2021)
]

lula_3 = [
    x for x in anos
    if x["ano"] in (2023, 2024, 2025)
]

documento = {
    "id": "divida-bruta",
    "titulo": "Dívida Bruta do Governo Geral",
    "unidade": "% do PIB",
    "metodologia": (
        "Dívida Bruta do Governo Geral como proporção do PIB. "
        "Para anos fechados, mostramos a posição de dezembro. "
        "Para 2026, mostramos o último mês oficial disponível."
    ),
    "fonte": {
        "instituicao": "Banco Central do Brasil",
        "serieSGS": 13762,
        "descricao": (
            "Dívida Bruta do Governo Geral - % do PIB - "
            "metodologia utilizada a partir de 2008"
        ),
        "url": (
            "https://dadosabertos.bcb.gov.br/dataset/"
            "13762-divida-bruta-do-governo-geral--pib---"
            "metodologia-utilizada-a-partir-de-2008"
        ),
    },
    "anos": anos,
    "comparacaoMesmaDuracao": {
        "descricao": (
            "Variação em pontos percentuais entre o primeiro "
            "e o terceiro ano completo de cada governo"
        ),
        "bolsonaro": {
            "periodo": "2019-2021",
            "inicio": bolsonaro_3[0]["valor"],
            "fim": bolsonaro_3[-1]["valor"],
            "variacaoPontosPercentuais": variacao_pp(
                bolsonaro_3[0]["valor"],
                bolsonaro_3[-1]["valor"],
            ),
        },
        "lula": {
            "periodo": "2023-2025",
            "inicio": lula_3[0]["valor"],
            "fim": lula_3[-1]["valor"],
            "variacaoPontosPercentuais": variacao_pp(
                lula_3[0]["valor"],
                lula_3[-1]["valor"],
            ),
        },
    },
    "atualizadoEm": datetime.now().isoformat(
        timespec="seconds"
    ),
}

OUT.parent.mkdir(parents=True, exist_ok=True)

tmp = OUT.with_suffix(".json.tmp")

with tmp.open("w", encoding="utf-8") as f:
    json.dump(
        documento,
        f,
        ensure_ascii=False,
        indent=2,
    )

with tmp.open("r", encoding="utf-8") as f:
    json.load(f)

tmp.replace(OUT)

print()
print("Divida atualizada com sucesso.")

print()
for item in anos:
    print(item["ano"], item["valor"])

print()
print(
    "Bolsonaro 2019-2021:",
    documento["comparacaoMesmaDuracao"]["bolsonaro"]
    ["variacaoPontosPercentuais"],
    "p.p."
)

print(
    "Lula 2023-2025:",
    documento["comparacaoMesmaDuracao"]["lula"]
    ["variacaoPontosPercentuais"],
    "p.p."
)

if ultimo_2026:
    print()
    print(
        "2026 ultimo dado:",
        ultimo_2026["data"],
        ultimo_2026["valor"],
        "% do PIB"
    )

print()
print("Arquivo:", OUT)

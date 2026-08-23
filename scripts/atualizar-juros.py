import json
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "juros.json"

BASE_URL = (
    "https://api.bcb.gov.br/dados/serie/"
    "bcdata.sgs.5760/dados"
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

def media(valores):
    if not valores:
        return None
    return round(sum(valores) / len(valores), 2)

print("Consultando juros nominais no Banco Central...")

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

    dado = dezembro[-1]

    registro = {
        "ano": ano,
        "governo": (
            "bolsonaro"
            if ano <= 2022
            else "lula"
        ),
        "valor": dado["valor"],
        "tipo": "anual-fechado",
        "periodo": dado["data"],
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
    "id": "juros-nominais",
    "titulo": "Juros nominais do setor público",
    "unidade": "% do PIB",
    "metodologia": (
        "Juros nominais do setor público consolidado, "
        "acumulados em 12 meses, como proporção do PIB. "
        "Para anos fechados, usamos dezembro. "
        "Para 2026, mostramos o último mês oficial disponível."
    ),
    "fonte": {
        "instituicao": "Banco Central do Brasil",
        "serieSGS": 5760,
        "url": (
            "https://dadosabertos.bcb.gov.br/dataset/5760"
        ),
    },
    "anos": anos,
    "comparacaoMesmaDuracao": {
        "descricao": (
            "Média dos juros nominais nos primeiros três "
            "anos completos de cada governo"
        ),
        "bolsonaro": {
            "periodo": "2019-2021",
            "media": media(
                [x["valor"] for x in bolsonaro_3]
            ),
        },
        "lula": {
            "periodo": "2023-2025",
            "media": media(
                [x["valor"] for x in lula_3]
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
print("Juros nominais atualizados com sucesso.")

print()
print("Serie:")
for item in anos:
    print(item["ano"], item["valor"])

print()
print(
    "Bolsonaro 2019-2021 media:",
    documento["comparacaoMesmaDuracao"]
    ["bolsonaro"]["media"]
)

print(
    "Lula 2023-2025 media:",
    documento["comparacaoMesmaDuracao"]
    ["lula"]["media"]
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

import json
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "resultado-primario.json"

BASE_URL = (
    "https://api.bcb.gov.br/dados/serie/"
    "bcdata.sgs.5793/dados"
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

def saldo_primario(valor_bcb):
    # Na SGS 5793:
    # positivo = déficit / necessidade de financiamento
    # negativo = superávit.
    # Para exibição, invertemos:
    # positivo = superávit
    # negativo = déficit.
    return round(-valor_bcb, 2)

def media(valores):
    if not valores:
        return None
    return round(sum(valores) / len(valores), 2)

print("Consultando resultado primario no Banco Central...")

dados = baixar()

if not dados:
    raise RuntimeError("Banco Central retornou serie vazia.")

por_ano = {}

for item in dados:
    data = item["data"]
    valor_bcb = numero(item["valor"])

    dia, mes, ano = data.split("/")
    ano = int(ano)

    if ano < 2019 or ano > 2026:
        continue

    por_ano.setdefault(ano, []).append({
        "data": data,
        "mes": int(mes),
        "valorBCB": valor_bcb,
        "saldo": saldo_primario(valor_bcb),
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
        "valor": dado["saldo"],
        "valorOriginalBCB": dado["valorBCB"],
        "tipo": "anual-fechado",
        "periodo": dado["data"],
        "situacao": (
            "superavit"
            if dado["saldo"] > 0
            else "deficit"
            if dado["saldo"] < 0
            else "equilibrio"
        ),
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
            "valor": ultimo_2026["saldo"],
            "valorOriginalBCB": ultimo_2026["valorBCB"],
            "situacao": (
                "superavit"
                if ultimo_2026["saldo"] > 0
                else "deficit"
                if ultimo_2026["saldo"] < 0
                else "equilibrio"
            ),
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
    "id": "resultado-primario",
    "titulo": "Resultado primário do setor público",
    "unidade": "% do PIB",
    "metodologia": (
        "Resultado primário do setor público consolidado, "
        "acumulado em 12 meses, como proporção do PIB. "
        "Para anos fechados, usamos dezembro. "
        "Na série original do Banco Central, valores positivos "
        "representam déficit e valores negativos representam "
        "superávit. Neste painel, o sinal é invertido para tornar "
        "a leitura intuitiva: positivo representa superávit e "
        "negativo representa déficit."
    ),
    "fonte": {
        "instituicao": "Banco Central do Brasil",
        "serieSGS": 5793,
        "url": (
            "https://dadosabertos.bcb.gov.br/dataset/5793"
        ),
    },
    "anos": anos,
    "comparacaoMesmaDuracao": {
        "descricao": (
            "Média do saldo primário nos primeiros três "
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
print("Resultado primario atualizado com sucesso.")

print()
print("Serie:")
for item in anos:
    if item["valor"] is not None:
        nome = (
            "superavit"
            if item["valor"] > 0
            else "deficit"
        )
        print(
            item["ano"],
            item["valor"],
            nome
        )
    else:
        print(item["ano"], None)

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
        ultimo_2026["saldo"],
        "% do PIB"
    )

print()
print("Arquivo:", OUT)

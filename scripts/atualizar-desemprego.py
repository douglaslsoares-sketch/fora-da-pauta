import json
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "desemprego.json"

# Médias anuais oficiais já publicadas pelo IBGE.
# Depois podemos automatizar também essa camada por uma série anual específica.
ANOS = [
    {"ano": 2019, "governo": "bolsonaro", "valor": 11.8},
    {"ano": 2020, "governo": "bolsonaro", "valor": 13.8},
    {"ano": 2021, "governo": "bolsonaro", "valor": 13.2},
    {"ano": 2022, "governo": "bolsonaro", "valor": 9.3},
    {"ano": 2023, "governo": "lula", "valor": 7.8},
    {"ano": 2024, "governo": "lula", "valor": 6.6},
    {"ano": 2025, "governo": "lula", "valor": 5.6},
]

SIDRA_CORRENTE = (
    "https://apisidra.ibge.gov.br/values/"
    "t/4099/n1/all/v/4099/p/last%201?formato=json"
)

def baixar_json(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "ForaDaPauta/1.0"}
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def media(itens):
    if not itens:
        return None

    return round(
        sum(item["valor"] for item in itens) / len(itens),
        2
    )


print("Consultando último dado trimestral de desemprego no SIDRA...")

dados = baixar_json(SIDRA_CORRENTE)

if len(dados) < 2:
    raise RuntimeError("SIDRA retornou dados insuficientes.")

linha = dados[1]

ultimo_dado = {
    "periodoCodigo": linha["D3C"],
    "periodo": linha["D3N"],
    "valor": float(linha["V"])
}

anos = []

for item in ANOS:
    registro = {
        "ano": item["ano"],
        "governo": item["governo"],
        "valor": item["valor"],
        "tipo": "media-anual-oficial"
    }

    if item["ano"] == 2020:
        registro["contexto"] = "Pandemia de COVID-19"

    anos.append(registro)

anos.append({
    "ano": 2026,
    "governo": "lula",
    "valor": None,
    "tipo": "ano-em-andamento",
    "ultimoDado": ultimo_dado
})

bolsonaro = [
    item for item in anos
    if item["governo"] == "bolsonaro"
    and item["valor"] is not None
]

lula = [
    item for item in anos
    if item["governo"] == "lula"
    and item["valor"] is not None
]

bolsonaro_3 = [
    item for item in bolsonaro
    if item["ano"] in (2019, 2020, 2021)
]

lula_3 = [
    item for item in lula
    if item["ano"] in (2023, 2024, 2025)
]

documento = {
    "id": "desemprego",
    "titulo": "Taxa de desocupação",
    "unidade": "%",
    "metodologia": (
        "Taxa média anual de desocupação para os anos fechados. "
        "O dado de 2026 é apresentado separadamente como último trimestre "
        "oficial disponível e não é comparado diretamente com médias anuais."
    ),
    "fonte": {
        "instituicao": "IBGE",
        "pesquisa": "PNAD Contínua",
        "tabelaSidraTrimestral": 4099,
        "variavelSidra": 4099,
        "url": "https://sidra.ibge.gov.br/tabela/4099"
    },
    "anos": anos,
    "resumos": {
        "bolsonaro": {
            "periodo": "2019-2022",
            "anosCompletos": 4,
            "mediaAnual": media(bolsonaro)
        },
        "lula": {
            "periodo": "2023-2025",
            "anosCompletos": 3,
            "mediaAnual": media(lula),
            "parcial": True
        }
    },
    "comparacaoMesmaDuracao": {
        "descricao": "Primeiros três anos completos de cada governo",
        "bolsonaro": {
            "periodo": "2019-2021",
            "mediaAnual": media(bolsonaro_3)
        },
        "lula": {
            "periodo": "2023-2025",
            "mediaAnual": media(lula_3)
        }
    },
    "atualizadoEm": datetime.now().isoformat(timespec="seconds")
}

OUT.parent.mkdir(parents=True, exist_ok=True)

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
        f"Quantidade inesperada de anos: {len(teste['anos'])}"
    )

tmp.replace(OUT)

print()
print("Desemprego atualizado com sucesso.")

print()
print("Série anual:")
for item in anos:
    print(item["ano"], item["valor"])

print()
print(
    "Bolsonaro 2019-2022 média:",
    documento["resumos"]["bolsonaro"]["mediaAnual"],
    "%"
)

print(
    "Lula 2023-2025 média:",
    documento["resumos"]["lula"]["mediaAnual"],
    "%"
)

print()
print("Comparação de três anos:")

print(
    "Bolsonaro 2019-2021:",
    documento["comparacaoMesmaDuracao"]["bolsonaro"]["mediaAnual"],
    "%"
)

print(
    "Lula 2023-2025:",
    documento["comparacaoMesmaDuracao"]["lula"]["mediaAnual"],
    "%"
)

print()
print(
    "Último dado:",
    ultimo_dado["periodo"],
    ultimo_dado["valor"],
    "%"
)

print()
print("Arquivo:", OUT)

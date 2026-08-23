import json
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "ipca.json"

# Dezembro de cada ano = IPCA acumulado naquele ano.
PERIODOS_ANUAIS = [
    "201912",
    "202012",
    "202112",
    "202212",
    "202312",
    "202412",
    "202512",
]

SIDRA_ANUAL = (
    "https://apisidra.ibge.gov.br/values/"
    "t/1737/n1/all/v/69/p/"
    + ",".join(PERIODOS_ANUAIS)
    + "?formato=json"
)

# Em 2026, buscamos todos os meses e usamos
# automaticamente o último mês oficial disponível.
SIDRA_2026 = (
    "https://apisidra.ibge.gov.br/values/"
    "t/1737/n1/all/v/69/p/202601-202612?formato=json"
)

def baixar_json(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "ForaDaPauta/1.0"}
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def acumulado_composto(itens):
    fator = 1.0

    for item in itens:
        fator *= 1 + item["valor"] / 100.0

    return round((fator - 1) * 100, 2)


def media_anual(itens):
    if not itens:
        return None

    return round(
        sum(item["valor"] for item in itens) / len(itens),
        2
    )


print("Consultando IPCA anual no SIDRA...")

dados = baixar_json(SIDRA_ANUAL)

if len(dados) != 8:
    raise RuntimeError(
        f"Quantidade inesperada na série anual: {len(dados)}"
    )

anos = []

for linha in dados[1:]:
    periodo = linha["D3C"]
    ano = int(periodo[:4])
    valor = float(linha["V"])

    item = {
        "ano": ano,
        "governo": "bolsonaro" if ano <= 2022 else "lula",
        "valor": valor,
        "tipo": "anual-fechado",
        "origem": "SIDRA tabela 1737, variável 69"
    }

    if ano == 2020:
        item["contexto"] = "Pandemia de COVID-19"

    anos.append(item)


print("Consultando último IPCA acumulado disponível de 2026...")

dados_2026 = baixar_json(SIDRA_2026)

disponiveis_2026 = []

for linha in dados_2026[1:]:
    valor = str(linha.get("V", "")).strip()

    try:
        numero = float(valor)
    except (TypeError, ValueError):
        continue

    disponiveis_2026.append({
        "periodoCodigo": linha["D3C"],
        "periodo": linha["D3N"],
        "valor": numero
    })

ultimo_2026 = None

if disponiveis_2026:
    ultimo_2026 = sorted(
        disponiveis_2026,
        key=lambda x: x["periodoCodigo"]
    )[-1]


anos.append({
    "ano": 2026,
    "governo": "lula",
    "valor": None,
    "tipo": "ano-em-andamento",
    "ultimoDado": ultimo_2026,
    "origem": "SIDRA tabela 1737, variável 69"
})

anos.sort(key=lambda x: x["ano"])

bolsonaro = [
    x for x in anos
    if x["governo"] == "bolsonaro"
    and x["valor"] is not None
]

lula = [
    x for x in anos
    if x["governo"] == "lula"
    and x["valor"] is not None
]

# Comparação de duração equivalente:
# primeiros três anos de cada governo.
bolsonaro_3 = [
    x for x in bolsonaro
    if x["ano"] in (2019, 2020, 2021)
]

lula_3 = [
    x for x in lula
    if x["ano"] in (2023, 2024, 2025)
]

documento = {
    "id": "ipca",
    "titulo": "Inflação — IPCA",
    "unidade": "%",
    "metodologia": (
        "IPCA acumulado em cada ano-calendário. "
        "A inflação acumulada de um período é calculada de forma "
        "composta, e não pela soma simples das taxas anuais."
    ),
    "fonte": {
        "instituicao": "IBGE",
        "pesquisa": "Índice Nacional de Preços ao Consumidor Amplo — IPCA",
        "tabelaSidra": 1737,
        "variavelSidra": 69,
        "url": "https://sidra.ibge.gov.br/tabela/1737"
    },
    "anos": anos,
    "resumos": {
        "bolsonaro": {
            "periodo": "2019-2022",
            "anosCompletos": 4,
            "inflacaoAcumulada": acumulado_composto(bolsonaro),
            "mediaAnual": media_anual(bolsonaro)
        },
        "lula": {
            "periodo": "2023-2025",
            "anosCompletos": 3,
            "inflacaoAcumulada": acumulado_composto(lula),
            "mediaAnual": media_anual(lula),
            "parcial": True
        }
    },
    "comparacaoMesmaDuracao": {
        "descricao": "Primeiros três anos completos de cada governo",
        "bolsonaro": {
            "periodo": "2019-2021",
            "inflacaoAcumulada": acumulado_composto(bolsonaro_3),
            "mediaAnual": media_anual(bolsonaro_3)
        },
        "lula": {
            "periodo": "2023-2025",
            "inflacaoAcumulada": acumulado_composto(lula_3),
            "mediaAnual": media_anual(lula_3)
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
print("IPCA atualizado com sucesso.")

print()
print("Série anual:")
for item in anos:
    print(item["ano"], item["valor"])

print()
print(
    "Bolsonaro 2019-2022 acumulado:",
    documento["resumos"]["bolsonaro"]["inflacaoAcumulada"],
    "%"
)
print(
    "Lula 2023-2025 acumulado:",
    documento["resumos"]["lula"]["inflacaoAcumulada"],
    "%"
)

print()
print("Comparação de três anos:")
print(
    "Bolsonaro 2019-2021:",
    documento["comparacaoMesmaDuracao"]["bolsonaro"]["inflacaoAcumulada"],
    "%"
)
print(
    "Lula 2023-2025:",
    documento["comparacaoMesmaDuracao"]["lula"]["inflacaoAcumulada"],
    "%"
)

if ultimo_2026:
    print()
    print(
        "2026 até",
        ultimo_2026["periodo"],
        ":",
        ultimo_2026["valor"],
        "%"
    )

print()
print("Arquivo:", OUT)

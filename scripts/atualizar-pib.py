import json
import math
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "pib.json"

SIDRA_URL = (
    "https://apisidra.ibge.gov.br/values/"
    "t/6784/n1/all/v/9810/p/2019-2023?formato=json"
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

    return round((fator - 1) * 100, 1)

print("Consultando PIB anual no SIDRA...")

dados = baixar_json(SIDRA_URL)

if len(dados) < 2:
    raise RuntimeError("SIDRA retornou dados insuficientes.")

anos = []

for linha in dados[1:]:
    ano = int(linha["D3N"])
    valor = float(linha["V"])

    governo = "bolsonaro" if ano <= 2022 else "lula"

    item = {
        "ano": ano,
        "governo": governo,
        "valor": valor,
        "tipo": "anual-fechado",
        "origem": "SIDRA tabela 6784, variável 9810"
    }

    if ano == 2020:
        item["contexto"] = "Pandemia de COVID-19"

    anos.append(item)

# SCNT mais recente.
#
# Estes valores vêm das Contas Nacionais Trimestrais.
# Posteriormente podemos automatizar também esta parte
# via série trimestral oficial.
anos.extend([
    {
        "ano": 2024,
        "governo": "lula",
        "valor": 3.4,
        "tipo": "anual-fechado",
        "origem": "IBGE - Contas Nacionais Trimestrais"
    },
    {
        "ano": 2025,
        "governo": "lula",
        "valor": 2.3,
        "tipo": "anual-fechado",
        "origem": "IBGE - Contas Nacionais Trimestrais"
    },
    {
        "ano": 2026,
        "governo": "lula",
        "valor": None,
        "tipo": "ano-em-andamento",
        "ultimoDado": {
            "periodo": "1º trimestre de 2026",
            "valorMesmoTrimestreAnoAnterior": 1.8,
            "valorTrimestreAnterior": 1.1,
            "acumuladoQuatroTrimestres": 2.0
        },
        "origem": "IBGE - Contas Nacionais Trimestrais"
    }
])

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

bolsonaro_3 = [
    x for x in bolsonaro
    if x["ano"] in (2019, 2020, 2021)
]

lula_3 = [
    x for x in lula
    if x["ano"] in (2023, 2024, 2025)
]

documento = {
    "id": "pib",
    "titulo": "Crescimento real do PIB",
    "unidade": "%",
    "metodologia": (
        "Variação anual em volume do Produto Interno Bruto. "
        "O acumulado de cada governo é calculado de forma composta, "
        "e não pela soma das taxas anuais."
    ),
    "fontes": [
        {
            "instituicao": "IBGE",
            "pesquisa": "Sistema de Contas Nacionais",
            "tabelaSidra": 6784,
            "variavelSidra": 9810,
            "url": "https://sidra.ibge.gov.br/tabela/6784"
        },
        {
            "instituicao": "IBGE",
            "pesquisa": "Sistema de Contas Nacionais Trimestrais",
            "url": (
                "https://www.ibge.gov.br/estatisticas/"
                "economicas/contas-nacionais/9300-"
                "contas-nacionais-trimestrais.html"
            )
        }
    ],
    "anos": anos,
    "acumulados": {
        "bolsonaro": {
            "periodo": "2019-2022",
            "anosCompletos": len(bolsonaro),
            "valor": acumulado_composto(bolsonaro)
        },
        "lula": {
            "periodo": "2023-2025",
            "anosCompletos": len(lula),
            "valor": acumulado_composto(lula),
            "parcial": True
        }
    },
    "comparacaoMesmaDuracao": {
        "descricao": "Primeiros três anos completos de cada governo",
        "bolsonaro": {
            "periodo": "2019-2021",
            "valor": acumulado_composto(bolsonaro_3)
        },
        "lula": {
            "periodo": "2023-2025",
            "valor": acumulado_composto(lula_3)
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

# Validação antes de substituir o arquivo vigente.
with tmp.open("r", encoding="utf-8") as f:
    teste = json.load(f)

if len(teste["anos"]) != 8:
    raise RuntimeError(
        f"Quantidade inesperada de anos: {len(teste['anos'])}"
    )

tmp.replace(OUT)

print()
print("PIB atualizado com sucesso.")
print(
    "Bolsonaro acumulado:",
    documento["acumulados"]["bolsonaro"]["valor"],
    "%"
)
print(
    "Lula acumulado:",
    documento["acumulados"]["lula"]["valor"],
    "%"
)
print()
print("Série:")
for item in anos:
    print(item["ano"], item["valor"])
print()
print("Arquivo:", OUT)

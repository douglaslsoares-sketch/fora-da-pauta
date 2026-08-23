import json
import urllib.request
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "renda.json"

SIDRA_URL = (
    "https://apisidra.ibge.gov.br/values/"
    "t/6469/n1/1/v/5935/p/all?formato=json"
)

def baixar_json(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "ForaDaPauta/1.0"}
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def media(valores):
    if not valores:
        return None
    return round(sum(valores) / len(valores))


def variacao_percentual(inicial, final):
    if inicial == 0:
        return None

    return round(((final / inicial) - 1) * 100, 1)


print("Consultando renda real no SIDRA...")

dados = baixar_json(SIDRA_URL)

if len(dados) < 2:
    raise RuntimeError("SIDRA retornou dados insuficientes.")

por_ano = defaultdict(list)
ultimos = []

for linha in dados[1:]:
    codigo = linha["D3C"]
    ano = int(codigo[:4])

    if ano < 2019 or ano > 2026:
        continue

    valor_txt = str(linha.get("V", "")).strip()

    try:
        valor = float(valor_txt)
    except (TypeError, ValueError):
        continue

    item = {
        "periodoCodigo": codigo,
        "periodo": linha["D3N"],
        "valor": valor
    }

    por_ano[ano].append(item)
    ultimos.append(item)

anos = []

for ano in range(2019, 2026):
    trimestres = sorted(
        por_ano.get(ano, []),
        key=lambda x: x["periodoCodigo"]
    )

    if len(trimestres) != 4:
        raise RuntimeError(
            f"Ano {ano} nao possui 4 trimestres. "
            f"Encontrados: {len(trimestres)}"
        )

    valor_medio = media([x["valor"] for x in trimestres])

    registro = {
        "ano": ano,
        "governo": "bolsonaro" if ano <= 2022 else "lula",
        "valor": valor_medio,
        "tipo": "media-anual",
        "trimestres": trimestres
    }

    if ano == 2020:
        registro["contexto"] = "Pandemia de COVID-19"

    anos.append(registro)

trimestres_2026 = sorted(
    por_ano.get(2026, []),
    key=lambda x: x["periodoCodigo"]
)

ultimo_2026 = trimestres_2026[-1] if trimestres_2026 else None

anos.append({
    "ano": 2026,
    "governo": "lula",
    "valor": None,
    "tipo": "ano-em-andamento",
    "ultimoDado": ultimo_2026
})

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
    "id": "renda-real-trabalho",
    "titulo": "Renda real do trabalho",
    "unidade": "R$",
    "metodologia": (
        "Rendimento medio mensal real efetivamente recebido "
        "em todos os trabalhos. Para anos fechados, usamos a "
        "media simples dos quatro trimestres da serie trimestral "
        "do IBGE. Valores reais ja corrigem o efeito da inflacao."
    ),
    "fonte": {
        "instituicao": "IBGE",
        "pesquisa": "PNAD Continua",
        "tabelaSidra": 6469,
        "variavelSidra": 5935,
        "url": "https://sidra.ibge.gov.br/tabela/6469"
    },
    "anos": anos,
    "resumos": {
        "bolsonaro": {
            "periodo": "2019-2022",
            "mediaDoPeriodo": media([x["valor"] for x in bolsonaro])
        },
        "lula": {
            "periodo": "2023-2025",
            "mediaDoPeriodo": media([x["valor"] for x in lula]),
            "parcial": True
        }
    },
    "comparacaoMesmaDuracao": {
        "descricao": "Primeiros tres anos completos de cada governo",
        "bolsonaro": {
            "periodo": "2019-2021",
            "mediaDoPeriodo": media([x["valor"] for x in bolsonaro_3]),
            "variacaoNoPeriodo": variacao_percentual(
                bolsonaro_3[0]["valor"],
                bolsonaro_3[-1]["valor"]
            )
        },
        "lula": {
            "periodo": "2023-2025",
            "mediaDoPeriodo": media([x["valor"] for x in lula_3]),
            "variacaoNoPeriodo": variacao_percentual(
                lula_3[0]["valor"],
                lula_3[-1]["valor"]
            )
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
print("Renda real atualizada com sucesso.")

print()
print("Serie anual:")
for item in anos:
    print(item["ano"], item["valor"])

print()
print(
    "Bolsonaro 2019-2022 media:",
    documento["resumos"]["bolsonaro"]["mediaDoPeriodo"]
)

print(
    "Lula 2023-2025 media:",
    documento["resumos"]["lula"]["mediaDoPeriodo"]
)

print()
print("Comparacao de tres anos:")

print(
    "Bolsonaro 2019-2021:",
    documento["comparacaoMesmaDuracao"]["bolsonaro"]["mediaDoPeriodo"]
)

print(
    "Lula 2023-2025:",
    documento["comparacaoMesmaDuracao"]["lula"]["mediaDoPeriodo"]
)

if ultimo_2026:
    print()
    print(
        "2026 ultimo dado:",
        ultimo_2026["periodo"],
        ultimo_2026["valor"]
    )

print()
print("Arquivo:", OUT)

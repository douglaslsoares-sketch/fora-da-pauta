import json
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "renda.json"

TABELA_ANUAL = 4566
TABELA_CORRENTE = 6469
VAR_RENDA_REAL = 5935

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

print("Atualizando renda real...")
print()

anterior = carregar_anterior()

#
# ANOS FECHADOS — PNAD CONTÍNUA ANUAL
#

url_anual = (
    "https://apisidra.ibge.gov.br/values/"
    f"t/{TABELA_ANUAL}/n1/1/"
    f"v/{VAR_RENDA_REAL}/p/all"
    "?formato=json"
)

dados_anuais = baixar_json(url_anual)

if len(dados_anuais) < 2:
    raise RuntimeError("SIDRA anual retornou dados insuficientes.")

anos = []
revisoes = []

print("Comparando série anual com a versão anterior...")

for linha in dados_anuais[1:]:
    bruto = str(linha.get("V", "")).strip()

    if bruto in ("", "..", "...", "-"):
        continue

    try:
        ano = int(linha["D3C"])
        valor = round(float(bruto.replace(",", ".")))
    except (KeyError, ValueError):
        continue

    if ano < 2019 or ano > 2025:
        continue

    antigo = anterior.get(ano)

    if antigo is not None and antigo != valor:
        revisoes.append({
            "ano": ano,
            "valorAnterior": antigo,
            "valorNovo": valor
        })

        print(
            f"REVISAO: {ano}: "
            f"{antigo} -> {valor}"
        )

    registro = {
        "ano": ano,
        "governo": "bolsonaro" if ano <= 2022 else "lula",
        "valor": valor,
        "tipo": "media-anual-oficial-revisada",
        "origem": (
            "IBGE SIDRA tabela 4566, variável 5935, "
            "PNAD Contínua anual"
        )
    }

    if ano == 2020:
        registro["contexto"] = "Pandemia de COVID-19"

    anos.append(registro)

anos.sort(key=lambda item: item["ano"])

if len(anos) != 7:
    raise RuntimeError(
        f"Quantidade inesperada de anos fechados: {len(anos)}"
    )

if not revisoes:
    print("Nenhuma revisão histórica detectada.")

#
# ANO CORRENTE — PNAD CONTÍNUA TRIMESTRAL
#

url_corrente = (
    "https://apisidra.ibge.gov.br/values/"
    f"t/{TABELA_CORRENTE}/n1/1/"
    f"v/{VAR_RENDA_REAL}/p/all"
    "?formato=json"
)

dados_correntes = baixar_json(url_corrente)

trimestres = []

for linha in dados_correntes[1:]:
    codigo = str(linha.get("D3C", ""))

    if len(codigo) != 6:
        continue

    try:
        ano_trimestre = int(codigo[:4])
    except ValueError:
        continue

    if ano_trimestre < 2019 or ano_trimestre > 2026:
        continue

    bruto = str(linha.get("V", "")).strip()

    if bruto in ("", "..", "...", "-"):
        continue

    try:
        valor = round(float(bruto.replace(",", ".")))
    except ValueError:
        continue

    trimestres.append({
        "periodoCodigo": codigo,
        "periodo": linha.get("D3N", codigo),
        "ano": ano_trimestre,
        "valor": valor
    })

trimestres.sort(
    key=lambda item: item["periodoCodigo"]
)

ultimos_2026 = [
    item
    for item in trimestres
    if item["ano"] == 2026
]

ultimo_2026 = (
    ultimos_2026[-1]
    if ultimos_2026
    else None
)

trimestres_bolsonaro = [
    item
    for item in trimestres
    if 2019 <= item["ano"] <= 2022
]

trimestres_lula = [
    item
    for item in trimestres
    if item["ano"] >= 2023
]

if not trimestres_bolsonaro:
    raise RuntimeError(
        "Serie trimestral de Bolsonaro vazia."
    )

if not trimestres_lula:
    raise RuntimeError(
        "Serie trimestral de Lula vazia."
    )

media_periodo_bolsonaro = media(
    [item["valor"] for item in trimestres_bolsonaro]
)

media_periodo_lula = media(
    [item["valor"] for item in trimestres_lula]
)

variacao_periodo_bolsonaro = variacao_percentual(
    trimestres_bolsonaro[0]["valor"],
    trimestres_bolsonaro[-1]["valor"]
)

variacao_periodo_lula = variacao_percentual(
    trimestres_lula[0]["valor"],
    trimestres_lula[-1]["valor"]
)

anos.append({
    "ano": 2026,
    "governo": "lula",
    "valor": None,
    "tipo": "ano-em-andamento",
    "ultimoDado": ultimo_2026
})

#
# RESUMOS
#

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

if len(bolsonaro_3) != 3:
    raise RuntimeError(
        "Comparação Bolsonaro de três anos incompleta."
    )

if len(lula_3) != 3:
    raise RuntimeError(
        "Comparação Lula de três anos incompleta."
    )

documento = {
    "id": "renda-real-trabalho",
    "titulo": "Renda real do trabalho",
    "unidade": "R$",
    "metodologia": (
        "Rendimento médio mensal real das pessoas de 14 anos ou mais "
        "ocupadas, com rendimento de trabalho, efetivamente recebido "
        "em todos os trabalhos. Para anos fechados, usamos diretamente "
        "a PNAD Contínua anual do IBGE, incorporando revisões históricas. "
        "Para o ano em andamento, mostramos separadamente o último "
        "trimestre oficial disponível."
    ),
    "fontes": [
        {
            "instituicao": "IBGE",
            "pesquisa": "PNAD Contínua anual",
            "tabelaSidra": TABELA_ANUAL,
            "variavelSidra": VAR_RENDA_REAL,
            "url": "https://sidra.ibge.gov.br/tabela/4566"
        },
        {
            "instituicao": "IBGE",
            "pesquisa": "PNAD Contínua trimestral",
            "tabelaSidra": TABELA_CORRENTE,
            "variavelSidra": VAR_RENDA_REAL,
            "url": "https://sidra.ibge.gov.br/tabela/6469"
        }
    ],
    "anos": anos,
    "resumos": {
        "bolsonaro": {
            "periodo": "2019-2022",
            "mediaDoPeriodo": media(
                [item["valor"] for item in bolsonaro]
            )
        },
        "lula": {
            "periodo": "2023-2025",
            "mediaDoPeriodo": media(
                [item["valor"] for item in lula]
            ),
            "parcial": True
        }
    },
    "comparacaoPeriodoDisponivel": {
        "descricao": "Renda real no periodo disponivel",
        "bolsonaro": {
            "periodo": "2019-2022",
            "mediaDoPeriodo": media_periodo_bolsonaro,
            "variacaoNoPeriodo": variacao_periodo_bolsonaro
        },
        "lula": {
            "periodo": "2023-2026",
            "mediaDoPeriodo": media_periodo_lula,
            "variacaoNoPeriodo": variacao_periodo_lula,
            "parcial": True,
            "ate": (
                ultimo_2026["periodo"]
                if ultimo_2026
                else None
            )
        }
    },
    "comparacaoMesmaDuracao": {
        "descricao": "Primeiros três anos completos de cada governo",
        "bolsonaro": {
            "periodo": "2019-2021",
            "mediaDoPeriodo": media(
                [item["valor"] for item in bolsonaro_3]
            ),
            "variacaoNoPeriodo": variacao_percentual(
                bolsonaro_3[0]["valor"],
                bolsonaro_3[-1]["valor"]
            )
        },
        "lula": {
            "periodo": "2023-2025",
            "mediaDoPeriodo": media(
                [item["valor"] for item in lula_3]
            ),
            "variacaoNoPeriodo": variacao_percentual(
                lula_3[0]["valor"],
                lula_3[-1]["valor"]
            )
        }
    },
    "revisoesDetectadas": revisoes,
    "atualizadoEm": datetime.now().isoformat(timespec="seconds")
}

#
# GRAVAÇÃO SEGURA
#

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

print("Série anual revisada:")

for item in anos:
    print(item["ano"], item["valor"])

print()
print(
    "Bolsonaro 2019-2022 média:",
    documento["resumos"]["bolsonaro"]["mediaDoPeriodo"]
)

print(
    "Lula 2023-2025 média:",
    documento["resumos"]["lula"]["mediaDoPeriodo"]
)

print()
print(
    "Mesma duração Bolsonaro:",
    documento["comparacaoMesmaDuracao"]
    ["bolsonaro"]["mediaDoPeriodo"]
)

print(
    "Variação Bolsonaro:",
    documento["comparacaoMesmaDuracao"]
    ["bolsonaro"]["variacaoNoPeriodo"],
    "%"
)

print(
    "Mesma duração Lula:",
    documento["comparacaoMesmaDuracao"]
    ["lula"]["mediaDoPeriodo"]
)

print(
    "Variação Lula:",
    documento["comparacaoMesmaDuracao"]
    ["lula"]["variacaoNoPeriodo"],
    "%"
)

if ultimo_2026:
    print()
    print(
        "Último dado 2026:",
        ultimo_2026["periodo"],
        ultimo_2026["valor"]
    )

print()
print("Arquivo:", OUT)

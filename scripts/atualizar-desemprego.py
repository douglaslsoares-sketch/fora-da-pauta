import json
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "desemprego.json"

TABELA_ANUAL = 4562
TABELA_TRIMESTRAL = 4099
VARIAVEL = 4099

ANO_INICIAL = 2019
ANO_CORRENTE = datetime.now().year

URL_ANUAL = (
    "https://apisidra.ibge.gov.br/values/"
    f"t/{TABELA_ANUAL}/n1/1/v/{VARIAVEL}/p/all"
    "?formato=json"
)

URL_TRIMESTRAL = (
    "https://apisidra.ibge.gov.br/values/"
    f"t/{TABELA_TRIMESTRAL}/n1/1/v/{VARIAVEL}/p/all"
    "?formato=json"
)


def baixar_json(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "ForaDaPauta/1.0"}
    )

    with urllib.request.urlopen(req, timeout=60) as response:
        return json.loads(
            response.read().decode("utf-8")
        )


def numero(valor):
    return float(str(valor).replace(",", "."))


def media(itens):
    if not itens:
        return None

    return round(
        sum(item["valor"] for item in itens) / len(itens),
        2
    )


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


print("Atualizando desemprego...")
print()

anterior = carregar_anterior()


#
# SÉRIE ANUAL OFICIAL
#

print("Consultando série anual oficial no SIDRA...")

dados_anuais = baixar_json(URL_ANUAL)

if len(dados_anuais) < 2:
    raise RuntimeError(
        "SIDRA retornou série anual vazia."
    )

serie_anual = {}

for linha in dados_anuais[1:]:
    bruto = str(linha.get("V", "")).strip()

    if bruto in ("", "..", "...", "-"):
        continue

    #
    # No agregado 4562:
    # D2 = Ano
    # D3 = Variável
    #
    try:
        ano = int(linha["D3N"])
    except (KeyError, ValueError):
        continue

    if ano < ANO_INICIAL:
        continue

    if str(linha.get("D2C")) != str(VARIAVEL):
        continue

    serie_anual[ano] = numero(bruto)


if not serie_anual:
    raise RuntimeError(
        "Nenhum ano válido encontrado na série anual."
    )

ultimo_ano_anual = max(serie_anual)


#
# MONTA ANOS FECHADOS
#

anos = []

for ano in sorted(serie_anual):
    valor = serie_anual[ano]

    registro = {
        "ano": ano,
        "governo": (
            "bolsonaro"
            if ano <= 2022
            else "lula"
        ),
        "valor": valor,
        "tipo": "media-anual-oficial",
        "origem": (
            "IBGE SIDRA tabela 4562, "
            "variável 4099"
        )
    }

    if ano == 2020:
        registro["contexto"] = "Pandemia de COVID-19"

    anos.append(registro)


#
# REVISÕES HISTÓRICAS
#

print()
print("Comparando série anual com a versão anterior...")

revisoes = []

for item in anos:
    antigo = anterior.get(item["ano"])

    if (
        antigo is not None
        and abs(antigo - item["valor"]) > 0.000001
    ):
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


#
# ÚLTIMO TRIMESTRE OFICIAL
#

print()
print("Consultando último dado trimestral no SIDRA...")

dados_trimestrais = baixar_json(URL_TRIMESTRAL)

trimestres = []

for linha in dados_trimestrais[1:]:
    bruto = str(linha.get("V", "")).strip()

    if bruto in ("", "..", "...", "-"):
        continue

    periodo_codigo = str(linha.get("D3C", ""))

    if len(periodo_codigo) != 6:
        continue

    try:
        ano_periodo = int(periodo_codigo[:4])
    except ValueError:
        continue

    if ano_periodo < 2019 or ano_periodo > ANO_CORRENTE:
        continue

    trimestres.append({
        "periodoCodigo": periodo_codigo,
        "periodo": linha["D3N"],
        "ano": ano_periodo,
        "valor": numero(bruto)
    })

trimestres.sort(
    key=lambda item: item["periodoCodigo"]
)

trimestres_correntes = [
    item
    for item in trimestres
    if item["ano"] == ANO_CORRENTE
]

ultimo_dado = (
    trimestres_correntes[-1]
    if trimestres_correntes
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

media_periodo_bolsonaro = round(
    sum(item["valor"] for item in trimestres_bolsonaro)
    / len(trimestres_bolsonaro),
    2
)

media_periodo_lula = round(
    sum(item["valor"] for item in trimestres_lula)
    / len(trimestres_lula),
    2
)

#
# ANO EM ANDAMENTO
#
# Só criamos a linha parcial se o ano corrente ainda
# não possuir uma média anual oficial.
#

if ANO_CORRENTE not in serie_anual:
    anos.append({
        "ano": ANO_CORRENTE,
        "governo": "lula",
        "valor": None,
        "tipo": "ano-em-andamento",
        "ultimoDado": ultimo_dado,
        "origem": (
            "IBGE SIDRA tabela 4099, "
            "variável 4099"
        )
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
        "Comparação Bolsonaro incompleta."
    )

if len(lula_3) != 3:
    raise RuntimeError(
        "Comparação Lula incompleta."
    )


documento = {
    "id": "desemprego",
    "titulo": "Taxa de desocupação",
    "unidade": "%",
    "metodologia": (
        "Taxa média anual de desocupação das pessoas de "
        "14 anos ou mais para os anos fechados, segundo "
        "a PNAD Contínua anual do IBGE. Para o ano em "
        "andamento, o último trimestre oficial disponível "
        "é mostrado separadamente e não é tratado como "
        "média anual."
    ),
    "fontes": [
        {
            "instituicao": "IBGE",
            "pesquisa": "PNAD Contínua anual",
            "tabelaSidra": TABELA_ANUAL,
            "variavelSidra": VARIAVEL,
            "url": "https://sidra.ibge.gov.br/tabela/4562"
        },
        {
            "instituicao": "IBGE",
            "pesquisa": "PNAD Contínua trimestral",
            "tabelaSidra": TABELA_TRIMESTRAL,
            "variavelSidra": VARIAVEL,
            "url": "https://sidra.ibge.gov.br/tabela/4099"
        }
    ],
    "anos": anos,
    "resumos": {
        "bolsonaro": {
            "periodo": "2019-2022",
            "anosCompletos": len(bolsonaro),
            "mediaAnual": media(bolsonaro)
        },
        "lula": {
            "periodo": f"2023-{ultimo_ano_anual}",
            "anosCompletos": len(lula),
            "mediaAnual": media(lula),
            "parcial": True
        }
    },
    "comparacaoPeriodoDisponivel": {
        "descricao": "Media de desemprego no periodo disponivel",
        "bolsonaro": {
            "periodo": "2019-2022",
            "media": media_periodo_bolsonaro,
        },
        "lula": {
            "periodo": "2023-2026",
            "media": media_periodo_lula,
            "parcial": True,
            "ate": (
                ultimo_dado["periodo"]
                if ultimo_dado
                else None
            ),
        },
    },
    "comparacaoMesmaDuracao": {
        "descricao": (
            "Primeiros três anos completos de cada governo"
        ),
        "bolsonaro": {
            "periodo": "2019-2021",
            "mediaAnual": media(bolsonaro_3)
        },
        "lula": {
            "periodo": "2023-2025",
            "mediaAnual": media(lula_3)
        }
    },
    "ultimoAnoAnualDisponivel": ultimo_ano_anual,
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

if len(teste["anos"]) < 8:
    raise RuntimeError(
        f"Quantidade inesperada de anos: "
        f"{len(teste['anos'])}"
    )

tmp.replace(OUT)


print()
print("Desemprego atualizado com sucesso.")
print()

for item in anos:
    print(item["ano"], item["valor"])

print()
print(
    "Bolsonaro 2019-2022 média:",
    documento["resumos"]["bolsonaro"]["mediaAnual"],
    "%"
)

print(
    f"Lula 2023-{ultimo_ano_anual} média:",
    documento["resumos"]["lula"]["mediaAnual"],
    "%"
)

print()
print(
    "Mesma duração Bolsonaro:",
    documento["comparacaoMesmaDuracao"]
    ["bolsonaro"]["mediaAnual"],
    "%"
)

print(
    "Mesma duração Lula:",
    documento["comparacaoMesmaDuracao"]
    ["lula"]["mediaAnual"],
    "%"
)

if ultimo_dado:
    print()
    print(
        "Último dado:",
        ultimo_dado["periodo"],
        ultimo_dado["valor"],
        "%"
    )

print()
print("Arquivo:", OUT)

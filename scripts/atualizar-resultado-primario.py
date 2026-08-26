import json
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "resultado-primario.json"

SERIE_SGS = 5793
ANO_INICIAL = 2019
ANO_CORRENTE = datetime.now().year

BASE_URL = (
    "https://api.bcb.gov.br/dados/serie/"
    f"bcdata.sgs.{SERIE_SGS}/dados"
)


def baixar():
    params = {
        "formato": "json",
        "dataInicial": f"01/01/{ANO_INICIAL}",
        "dataFinal": f"31/12/{ANO_CORRENTE}",
    }

    url = BASE_URL + "?" + urllib.parse.urlencode(params)

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "ForaDaPauta/1.0",
            "Accept": "application/json",
        },
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def numero(valor):
    return float(str(valor).replace(",", "."))


def saldo_primario(valor_bcb):
    return round(-valor_bcb, 2)


def media(valores):
    if not valores:
        return None

    return round(sum(valores) / len(valores), 2)


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


print("Atualizando resultado primário...")
print()

anterior = carregar_anterior()

dados = baixar()

if not dados:
    raise RuntimeError(
        "Banco Central retornou série vazia."
    )


por_ano = {}

for item in dados:
    data = item["data"]
    valor_bcb = numero(item["valor"])

    dia, mes, ano = data.split("/")
    ano = int(ano)

    if ano < ANO_INICIAL or ano > ANO_CORRENTE:
        continue

    por_ano.setdefault(ano, []).append({
        "data": data,
        "mes": int(mes),
        "valorBCB": valor_bcb,
        "saldo": saldo_primario(valor_bcb),
    })


#
# ANOS FECHADOS
#

anos = []

for ano in range(ANO_INICIAL, ANO_CORRENTE):
    meses = por_ano.get(ano, [])

    dezembro = [
        item
        for item in meses
        if item["mes"] == 12
    ]

    if not dezembro:
        raise RuntimeError(
            f"Dezembro de {ano} não encontrado."
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
        "origem": f"Banco Central SGS {SERIE_SGS}",
    }

    if ano == 2020:
        registro["contexto"] = "Pandemia de COVID-19"

    anos.append(registro)


#
# REVISÕES HISTÓRICAS
#

print("Comparando com a versão anterior...")

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
            "valorNovo": item["valor"],
        })

        print(
            f"REVISAO: {item['ano']}: "
            f"{antigo} -> {item['valor']}"
        )

if not revisoes:
    print("Nenhuma revisão histórica detectada.")


#
# ANO CORRENTE
#

meses_correntes = sorted(
    por_ano.get(ANO_CORRENTE, []),
    key=lambda item: item["mes"]
)

ultimo_dado = (
    meses_correntes[-1]
    if meses_correntes
    else None
)

anos.append({
    "ano": ANO_CORRENTE,
    "governo": "lula",
    "valor": None,
    "tipo": "ano-em-andamento",
    "ultimoDado": (
        {
            "periodo": ultimo_dado["data"],
            "valor": ultimo_dado["saldo"],
            "valorOriginalBCB": ultimo_dado["valorBCB"],
            "situacao": (
                "superavit"
                if ultimo_dado["saldo"] > 0
                else "deficit"
                if ultimo_dado["saldo"] < 0
                else "equilibrio"
            ),
        }
        if ultimo_dado
        else None
    ),
})


#
# COMPARAÇÃO
#

bolsonaro_3 = [
    item for item in anos
    if item["ano"] in (2019, 2020, 2021)
]

lula_3 = [
    item for item in anos
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
    "id": "resultado-primario",
    "titulo": "Resultado primário do setor público",
    "unidade": "% do PIB",
    "metodologia": (
        "Resultado primário do setor público consolidado, "
        "acumulado em 12 meses, como proporção do PIB. "
        "Para anos fechados, usamos dezembro, quando o "
        "acumulado de 12 meses corresponde ao ano-calendário. "
        "Na série original do Banco Central, valores positivos "
        "representam déficit e valores negativos representam "
        "superávit. Neste painel, o sinal é invertido: positivo "
        "representa superávit e negativo representa déficit."
    ),
    "fonte": {
        "instituicao": "Banco Central do Brasil",
        "serieSGS": SERIE_SGS,
        "descricao": (
            "NFSP sem desvalorização cambial - "
            "resultado primário - setor público consolidado - "
            "% do PIB - fluxo acumulado em 12 meses"
        ),
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
                [item["valor"] for item in bolsonaro_3]
            ),
        },
        "lula": {
            "periodo": "2023-2025",
            "media": media(
                [item["valor"] for item in lula_3]
            ),
        },
    },
    "revisoesDetectadas": revisoes,
    "atualizadoEm": datetime.now().isoformat(
        timespec="seconds"
    ),
}


tmp = OUT.with_suffix(".json.tmp")

with tmp.open("w", encoding="utf-8") as f:
    json.dump(
        documento,
        f,
        ensure_ascii=False,
        indent=2,
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
print("Resultado primário atualizado com sucesso.")
print()

for item in anos:
    if item["valor"] is not None:
        print(
            item["ano"],
            item["valor"],
            item["situacao"]
        )
    else:
        print(item["ano"], None)

print()
print(
    "Bolsonaro 2019-2021 média:",
    documento["comparacaoMesmaDuracao"]
    ["bolsonaro"]["media"],
    "%"
)

print(
    "Lula 2023-2025 média:",
    documento["comparacaoMesmaDuracao"]
    ["lula"]["media"],
    "%"
)

if ultimo_dado:
    print()
    print(
        f"{ANO_CORRENTE} último dado:",
        ultimo_dado["data"],
        ultimo_dado["saldo"],
        "% do PIB"
    )

print()
print("Arquivo:", OUT)

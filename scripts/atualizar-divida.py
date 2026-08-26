import json
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "divida.json"

SERIE_SGS = 13762
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

    query = urllib.parse.urlencode(params)
    url = BASE_URL + "?" + query

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "ForaDaPauta/1.0",
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


print("Atualizando Dívida Bruta do Governo Geral...")
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
    valor = numero(item["valor"])

    dia, mes, ano = data.split("/")
    ano = int(ano)

    if ano < ANO_INICIAL or ano > ANO_CORRENTE:
        continue

    por_ano.setdefault(ano, []).append({
        "data": data,
        "mes": int(mes),
        "valor": valor,
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

    item_dezembro = dezembro[-1]

    registro = {
        "ano": ano,
        "governo": (
            "bolsonaro"
            if ano <= 2022
            else "lula"
        ),
        "valor": item_dezembro["valor"],
        "tipo": "estoque-fim-do-ano",
        "periodo": item_dezembro["data"],
        "origem": (
            f"Banco Central SGS {SERIE_SGS}"
        )
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
            "valorNovo": item["valor"]
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
            "valor": ultimo_dado["valor"],
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
    "id": "divida-bruta",
    "titulo": "Dívida Bruta do Governo Geral",
    "unidade": "% do PIB",
    "metodologia": (
        "Dívida Bruta do Governo Geral como proporção "
        "do PIB. Como se trata de um estoque, para anos "
        "fechados mostramos a posição de dezembro. "
        "Para o ano em andamento, mostramos o último "
        "mês oficial disponível."
    ),
    "fonte": {
        "instituicao": "Banco Central do Brasil",
        "serieSGS": SERIE_SGS,
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
            "Variação em pontos percentuais entre o "
            "primeiro e o terceiro ano completo de "
            "cada governo"
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
print("Dívida atualizada com sucesso.")
print()

for item in anos:
    print(item["ano"], item["valor"])

print()
print(
    "Bolsonaro 2019-2021:",
    documento["comparacaoMesmaDuracao"]
    ["bolsonaro"]["variacaoPontosPercentuais"],
    "p.p."
)

print(
    "Lula 2023-2025:",
    documento["comparacaoMesmaDuracao"]
    ["lula"]["variacaoPontosPercentuais"],
    "p.p."
)

if ultimo_dado:
    print()
    print(
        f"{ANO_CORRENTE} último dado:",
        ultimo_dado["data"],
        ultimo_dado["valor"],
        "% do PIB"
    )

print()
print("Arquivo:", OUT)

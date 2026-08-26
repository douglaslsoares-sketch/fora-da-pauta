import json
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "ipca.json"

TABELA = 1737
VAR_ACUMULADO_ANO = 69

ANO_INICIAL = 2019
ANO_CORRENTE = datetime.now().year


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


print("Atualizando IPCA...")
print()

anterior = carregar_anterior()

#
# ANOS FECHADOS
#

periodos_anuais = [
    f"{ano}12"
    for ano in range(ANO_INICIAL, ANO_CORRENTE)
]

url_anual = (
    "https://apisidra.ibge.gov.br/values/"
    f"t/{TABELA}/n1/all/"
    f"v/{VAR_ACUMULADO_ANO}/p/"
    + ",".join(periodos_anuais)
    + "?formato=json"
)

print("Consultando IPCA anual no SIDRA...")

dados = baixar_json(url_anual)

if len(dados) < 2:
    raise RuntimeError(
        "SIDRA retornou dados anuais insuficientes."
    )

anos = []

for linha in dados[1:]:
    bruto = str(linha.get("V", "")).strip()

    if bruto in ("", "..", "...", "-"):
        continue

    periodo = str(linha["D3C"])
    ano = int(periodo[:4])

    try:
        valor = float(bruto.replace(",", "."))
    except ValueError:
        continue

    item = {
        "ano": ano,
        "governo": (
            "bolsonaro"
            if ano <= 2022
            else "lula"
        ),
        "valor": valor,
        "tipo": "anual-fechado",
        "origem": (
            "IBGE SIDRA tabela 1737, "
            "variável 69"
        )
    }

    if ano == 2020:
        item["contexto"] = "Pandemia de COVID-19"

    anos.append(item)

anos.sort(key=lambda item: item["ano"])


#
# REVISÕES HISTÓRICAS
#

print()
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

url_corrente = (
    "https://apisidra.ibge.gov.br/values/"
    f"t/{TABELA}/n1/all/"
    f"v/{VAR_ACUMULADO_ANO}/"
    f"p/{ANO_CORRENTE}01-{ANO_CORRENTE}12"
    "?formato=json"
)

print()
print(
    f"Consultando último IPCA acumulado no ano de "
    f"{ANO_CORRENTE}..."
)

dados_correntes = baixar_json(url_corrente)

disponiveis = []

for linha in dados_correntes[1:]:
    bruto = str(linha.get("V", "")).strip()

    if bruto in ("", "..", "...", "-"):
        continue

    try:
        valor = float(bruto.replace(",", "."))
    except ValueError:
        continue

    disponiveis.append({
        "periodoCodigo": str(linha["D3C"]),
        "periodo": linha["D3N"],
        "valor": valor
    })

ultimo_dado = None

if disponiveis:
    ultimo_dado = sorted(
        disponiveis,
        key=lambda item: item["periodoCodigo"]
    )[-1]

anos.append({
    "ano": ANO_CORRENTE,
    "governo": "lula",
    "valor": None,
    "tipo": "ano-em-andamento",
    "ultimoDado": ultimo_dado,
    "origem": (
        "IBGE SIDRA tabela 1737, "
        "variável 69"
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


documento = {
    "id": "ipca",
    "titulo": "Inflação — IPCA",
    "unidade": "%",
    "metodologia": (
        "IPCA acumulado em cada ano-calendário. "
        "Para anos fechados, usamos o valor acumulado "
        "no ano em dezembro. Para o ano em andamento, "
        "mostramos o acumulado no ano até o último mês "
        "oficial disponível. A inflação acumulada de um "
        "período é calculada de forma composta, e não "
        "pela soma simples das taxas anuais."
    ),
    "fonte": {
        "instituicao": "IBGE",
        "pesquisa": (
            "Índice Nacional de Preços ao Consumidor "
            "Amplo — IPCA"
        ),
        "tabelaSidra": TABELA,
        "variavelSidra": VAR_ACUMULADO_ANO,
        "descricaoVariavel": (
            "IPCA - Variação acumulada no ano"
        ),
        "url": "https://sidra.ibge.gov.br/tabela/1737"
    },
    "anos": anos,
    "resumos": {
        "bolsonaro": {
            "periodo": "2019-2022",
            "anosCompletos": len(bolsonaro),
            "inflacaoAcumulada":
                acumulado_composto(bolsonaro),
            "mediaAnual":
                media_anual(bolsonaro)
        },
        "lula": {
            "periodo": "2023-2025",
            "anosCompletos": len(lula),
            "inflacaoAcumulada":
                acumulado_composto(lula),
            "mediaAnual":
                media_anual(lula),
            "parcial": True
        }
    },
    "comparacaoMesmaDuracao": {
        "descricao":
            "Primeiros três anos completos de cada governo",
        "bolsonaro": {
            "periodo": "2019-2021",
            "inflacaoAcumulada":
                acumulado_composto(bolsonaro_3),
            "mediaAnual":
                media_anual(bolsonaro_3)
        },
        "lula": {
            "periodo": "2023-2025",
            "inflacaoAcumulada":
                acumulado_composto(lula_3),
            "mediaAnual":
                media_anual(lula_3)
        }
    },
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
print("IPCA atualizado com sucesso.")
print()

for item in anos:
    print(item["ano"], item["valor"])

print()

if ultimo_dado:
    print(
        f"{ANO_CORRENTE} até "
        f"{ultimo_dado['periodo']}: "
        f"{ultimo_dado['valor']} %"
    )

print()
print("Arquivo:", OUT)

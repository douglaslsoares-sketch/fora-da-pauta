import json
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "pib.json"

TABELA = 5932
CLASSIFICACAO = 11255
PIB = 90707

VAR_MESMO_TRIMESTRE = 6561
VAR_QUATRO_TRIMESTRES = 6562
VAR_ACUMULADO_ANO = 6563
VAR_TRIMESTRE_ANTERIOR = 6564

ANO_INICIAL = 2019
ANO_CORRENTE = datetime.now().year


def baixar_json(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "ForaDaPauta/1.0"}
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def url_sidra(variavel, periodo):
    return (
        "https://apisidra.ibge.gov.br/values/"
        f"t/{TABELA}/n1/all/"
        f"v/{variavel}/p/{periodo}/"
        f"c{CLASSIFICACAO}/{PIB}"
        "?formato=json"
    )


def obter_valor(variavel, periodo):
    dados = baixar_json(url_sidra(variavel, periodo))

    if len(dados) < 2:
        return None

    for linha in dados[1:]:
        if str(linha.get("D4C")) != str(PIB):
            continue

        bruto = linha.get("V")

        if bruto in (None, "", "..", "...", "-"):
            continue

        try:
            return float(str(bruto).replace(",", "."))
        except ValueError:
            continue

    return None


def acumulado_composto(itens):
    fator = 1.0

    for item in itens:
        fator *= 1 + item["valor"] / 100

    return round((fator - 1) * 100, 1)


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


print("Atualizando PIB pelas Contas Nacionais Trimestrais do IBGE...")
print()

anterior = carregar_anterior()

anos = []

#
# ANOS FECHADOS
#
# O valor anual corresponde à variável 6563
# no quarto trimestre de cada ano.
#

for ano in range(ANO_INICIAL, ANO_CORRENTE):
    periodo = int(f"{ano}04")

    valor = obter_valor(
        VAR_ACUMULADO_ANO,
        periodo
    )

    if valor is None:
        print(
            f"{ano}: ainda sem fechamento anual disponível."
        )
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
            "IBGE SIDRA tabela 5932, "
            "variável 6563, PIB a preços de mercado"
        )
    }

    if ano == 2020:
        item["contexto"] = "Pandemia de COVID-19"

    anos.append(item)


if len(anos) < 7:
    raise RuntimeError(
        "A fonte não retornou todos os anos "
        "fechados esperados desde 2019."
    )


#
# DETECÇÃO DE REVISÕES
#

revisoes = []

print("Comparando com a versão anterior...")

for item in anos:
    ano = item["ano"]
    novo = item["valor"]
    antigo = anterior.get(ano)

    if antigo is None:
        continue

    if abs(antigo - novo) > 0.000001:
        revisoes.append({
            "ano": ano,
            "valorAnterior": antigo,
            "valorNovo": novo
        })

        print(
            f"REVISAO: {ano}: "
            f"{antigo} -> {novo}"
        )

if not revisoes:
    print("Nenhuma revisão histórica detectada.")


#
# ANO EM ANDAMENTO
#
# Procura do 4º para o 1º trimestre.
#

ultimo_trimestre = None

for trimestre in range(4, 0, -1):
    periodo = int(
        f"{ANO_CORRENTE}{trimestre:02d}"
    )

    valor = obter_valor(
        VAR_MESMO_TRIMESTRE,
        periodo
    )

    if valor is not None:
        ultimo_trimestre = trimestre
        break


if ultimo_trimestre is not None:
    periodo_codigo = int(
        f"{ANO_CORRENTE}{ultimo_trimestre:02d}"
    )

    mesmo_ano_anterior = obter_valor(
        VAR_MESMO_TRIMESTRE,
        periodo_codigo
    )

    quatro_trimestres = obter_valor(
        VAR_QUATRO_TRIMESTRES,
        periodo_codigo
    )

    acumulado_ano = obter_valor(
        VAR_ACUMULADO_ANO,
        periodo_codigo
    )

    trimestre_anterior = obter_valor(
        VAR_TRIMESTRE_ANTERIOR,
        periodo_codigo
    )

    nomes = {
        1: "1º trimestre",
        2: "2º trimestre",
        3: "3º trimestre",
        4: "4º trimestre",
    }

    anos.append({
        "ano": ANO_CORRENTE,
        "governo": "lula",
        "valor": None,
        "tipo": "ano-em-andamento",
        "ultimoDado": {
            "periodoCodigo": str(periodo_codigo),
            "periodo": (
                f"{nomes[ultimo_trimestre]} "
                f"de {ANO_CORRENTE}"
            ),
            "valorMesmoTrimestreAnoAnterior":
                mesmo_ano_anterior,
            "valorTrimestreAnterior":
                trimestre_anterior,
            "acumuladoAno":
                acumulado_ano,
            "acumuladoQuatroTrimestres":
                quatro_trimestres
        },
        "origem": (
            "IBGE SIDRA tabela 5932, "
            "PIB a preços de mercado"
        )
    })

    print()
    print(
        "Último trimestre disponível:",
        nomes[ultimo_trimestre],
        ANO_CORRENTE
    )

    print(
        "Mesmo trimestre do ano anterior:",
        mesmo_ano_anterior
    )

    print(
        "Trimestre anterior:",
        trimestre_anterior
    )

    print(
        "Acumulado no ano:",
        acumulado_ano
    )

    print(
        "Acumulado em quatro trimestres:",
        quatro_trimestres
    )

else:
    print()
    print(
        f"Nenhum trimestre de {ANO_CORRENTE} "
        "disponível ainda."
    )


anos.sort(key=lambda item: item["ano"])


#
# COMPARAÇÕES
#

fechados = [
    item
    for item in anos
    if item["valor"] is not None
]

bolsonaro = [
    item
    for item in fechados
    if item["governo"] == "bolsonaro"
]

lula = [
    item
    for item in fechados
    if item["governo"] == "lula"
]

bolsonaro_3 = [
    item
    for item in fechados
    if item["ano"] in (2019, 2020, 2021)
]

lula_3 = [
    item
    for item in fechados
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


ultimo_ano_fechado = max(
    item["ano"] for item in fechados
)


documento = {
    "id": "pib",
    "titulo": "Crescimento real do PIB",
    "unidade": "%",
    "metodologia": (
        "Variação anual em volume do Produto Interno Bruto. "
        "Os anos fechados são obtidos da taxa acumulada "
        "ao longo do ano, no quarto trimestre, das "
        "Contas Nacionais Trimestrais do IBGE. "
        "O acumulado de cada período é calculado de "
        "forma composta, e não pela soma das taxas anuais."
    ),
    "fontes": [
        {
            "instituicao": "IBGE",
            "pesquisa": (
                "Sistema de Contas Nacionais Trimestrais"
            ),
            "tabelaSidra": TABELA,
            "classificacaoSidra": CLASSIFICACAO,
            "categoriaPIB": PIB,
            "variaveisSidra": {
                "mesmoTrimestreAnoAnterior":
                    VAR_MESMO_TRIMESTRE,
                "acumuladoQuatroTrimestres":
                    VAR_QUATRO_TRIMESTRES,
                "acumuladoAno":
                    VAR_ACUMULADO_ANO,
                "trimestreAnterior":
                    VAR_TRIMESTRE_ANTERIOR
            },
            "url": (
                "https://sidra.ibge.gov.br/tabela/5932"
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
        "descricao": (
            "Primeiros três anos completos de cada governo"
        ),
        "bolsonaro": {
            "periodo": "2019-2021",
            "valor": acumulado_composto(
                bolsonaro_3
            )
        },
        "lula": {
            "periodo": "2023-2025",
            "valor": acumulado_composto(
                lula_3
            )
        }
    },
    "ultimoAnoAnualDisponivel":
        ultimo_ano_fechado,
    "revisoesDetectadas": revisoes,
    "atualizadoEm":
        datetime.now().isoformat(
            timespec="seconds"
        )
}


#
# GRAVAÇÃO SEGURA
#

tmp = OUT.with_suffix(".json.tmp")

with tmp.open(
    "w",
    encoding="utf-8"
) as f:
    json.dump(
        documento,
        f,
        ensure_ascii=False,
        indent=2
    )


with tmp.open(
    "r",
    encoding="utf-8"
) as f:
    teste = json.load(f)


fechados_teste = [
    item
    for item in teste["anos"]
    if item["valor"] is not None
]

if len(fechados_teste) < 7:
    raise RuntimeError(
        "Validação final encontrou poucos anos."
    )


tmp.replace(OUT)


print()
print("PIB atualizado com sucesso.")
print()

for item in anos:
    if item["valor"] is not None:
        print(
            item["ano"],
            item["valor"]
        )
    else:
        print(
            item["ano"],
            "ano em andamento"
        )

print()
print(
    "Bolsonaro 2019-2022:",
    documento["acumulados"]["bolsonaro"]["valor"],
    "%"
)

print(
    "Lula 2023-2025:",
    documento["acumulados"]["lula"]["valor"],
    "%"
)

print(
    "Mesma duração Bolsonaro:",
    documento["comparacaoMesmaDuracao"]
    ["bolsonaro"]["valor"],
    "%"
)

print(
    "Mesma duração Lula:",
    documento["comparacaoMesmaDuracao"]
    ["lula"]["valor"],
    "%"
)

print()
print("Arquivo:", OUT)

import json
import urllib.request
from datetime import datetime
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]

ARQUIVO_SAIDA = (
    BASE / "data" / "economia" / "gerado" /
    "analfabetismo.json"
)

TABELA = 7113
VARIAVEL = 10267
SEXO_TOTAL = 6794
GRUPO_15_MAIS = 2795

URL = (
    "https://apisidra.ibge.gov.br/values/"
    f"t/{TABELA}/n1/1/v/{VARIAVEL}/p/all/"
    f"c2/{SEXO_TOTAL}/c58/{GRUPO_15_MAIS}"
    "?formato=json"
)


def carregar_anterior():
    if not ARQUIVO_SAIDA.exists():
        return {}

    with ARQUIVO_SAIDA.open("r", encoding="utf-8") as f:
        dados = json.load(f)

    return {
        item["ano"]: item["valor"]
        for item in dados.get("anos", [])
        if item.get("valor") is not None
    }


print("Atualizando taxa de analfabetismo...")
print()

anterior = carregar_anterior()

req = urllib.request.Request(
    URL,
    headers={
        "User-Agent": "ForaDaPauta/1.0",
        "Accept": "application/json",
    }
)

with urllib.request.urlopen(req, timeout=30) as response:
    dados = json.loads(
        response.read().decode("utf-8")
    )

if len(dados) <= 1:
    raise RuntimeError(
        "SIDRA retornou série vazia."
    )


serie = {}

for item in dados[1:]:
    valor_txt = str(item.get("V", "")).strip()

    if valor_txt in ("", "..", "...", "-"):
        continue

    try:
        ano = int(item["D3N"])
        valor = float(
            valor_txt.replace(",", ".")
        )
    except (KeyError, ValueError):
        continue

    if ano < 2019:
        continue

    serie[ano] = valor


if 2019 not in serie:
    raise RuntimeError(
        "Ano de 2019 não encontrado na série."
    )

if 2022 not in serie:
    raise RuntimeError(
        "Ano de 2022 não encontrado na série."
    )

if 2023 not in serie:
    raise RuntimeError(
        "Ano de 2023 não encontrado na série."
    )


anos = []

for ano in sorted(serie):
    registro = {
        "ano": ano,
        "governo": (
            "bolsonaro"
            if ano <= 2022
            else "lula"
        ),
        "valor": serie[ano],
        "tipo": "anual-fechado",
        "origem": (
            "IBGE SIDRA tabela 7113, "
            "variável 10267"
        )
    }

    if ano == 2020:
        registro["contexto"] = (
            "Pandemia de COVID-19"
        )

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
# ANOS AUSENTES
#

ano_final = max(serie)

anos_sem_dado = []

for ano in range(2019, ano_final + 1):
    if ano not in serie:
        anos_sem_dado.append({
            "ano": ano,
            "motivo": (
                "Sem observação disponível nesta série "
                "da PNAD Contínua Educação."
            )
        })


#
# EVOLUÇÃO
#

variacao_bolsonaro = round(
    serie[2022] - serie[2019],
    2
)

anos_lula = [
    ano
    for ano in serie
    if ano >= 2023
]

ultimo_lula = max(anos_lula)

variacao_lula = round(
    serie[ultimo_lula] - serie[2023],
    2
)


documento = {
    "id": "analfabetismo",
    "titulo": "Taxa de analfabetismo",
    "unidade": "%",
    "metodologia": (
        "Taxa de analfabetismo das pessoas de 15 anos "
        "ou mais de idade no Brasil, segundo a PNAD "
        "Contínua Educação. Anos sem observação são "
        "mantidos explicitamente como ausentes e não "
        "são interpolados."
    ),
    "fonte": {
        "instituicao": "IBGE",
        "pesquisa": "PNAD Contínua Educação",
        "tabelaSidra": TABELA,
        "variavelSidra": VARIAVEL,
        "sexoCodigo": SEXO_TOTAL,
        "sexo": "Total",
        "grupoIdadeCodigo": GRUPO_15_MAIS,
        "grupoIdade": "15 anos ou mais",
        "url": "https://sidra.ibge.gov.br/tabela/7113"
    },
    "anos": anos,
    "anosSemDado": anos_sem_dado,
    "evolucaoDadosDisponiveis": {
        "bolsonaro": {
            "periodo": "2019–2022",
            "inicio": serie[2019],
            "fim": serie[2022],
            "variacaoPontosPercentuais":
                variacao_bolsonaro
        },
        "lula": {
            "periodo": f"2023–{ultimo_lula}",
            "inicio": serie[2023],
            "fim": serie[ultimo_lula],
            "variacaoPontosPercentuais":
                variacao_lula
        }
    },
    "ultimoAnoDisponivel": ano_final,
    "revisoesDetectadas": revisoes,
    "atualizadoEm": datetime.now().isoformat(
        timespec="seconds"
    )
}


tmp = ARQUIVO_SAIDA.with_suffix(".json.tmp")

with tmp.open("w", encoding="utf-8") as f:
    json.dump(
        documento,
        f,
        ensure_ascii=False,
        indent=2
    )

with tmp.open("r", encoding="utf-8") as f:
    teste = json.load(f)

if not teste["anos"]:
    raise RuntimeError(
        "Validação final encontrou série vazia."
    )

tmp.replace(ARQUIVO_SAIDA)


print()
print("Analfabetismo atualizado com sucesso.")
print()

for ano in range(2019, ano_final + 1):
    if ano in serie:
        print(ano, serie[ano])
    else:
        print(ano, "sem dado")

print()
print(
    "Bolsonaro 2019-2022:",
    serie[2019],
    "->",
    serie[2022],
    "=",
    variacao_bolsonaro,
    "p.p."
)

print(
    f"Lula 2023-{ultimo_lula}:",
    serie[2023],
    "->",
    serie[ultimo_lula],
    "=",
    variacao_lula,
    "p.p."
)

print()
print("Arquivo:", ARQUIVO_SAIDA)

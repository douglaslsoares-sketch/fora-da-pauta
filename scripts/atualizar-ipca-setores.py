import json
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "economia" / "gerado" / "ipca-setores.json"

TABELA_ANTIGA = 1419
TABELA_ATUAL = 7060
VAR_MENSAL = 63
VAR_PESO = 66

GRUPOS = {
    7170: "Alimentação e bebidas",
    7445: "Habitação",
    7486: "Artigos de residência",
    7558: "Vestuário",
    7625: "Transportes",
    7660: "Saúde e cuidados pessoais",
    7712: "Despesas pessoais",
    7766: "Educação",
    7786: "Comunicação",
}

ANO_CORRENTE = datetime.now().year


def baixar_json(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "ForaDaPauta/1.0"}
    )

    with urllib.request.urlopen(req, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def numero(valor):
    return float(str(valor).replace(",", "."))


def acumular(valores):
    fator = 1.0

    for valor in valores:
        fator *= 1 + valor / 100.0

    return round((fator - 1) * 100, 2)


def carregar_anterior():
    if not OUT.exists():
        return {}

    with OUT.open("r", encoding="utf-8") as f:
        dados = json.load(f)

    resultado = {}

    for grupo in dados.get("grupos", []):
        codigo = str(grupo["codigo"])

        resultado[codigo] = {
            item["ano"]: item["valor"]
            for item in grupo.get("anos", [])
            if item.get("valor") is not None
        }

    return resultado


def consultar_tabela(tabela, periodo_inicial, periodo_final, codigo, variavel=VAR_MENSAL):
    url = (
        "https://apisidra.ibge.gov.br/values/"
        f"t/{tabela}/n1/1/v/{variavel}/"
        f"p/{periodo_inicial}-{periodo_final}/"
        f"c315/{codigo}?formato=json"
    )

    dados = baixar_json(url)

    serie = []

    for linha in dados[1:]:
        bruto = str(linha.get("V", "")).strip()

        if bruto in ("", "..", "...", "-"):
            continue

        serie.append({
            "periodoCodigo": str(linha["D3C"]),
            "periodo": linha["D3N"],
            "valor": numero(bruto),
        })

    return serie


print("Atualizando inflação por grupos do IPCA...")
print()

anterior = carregar_anterior()

grupos_saida = []
revisoes = []

for codigo, nome in GRUPOS.items():
    print(f"Consultando {nome}...")

    serie = []

    #
    # 2019 — estrutura antiga
    #
    serie += consultar_tabela(
        TABELA_ANTIGA,
        "201901",
        "201912",
        codigo,
    )

    #
    # 2020 em diante — estrutura atual
    #
    serie += consultar_tabela(
        TABELA_ATUAL,
        "202001",
        f"{ANO_CORRENTE}12",
        codigo,
    )

    serie.sort(
        key=lambda item: item["periodoCodigo"]
    )

    if not serie:
        raise RuntimeError(
            f"Nenhum dado encontrado para {nome}."
        )

    #
    # PESO ATUAL NO IPCA
    #
    serie_pesos = consultar_tabela(
        TABELA_ATUAL,
        f"{ANO_CORRENTE}01",
        f"{ANO_CORRENTE}12",
        codigo,
        VAR_PESO,
    )

    serie_pesos.sort(
        key=lambda item: item["periodoCodigo"]
    )

    ultimo_peso = serie_pesos[-1] if serie_pesos else None

    peso_atual = (
        round(ultimo_peso["valor"], 4)
        if ultimo_peso
        else None
    )

    periodo_peso = (
        ultimo_peso["periodo"]
        if ultimo_peso
        else None
    )

    #
    # ANOS FECHADOS
    #
    anos = []

    for ano in range(2019, ANO_CORRENTE):
        prefixo = str(ano)

        meses = [
            item
            for item in serie
            if item["periodoCodigo"].startswith(prefixo)
        ]

        if len(meses) != 12:
            raise RuntimeError(
                f"{nome}: ano {ano} tem "
                f"{len(meses)} meses, esperado 12."
            )

        valor = acumular(
            [item["valor"] for item in meses]
        )

        registro = {
            "ano": ano,
            "governo": (
                "bolsonaro"
                if ano <= 2022
                else "lula"
            ),
            "valor": valor,
            "tipo": "anual-fechado",
        }

        if ano == 2020:
            registro["contexto"] = "Pandemia de COVID-19"

        anos.append(registro)

        antigo = (
            anterior
            .get(str(codigo), {})
            .get(ano)
        )

        if (
            antigo is not None
            and abs(antigo - valor) > 0.000001
        ):
            revisoes.append({
                "grupoCodigo": codigo,
                "grupo": nome,
                "ano": ano,
                "valorAnterior": antigo,
                "valorNovo": valor,
            })

    #
    # ANO CORRENTE
    #
    meses_correntes = [
        item
        for item in serie
        if item["periodoCodigo"].startswith(
            str(ANO_CORRENTE)
        )
    ]

    ultimo_dado = None
    acumulado_corrente = None

    if meses_correntes:
        acumulado_corrente = acumular(
            [item["valor"] for item in meses_correntes]
        )

        ultimo = meses_correntes[-1]

        ultimo_dado = {
            "periodoCodigo": ultimo["periodoCodigo"],
            "periodo": ultimo["periodo"],
            "acumuladoNoAno": acumulado_corrente,
            "mesesDisponiveis": len(meses_correntes),
        }

    anos.append({
        "ano": ANO_CORRENTE,
        "governo": "lula",
        "valor": None,
        "tipo": "ano-em-andamento",
        "ultimoDado": ultimo_dado,
    })

    #
    # ACUMULADOS DE GOVERNO
    #
    bolsonaro_meses = [
        item["valor"]
        for item in serie
        if "201901" <= item["periodoCodigo"] <= "202212"
    ]

    lula_meses = [
        item["valor"]
        for item in serie
        if item["periodoCodigo"] >= "202301"
    ]

    mesma_duracao_bolsonaro = [
        item["valor"]
        for item in serie
        if "201901" <= item["periodoCodigo"] <= "202112"
    ]

    mesma_duracao_lula = [
        item["valor"]
        for item in serie
        if "202301" <= item["periodoCodigo"] <= "202512"
    ]

    grupos_saida.append({
        "codigo": codigo,
        "nome": nome,
        "pesoAtual": peso_atual,
        "periodoPeso": periodo_peso,
        "anos": anos,
        "acumulados": {
            "bolsonaro2019a2022": {
                "periodo": "2019-2022",
                "meses": len(bolsonaro_meses),
                "valor": acumular(bolsonaro_meses),
            },
            "lulaDesde2023": {
                "periodo": (
                    f"2023-{ultimo_dado['periodo']}"
                    if ultimo_dado
                    else "2023"
                ),
                "meses": len(lula_meses),
                "valor": acumular(lula_meses),
                "parcial": True,
            },
        },
        "comparacaoMesmaDuracao": {
            "descricao": (
                "Primeiros três anos completos "
                "de cada governo"
            ),
            "bolsonaro": {
                "periodo": "2019-2021",
                "valor": acumular(
                    mesma_duracao_bolsonaro
                ),
            },
            "lula": {
                "periodo": "2023-2025",
                "valor": acumular(
                    mesma_duracao_lula
                ),
            },
        },
    })


documento = {
    "id": "ipca-setores",
    "titulo": "Inflação por grupos do IPCA",
    "unidade": "%",
    "metodologia": (
        "Variação acumulada composta das taxas mensais "
        "do IPCA para os nove grandes grupos de produtos "
        "e serviços. Para 2019, usamos a tabela histórica "
        "1419 do SIDRA. A partir de 2020, usamos a tabela "
        "7060. Os nove grupos mantêm correspondência "
        "conceitual entre as duas estruturas."
    ),
    "fontes": [
        {
            "instituicao": "IBGE",
            "pesquisa": "IPCA",
            "tabelaSidra": TABELA_ANTIGA,
            "periodo": "2019",
            "variavelSidra": VAR_MENSAL,
            "url": "https://sidra.ibge.gov.br/tabela/1419",
        },
        {
            "instituicao": "IBGE",
            "pesquisa": "IPCA",
            "tabelaSidra": TABELA_ATUAL,
            "periodo": "2020 em diante",
            "variavelSidra": VAR_MENSAL,
            "variavelPesoSidra": VAR_PESO,
            "url": "https://sidra.ibge.gov.br/tabela/7060",
        },
    ],
    "grupos": grupos_saida,
    "observacao": (
        "O grupo 'Alimentação e bebidas' é a classificação "
        "oficial ampla do IPCA. Valores divulgados genericamente "
        "como 'inflação dos alimentos' podem usar outros recortes "
        "e não são necessariamente comparáveis."
    ),
    "revisoesDetectadas": revisoes,
    "atualizadoEm": datetime.now().isoformat(
        timespec="seconds"
    ),
}


OUT.parent.mkdir(
    parents=True,
    exist_ok=True
)

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

if len(teste["grupos"]) != 9:
    raise RuntimeError(
        "Quantidade inesperada de grupos."
    )

tmp.replace(OUT)


print()
print("IPCA por grupos atualizado com sucesso.")
print()

for grupo in grupos_saida:
    bolsonaro = (
        grupo["acumulados"]
        ["bolsonaro2019a2022"]["valor"]
    )

    lula = (
        grupo["acumulados"]
        ["lulaDesde2023"]["valor"]
    )

    print(
        grupo["nome"],
        "| Peso:",
        grupo["pesoAtual"],
        "%",
        "| Bolsonaro:",
        bolsonaro,
        "% | Lula até agora:",
        lula,
        "%"
    )

print()

if revisoes:
    print(
        "Revisões históricas detectadas:",
        len(revisoes)
    )
else:
    print("Nenhuma revisão histórica detectada.")

print()
print("Arquivo:", OUT)

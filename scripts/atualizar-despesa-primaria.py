import json
from pathlib import Path

import openpyxl

BASE = Path(__file__).resolve().parents[1]

ARQUIVO_FONTE = (
    BASE / "data" / "economia" / "fontes" /
    "rtn-serie-historica-mensal.xlsx"
)

ARQUIVO_SAIDA = (
    BASE / "data" / "economia" / "gerado" /
    "despesa-primaria.json"
)

print("Lendo série histórica do Tesouro Nacional...")

wb = openpyxl.load_workbook(
    ARQUIVO_FONTE,
    data_only=True,
    read_only=True
)

ws = wb["2.5-A"]

cabecalho = list(
    next(
        ws.iter_rows(
            min_row=5,
            max_row=5,
            values_only=True
        )
    )
)

linha_despesa = list(
    next(
        ws.iter_rows(
            min_row=21,
            max_row=21,
            values_only=True
        )
    )
)

if linha_despesa[0] != "2. DESPESA TOTAL":
    raise RuntimeError(
        "Linha esperada de DESPESA TOTAL não encontrada."
    )

serie = {}

for ano in range(2019, 2026):
    coluna = cabecalho.index(ano)
    valor = linha_despesa[coluna]

    if valor is None:
        raise ValueError(
            f"Valor não encontrado para {ano}"
        )

    serie[ano] = round(float(valor) * 100, 2)

anos = []

for ano, valor in serie.items():
    anos.append({
        "ano": ano,
        "governo": (
            "bolsonaro"
            if ano <= 2022
            else "lula"
        ),
        "valor": valor,
        "tipo": "anual-fechado"
    })

media_bolsonaro_3 = round(
    sum(serie[a] for a in (2019, 2020, 2021)) / 3,
    2
)

media_lula_3 = round(
    sum(serie[a] for a in (2023, 2024, 2025)) / 3,
    2
)

dados = {
    "id": "despesa-primaria",
    "titulo": "Despesa primária do Governo Central",
    "unidade": "% do PIB",
    "metodologia": (
        "Despesa total primária do Governo Central apurada "
        "pelo critério de valor pago, como proporção do PIB, "
        "conforme a série histórica do Resultado do Tesouro Nacional."
    ),
    "fonte": {
        "instituicao": "Tesouro Nacional",
        "pesquisa": "Resultado do Tesouro Nacional - Série Histórica",
        "tabela": "2.5-A"
    },
    "anos": anos,
    "comparacaoMesmaDuracao": {
        "descricao": (
            "Média da despesa primária nos primeiros três "
            "anos completos de cada governo"
        ),
        "bolsonaro": {
            "periodo": "2019-2021",
            "media": media_bolsonaro_3
        },
        "lula": {
            "periodo": "2023-2025",
            "media": media_lula_3
        }
    },
    "ultimoAnoDisponivel": 2025
}

ARQUIVO_SAIDA.parent.mkdir(
    parents=True,
    exist_ok=True
)

with open(
    ARQUIVO_SAIDA,
    "w",
    encoding="utf-8"
) as f:
    json.dump(
        dados,
        f,
        ensure_ascii=False,
        indent=2
    )

print()
print("Despesa primária atualizada com sucesso.")
print()
print("Serie:")

for ano, valor in serie.items():
    print(ano, valor)

print()
print(
    "Bolsonaro 2019-2021 media:",
    media_bolsonaro_3
)

print(
    "Lula 2023-2025 media:",
    media_lula_3
)

print()
print("Arquivo:", ARQUIVO_SAIDA)

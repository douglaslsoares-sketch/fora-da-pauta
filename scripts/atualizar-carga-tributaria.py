import json
from pathlib import Path

import openpyxl

BASE = Path(__file__).resolve().parents[1]

ARQUIVO_FONTE = (
    BASE / "data" / "economia" / "fontes" /
    "carga-tributaria-2024.xlsx"
)

ARQUIVO_SAIDA = (
    BASE / "data" / "economia" / "gerado" /
    "carga-tributaria.json"
)

print("Lendo planilha oficial da Receita Federal...")

wb = openpyxl.load_workbook(
    ARQUIVO_FONTE,
    data_only=True,
    read_only=True
)

ws = wb["T01B"]

# Linha 5 contém os anos.
cabecalho = list(
    next(
        ws.iter_rows(
            min_row=5,
            max_row=5,
            values_only=True
        )
    )
)

# Linha 6 contém o Total da Receita Tributária.
valores = list(
    next(
        ws.iter_rows(
            min_row=6,
            max_row=6,
            values_only=True
        )
    )
)

serie = {}

for ano in range(2019, 2025):
    coluna = cabecalho.index(ano)
    valor = valores[coluna]

    if valor is None:
        raise ValueError(
            f"Valor não encontrado para {ano}"
        )

    # A planilha armazena 30,44% como 0,3044.
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

media_bolsonaro = round(
    sum(serie[a] for a in (2019, 2020, 2021)) / 3,
    2
)

# Só há 2023 e 2024 para Lula.
media_lula_disponivel = round(
    sum(serie[a] for a in (2023, 2024)) / 2,
    2
)

dados = {
    "id": "carga-tributaria",
    "titulo": "Carga tributária",
    "unidade": "% do PIB",
    "metodologia": (
        "Total da receita tributária como proporção do PIB, "
        "conforme a série histórica publicada pela Receita Federal."
    ),
    "fonte": {
        "instituicao": "Receita Federal",
        "pesquisa": "Carga Tributária no Brasil 2024",
        "tabela": "TRIB 01-B"
    },
    "anos": anos,
    "comparacao": {
        "bolsonaro2019a2021": {
            "periodo": "2019-2021",
            "media": media_bolsonaro
        },
        "lulaDisponivel": {
            "periodo": "2023-2024",
            "media": media_lula_disponivel
        }
    },
    "ultimoAnoDisponivel": 2024
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
print("Carga tributária atualizada com sucesso.")
print()
print("Serie:")

for ano, valor in serie.items():
    print(ano, valor)

print()
print(
    "Bolsonaro 2019-2021 media:",
    media_bolsonaro
)

print(
    "Lula 2023-2024 media:",
    media_lula_disponivel
)

print()
print("Arquivo:", ARQUIVO_SAIDA)

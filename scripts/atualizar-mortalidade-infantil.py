import json
from pathlib import Path
from datetime import datetime

import openpyxl
import xlrd

BASE = Path(__file__).resolve().parents[1]

FONTES = BASE / "data" / "economia" / "fontes"

SAIDA = (
    BASE / "data" / "economia" / "gerado" /
    "mortalidade-infantil.json"
)

def ler_xls(ano):
    arquivo = FONTES / f"mortalidade-{ano}-ambos-sexos.xls"
    wb = xlrd.open_workbook(arquivo)
    ws = wb.sheet_by_index(0)

    for i in range(ws.nrows):
        if ws.cell_value(i, 0) == 0:
            return float(ws.cell_value(i, 1))

    raise RuntimeError(
        f"Idade 0 não encontrada para {ano}"
    )


def ler_xlsx(ano):
    arquivo = FONTES / f"mortalidade-{ano}-ambos-sexos.xlsx"

    wb = openpyxl.load_workbook(
        arquivo,
        data_only=True,
        read_only=True
    )

    ws = wb[wb.sheetnames[0]]

    for row in ws.iter_rows(values_only=True):
        if row and row[0] == 0:
            return float(row[1])

    raise RuntimeError(
        f"Idade 0 não encontrada para {ano}"
    )


print("Lendo Tábuas Completas de Mortalidade do IBGE...")

serie = {}

for ano in range(2019, 2025):
    if ano <= 2020:
        valor = ler_xls(ano)
    else:
        valor = ler_xlsx(ano)

    serie[ano] = round(valor, 2)


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


variacao_bolsonaro = round(
    serie[2022] - serie[2019],
    2
)

variacao_lula = round(
    serie[2024] - serie[2023],
    2
)


dados = {
    "id": "mortalidade-infantil",
    "titulo": "Mortalidade infantil",
    "unidade": "por mil",
    "metodologia": (
        "Probabilidade de morte entre o nascimento e "
        "a idade exata de 1 ano, por mil, segundo as "
        "Tábuas Completas de Mortalidade do IBGE."
    ),
    "fonte": {
        "instituicao": "IBGE",
        "pesquisa": "Tábuas Completas de Mortalidade",
        "sexo": "Ambos os sexos"
    },
    "anos": anos,
    "evolucaoDadosDisponiveis": {
        "bolsonaro": {
            "periodo": "2019–2022",
            "inicio": serie[2019],
            "fim": serie[2022],
            "variacaoPorMil": variacao_bolsonaro
        },
        "lula": {
            "periodo": "2023–2024",
            "inicio": serie[2023],
            "fim": serie[2024],
            "variacaoPorMil": variacao_lula
        }
    },
    "ultimoAnoDisponivel": 2024,
    "atualizadoEm": datetime.now().isoformat(
        timespec="seconds"
    )
}


SAIDA.parent.mkdir(
    parents=True,
    exist_ok=True
)

tmp = SAIDA.with_suffix(".json.tmp")

with tmp.open("w", encoding="utf-8") as f:
    json.dump(
        dados,
        f,
        ensure_ascii=False,
        indent=2
    )

with tmp.open("r", encoding="utf-8") as f:
    json.load(f)

tmp.replace(SAIDA)


print()
print("Mortalidade infantil atualizada com sucesso.")
print()

for ano, valor in serie.items():
    print(ano, valor)

print()
print(
    "Bolsonaro 2019-2022:",
    serie[2019],
    "->",
    serie[2022],
    "=",
    variacao_bolsonaro,
    "por mil"
)

print(
    "Lula 2023-2024:",
    serie[2023],
    "->",
    serie[2024],
    "=",
    variacao_lula,
    "por mil"
)

print()
print("Arquivo:", SAIDA)

import json
import urllib.request
from pathlib import Path
from datetime import datetime

BASE = Path(__file__).resolve().parents[1]

ARQUIVO_SAIDA = (
    BASE / "data" / "economia" / "gerado" /
    "analfabetismo.json"
)

URL = (
    "https://apisidra.ibge.gov.br/values/"
    "t/7113/n1/1/v/10267/p/all/c2/6794/c58/2795"
)

print("Consultando taxa de analfabetismo no SIDRA...")

req = urllib.request.Request(
    URL,
    headers={
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
    }
)

with urllib.request.urlopen(req, timeout=30) as response:
    dados = json.loads(
        response.read().decode("utf-8")
    )

if len(dados) <= 1:
    raise RuntimeError("SIDRA retornou série vazia.")

serie = {}

for item in dados[1:]:
    ano = int(item["D3N"])
    valor = item["V"]

    if ano < 2019 or ano > 2025:
        continue

    if valor in ("..", "-", "", None):
        continue

    serie[ano] = float(
        str(valor).replace(",", ".")
    )

anos = []

for ano in range(2019, 2026):
    if ano in serie:
        registro = {
            "ano": ano,
            "governo": (
                "bolsonaro"
                if ano <= 2022
                else "lula"
            ),
            "valor": serie[ano],
            "tipo": "anual-fechado"
        }

        anos.append(registro)

# Mudança entre primeiro e último dado disponível
# dentro de cada governo, sem tratar anos ausentes
# como se fossem observações.

variacao_bolsonaro = round(
    serie[2022] - serie[2019],
    2
)

variacao_lula = round(
    serie[2025] - serie[2023],
    2
)

documento = {
    "id": "analfabetismo",
    "titulo": "Taxa de analfabetismo",
    "unidade": "%",
    "metodologia": (
        "Taxa de analfabetismo das pessoas de 15 anos "
        "ou mais de idade no Brasil, segundo a PNAD "
        "Contínua Educação. A pesquisa não possui "
        "observações para 2020 e 2021 nesta série."
    ),
    "fonte": {
        "instituicao": "IBGE",
        "pesquisa": "PNAD Contínua Educação",
        "tabelaSidra": 7113,
        "variavelSidra": 10267,
        "grupoIdadeCodigo": 2795,
        "grupoIdade": "15 anos ou mais",
        "url": "https://sidra.ibge.gov.br/tabela/7113"
    },
    "anos": anos,
    "anosSemDado": [
        {
            "ano": 2020,
            "motivo": (
                "Sem observação disponível nesta série "
                "da PNAD Contínua Educação."
            )
        },
        {
            "ano": 2021,
            "motivo": (
                "Sem observação disponível nesta série "
                "da PNAD Contínua Educação."
            )
        }
    ],
    "evolucaoDadosDisponiveis": {
        "bolsonaro": {
            "periodo": "2019–2022",
            "inicio": serie[2019],
            "fim": serie[2022],
            "variacaoPontosPercentuais": variacao_bolsonaro
        },
        "lula": {
            "periodo": "2023–2025",
            "inicio": serie[2023],
            "fim": serie[2025],
            "variacaoPontosPercentuais": variacao_lula
        }
    },
    "ultimoAnoDisponivel": max(serie),
    "atualizadoEm": datetime.now().isoformat(
        timespec="seconds"
    )
}

ARQUIVO_SAIDA.parent.mkdir(
    parents=True,
    exist_ok=True
)

tmp = ARQUIVO_SAIDA.with_suffix(".json.tmp")

with tmp.open("w", encoding="utf-8") as f:
    json.dump(
        documento,
        f,
        ensure_ascii=False,
        indent=2
    )

with tmp.open("r", encoding="utf-8") as f:
    json.load(f)

tmp.replace(ARQUIVO_SAIDA)

print()
print("Analfabetismo atualizado com sucesso.")
print()
print("Serie:")

for ano in range(2019, 2026):
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
    "Lula 2023-2025:",
    serie[2023],
    "->",
    serie[2025],
    "=",
    variacao_lula,
    "p.p."
)

print()
print("Arquivo:", ARQUIVO_SAIDA)

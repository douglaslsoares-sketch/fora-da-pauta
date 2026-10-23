#!/usr/bin/env python3
"""Importa candidaturas municipais de 2024 de um ZIP oficial do TSE, sem sobrescrever 2026.

Uso:
  python scripts/importar-municipais-2024.py caminho/consulta_cand_2024.zip

Requer o ZIP oficial em https://dadosabertos.tse.jus.br/dataset/candidatos-2024
e grava um arquivo JSON por UF em data/eleicoes/gerado/municipais-2024/.
Não altera a base publicada de candidaturas nem inscrições do Telegram.
"""
import csv
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import zipfile

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "data" / "eleicoes" / "gerado" / "municipais-2024"
COLUNAS = {
    "SQ_CANDIDATO", "NM_URNA_CANDIDATO", "NM_CANDIDATO",
    "NR_CANDIDATO", "DS_CARGO", "SG_UF", "SG_UE", "NM_UE",
    "SG_PARTIDO", "NM_PARTIDO", "DS_SITUACAO_CANDIDATURA",
}
CARGOS = {"PREFEITO": "prefeito", "VICE-PREFEITO": "vice-prefeito", "VEREADOR": "vereador"}

def importar(arquivo: Path):
    if not arquivo.is_file() or not zipfile.is_zipfile(arquivo):
        raise ValueError("Informe um ZIP válido de consulta_cand_2024 do TSE")
    por_uf = {}
    vistos = set()
    with zipfile.ZipFile(arquivo) as pacote:
        arquivos = [n for n in pacote.namelist()
                    if Path(n).name.lower().startswith("consulta_cand_2024_")
                    and n.lower().endswith(".csv")]
        # Prefere BRASIL único; se não existir, lê os estados, nunca ambos.
        brasil = [n for n in arquivos if Path(n).name.upper() == "CONSULTA_CAND_2024_BRASIL.CSV"]
        escolhidos = brasil or [n for n in arquivos if len(Path(n).stem.split("_")[-1]) == 2]
        if not escolhidos:
            raise ValueError("Não foi encontrado CSV de candidaturas 2024 no ZIP")
        for nome in escolhidos:
            with pacote.open(nome) as f:
                leitor = csv.DictReader(io.TextIOWrapper(f, encoding="latin-1", newline=""), delimiter=";")
                if not COLUNAS.issubset(set(leitor.fieldnames or [])):
                    raise ValueError("CSV sem os campos TSE esperados: " + nome)
                for linha in leitor:
                    cargo = CARGOS.get((linha["DS_CARGO"] or "").strip().upper())
                    if cargo is None:
                        continue
                    codigo = (linha["SQ_CANDIDATO"] or "").strip()
                    uf = (linha["SG_UF"] or "").strip().upper()
                    if not codigo.isdigit() or len(uf) != 2 or not uf.isalpha():
                        raise ValueError("Identificador ou UF inválido")
                    chave = (uf, codigo)
                    if chave in vistos:
                        continue
                    vistos.add(chave)
                    numero = (linha["NR_CANDIDATO"] or "").strip()
                    if not numero.isdigit():
                        raise ValueError("Número eleitoral inválido")
                    por_uf.setdefault(uf, []).append({
                        "id": codigo,
                        "eleicao": 2024,
                        "nomeUrna": linha["NM_URNA_CANDIDATO"].strip(),
                        "nomeCompleto": linha["NM_CANDIDATO"].strip(),
                        "numero": int(numero),
                        "cargo": cargo,
                        "uf": uf,
                        "municipioCodigoTse": linha["SG_UE"].strip(),
                        "municipio": linha["NM_UE"].strip(),
                        "siglaPartido": linha["SG_PARTIDO"].strip(),
                        "partido": linha["NM_PARTIDO"].strip(),
                        "situacaoTse": linha["DS_SITUACAO_CANDIDATURA"].strip(),
                        "fonteOficial": "https://dadosabertos.tse.jus.br/dataset/candidatos-2024",
                        "resultadoEleitoral": None,
                    })
    if sum(map(len, por_uf.values())) < 1000:
        raise ValueError("Amostra muito pequena: importação recusada")
    DESTINO.mkdir(parents=True, exist_ok=True)
    for uf, itens in por_uf.items():
        alvo = DESTINO / f"{uf}.json"
        fd, temporario = tempfile.mkstemp(dir=DESTINO, prefix=f".{uf}-", suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as saida:
                json.dump(sorted(itens, key=lambda x: x["id"]), saida, ensure_ascii=False, indent=2)
                saida.write("\n")
            os.replace(temporario, alvo)
        finally:
            if os.path.exists(temporario):
                os.unlink(temporario)
    print(f"Importadas {sum(map(len, por_uf.values()))} candidaturas municipais em {len(por_uf)} UFs.")
    print("Resultados (eleito/não eleito) NÃO incluídos: exigem arquivo oficial próprio.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python scripts/importar-municipais-2024.py consulta_cand_2024.zip")
    importar(Path(sys.argv[1]))

import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

type SituacaoIdentidadePolitica =
  | "CONFIRMADA"
  | "EM_REVISAO";

type CandidaturaDaIdentidade = {
  candidaturaId: string;
};

type IdentidadePolitica = {
  pessoaPoliticaId: string;
  situacaoIdentidade?: SituacaoIdentidadePolitica;
  candidaturas: CandidaturaDaIdentidade[];
};

export type IdentidadePoliticaDaCandidatura = {
  pessoaPoliticaId: string;
  situacaoIdentidade: SituacaoIdentidadePolitica;
};

let identidadePorCandidatura:
  Map<
    string,
    IdentidadePoliticaDaCandidatura | null
  > | null = null;

function carregarMapaDeIdentidades() {
  if (identidadePorCandidatura) {
    return identidadePorCandidatura;
  }

  const filePath =
    join(
      process.cwd(),
      "data",
      "eleicoes",
      "gerado",
      "identidades-politicas.json",
    );

  const raw =
    readFileSync(
      filePath,
      "utf8",
    );

  const parsed: unknown =
    JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(
      "A base de identidades politicas nao possui o formato esperado.",
    );
  }

  const mapa =
    new Map<
      string,
      IdentidadePoliticaDaCandidatura | null
    >();

  for (const item of parsed) {
    if (
      !item ||
      typeof item !== "object"
    ) {
      continue;
    }

    const identidade =
      item as Partial<IdentidadePolitica>;

    if (
      typeof identidade.pessoaPoliticaId !==
        "string" ||
      !Array.isArray(
        identidade.candidaturas,
      )
    ) {
      continue;
    }

    const situacao:
      SituacaoIdentidadePolitica =
        identidade.situacaoIdentidade ===
        "CONFIRMADA"
          ? "CONFIRMADA"
          : "EM_REVISAO";

    for (
      const candidatura of
      identidade.candidaturas
    ) {
      if (
        !candidatura ||
        typeof candidatura !== "object" ||
        typeof candidatura.candidaturaId !==
          "string"
      ) {
        continue;
      }

      const candidaturaId =
        candidatura.candidaturaId.trim();

      if (!candidaturaId) {
        continue;
      }

      const novoValor = {
        pessoaPoliticaId:
          identidade.pessoaPoliticaId,
        situacaoIdentidade:
          situacao,
      };

      if (!mapa.has(candidaturaId)) {
        mapa.set(
          candidaturaId,
          novoValor,
        );

        continue;
      }

      const anterior =
        mapa.get(candidaturaId);

      /*
       * Se uma candidatura aparecer ligada a
       * identidades diferentes, nao escolhemos
       * arbitrariamente uma delas.
       */
      if (
        !anterior ||
        anterior.pessoaPoliticaId !==
          novoValor.pessoaPoliticaId
      ) {
        mapa.set(
          candidaturaId,
          null,
        );

        continue;
      }

      /*
       * Se qualquer registro equivalente estiver
       * em revisao, mantemos a situacao conservadora.
       */
      if (
        anterior.situacaoIdentidade !==
          "CONFIRMADA" ||
        novoValor.situacaoIdentidade !==
          "CONFIRMADA"
      ) {
        mapa.set(
          candidaturaId,
          {
            pessoaPoliticaId:
              novoValor.pessoaPoliticaId,
            situacaoIdentidade:
              "EM_REVISAO",
          },
        );
      }
    }
  }

  identidadePorCandidatura =
    mapa;

  return mapa;
}

export function buscarIdentidadePoliticaPorCandidatura(
  candidaturaId: string,
): IdentidadePoliticaDaCandidatura | null {
  const mapa =
    carregarMapaDeIdentidades();

  return (
    mapa.get(
      candidaturaId,
    ) ?? null
  );
}

export function buscarPessoaPoliticaConfirmadaPorCandidatura(
  candidaturaId: string,
): string | null {
  const identidade =
    buscarIdentidadePoliticaPorCandidatura(
      candidaturaId,
    );

  if (
    !identidade ||
    identidade.situacaoIdentidade !==
      "CONFIRMADA"
  ) {
    return null;
  }

  return identidade.pessoaPoliticaId;
}

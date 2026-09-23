import identidadesJson from "./gerado/identidades-politicas.json";

import {
  buscarPatrimonio2022PorCandidaturaId,
  buscarPatrimonio2026PorCandidaturaId,
} from "./bens";

type CandidaturaDaIdentidade = {
  candidaturaId: string;
  eleicao: number;
  nomeCompleto: string;
  nomeUrna: string;
  cargo: string;
  uf: string;
};

type IdentidadePolitica = {
  pessoaPoliticaId: string;
  candidaturas: CandidaturaDaIdentidade[];
};

const identidades =
  identidadesJson as IdentidadePolitica[];

export type EvolucaoPatrimonial = {
  candidatura2022Id: string;
  candidatura2026Id: string;
  valor2022: number;
  valor2026: number;
  quantidadeBens2022: number;
  quantidadeBens2026: number;
  diferencaNominal: number;
  variacaoPercentual: number | null;
};

export function buscarEvolucaoPatrimonial(
  candidatura2026Id: string,
): EvolucaoPatrimonial | null {
  const identidade =
    identidades.find((item) =>
      item.candidaturas.some(
        (candidatura) =>
          candidatura.candidaturaId ===
          candidatura2026Id,
      ),
    );

  if (!identidade) {
    return null;
  }

  const candidatura2022 =
    identidade.candidaturas.find(
      (candidatura) =>
        candidatura.eleicao === 2022,
    );

  const candidatura2026 =
    identidade.candidaturas.find(
      (candidatura) =>
        candidatura.eleicao === 2026 &&
        candidatura.candidaturaId ===
          candidatura2026Id,
    );

  if (
    !candidatura2022 ||
    !candidatura2026
  ) {
    return null;
  }

  const patrimonio2022 =
    buscarPatrimonio2022PorCandidaturaId(
      candidatura2022.candidaturaId,
    );

  const patrimonio2026 =
    buscarPatrimonio2026PorCandidaturaId(
      candidatura2026.candidaturaId,
    );

  if (
    !patrimonio2022 ||
    !patrimonio2026
  ) {
    return null;
  }

  const diferencaNominal =
    patrimonio2026.totalDeclarado -
    patrimonio2022.totalDeclarado;

  const variacaoPercentual =
    patrimonio2022.totalDeclarado !== 0
      ? (diferencaNominal /
          patrimonio2022.totalDeclarado) *
        100
      : null;

  return {
    candidatura2022Id:
      candidatura2022.candidaturaId,
    candidatura2026Id:
      candidatura2026.candidaturaId,
    valor2022:
      patrimonio2022.totalDeclarado,
    valor2026:
      patrimonio2026.totalDeclarado,
    quantidadeBens2022:
      patrimonio2022.quantidadeDeBens,
    quantidadeBens2026:
      patrimonio2026.quantidadeDeBens,
    diferencaNominal,
    variacaoPercentual,
  };
}
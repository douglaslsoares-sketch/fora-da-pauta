import "server-only";

import {
  existsSync,
  readFileSync,
} from "node:fs";

import { join } from "node:path";

export type VotacaoDocumentada = {
  votacaoId: string;
  data: string;
  dataHora?: string;
  voto: string;
  descricao: string;
  fonte: {
    titulo: string;
    url: string;
  };
};

export type ProposicaoDocumentada = {
  proposicaoId: string;
  identificacao: string;
  data: string;
  descricaoTipo: string;
  ementa: string;
  papel: string;
  fonte: {
    titulo: string;
    url: string;
  };
};

type ArquivoDeAtuacao = {
  candidaturaId: string;
  atualizadoEm: string;
  totalVotacoes: number;
  totalProposicoes: number;
  votacoes: VotacaoDocumentada[];
  proposicoes: ProposicaoDocumentada[];
};

export type AtuacaoPoliticaDocumentada = {
  atualizadoEm: string;

  totalVotacoes: number;
  totalProposicoes: number;

  votacoes: VotacaoDocumentada[];
  proposicoes: ProposicaoDocumentada[];

  votacoesRecentes: VotacaoDocumentada[];
  proposicoesRecentes: ProposicaoDocumentada[];
};

const cache =
  new Map<
    string,
    AtuacaoPoliticaDocumentada | null
  >();

export function buscarAtuacaoPolitica(
  candidaturaId: string,
): AtuacaoPoliticaDocumentada | null {
  if (
    cache.has(
      candidaturaId,
    )
  ) {
    return (
      cache.get(
        candidaturaId,
      ) ?? null
    );
  }

  if (
    !/^\d+$/.test(
      candidaturaId,
    )
  ) {
    cache.set(
      candidaturaId,
      null,
    );

    return null;
  }

  const arquivo =
    join(
      process.cwd(),
      "data",
      "eleicoes",
      "gerado",
      "atuacao-candidatos",
      `${candidaturaId}.json`,
    );

  if (
    !existsSync(
      arquivo,
    )
  ) {
    cache.set(
      candidaturaId,
      null,
    );

    return null;
  }

  const dados =
    JSON.parse(
      readFileSync(
        arquivo,
        "utf8",
      ),
    ) as ArquivoDeAtuacao;

  const resultado:
    AtuacaoPoliticaDocumentada = {
      atualizadoEm:
        dados.atualizadoEm,

      totalVotacoes:
        dados.totalVotacoes,

      totalProposicoes:
        dados.totalProposicoes,

      votacoes:
        dados.votacoes,

      proposicoes:
        dados.proposicoes,

      votacoesRecentes:
        dados.votacoes.slice(
          0,
          5,
        ),

      proposicoesRecentes:
        dados.proposicoes.slice(
          0,
          5,
        ),
    };

  cache.set(
    candidaturaId,
    resultado,
  );

  return resultado;
}
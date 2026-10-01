import "server-only";

import { existsSync, readFileSync } from "node:fs";
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

const cache = new Map<string, AtuacaoPoliticaDocumentada | null>();

function reunirPorId<T>(
  registros: T[],
  obterId: (registro: T) => string,
): T[] {
  const porId = new Map<string, T>();

  for (const registro of registros) {
    const id = obterId(registro);
    if (!id) throw new Error("Registro de atuação sem identificador.");

    const anterior = porId.get(id);
    if (anterior && JSON.stringify(anterior) !== JSON.stringify(registro)) {
      throw new Error("Identificador de atuação com conteúdos conflitantes.");
    }

    porId.set(id, registro);
  }

  return [...porId.values()];
}

export function buscarAtuacaoPolitica(
  candidaturaId: string,
): AtuacaoPoliticaDocumentada | null {
  if (!/^\d+$/.test(candidaturaId)) return null;
  if (cache.has(candidaturaId)) return cache.get(candidaturaId) ?? null;

  const conjuntos: ArquivoDeAtuacao[] = [];

  for (const pasta of [
    "atuacao-candidatos",
    "atuacao-estadual-candidatos",
  ]) {
    const arquivo = join(
      process.cwd(),
      "data",
      "eleicoes",
      "gerado",
      pasta,
      `${candidaturaId}.json`,
    );

    if (!existsSync(arquivo)) continue;

    const dados = JSON.parse(
      readFileSync(arquivo, "utf8"),
    ) as ArquivoDeAtuacao;

    if (
      dados.candidaturaId !== candidaturaId ||
      typeof dados.atualizadoEm !== "string" ||
      !Array.isArray(dados.votacoes) ||
      !Array.isArray(dados.proposicoes) ||
      dados.totalVotacoes !== dados.votacoes.length ||
      dados.totalProposicoes !== dados.proposicoes.length
    ) {
      throw new Error(`Arquivo de atuação inválido: ${pasta}/${candidaturaId}`);
    }

    conjuntos.push(dados);
  }

  if (conjuntos.length === 0) {
    cache.set(candidaturaId, null);
    return null;
  }

  // Os coletores estaduais devem prefixar os IDs com a casa legislativa,
  // por exemplo "cldf:123", para evitar colisões com os IDs da Câmara.
  const votacoes = reunirPorId(
    conjuntos.flatMap((dados) => dados.votacoes),
    (votacao) => votacao.votacaoId,
  ).sort((a, b) =>
    (b.dataHora || b.data).localeCompare(a.dataHora || a.data),
  );

  const proposicoes = reunirPorId(
    conjuntos.flatMap((dados) => dados.proposicoes),
    (proposicao) => proposicao.proposicaoId,
  ).sort((a, b) => b.data.localeCompare(a.data));

  const atualizadoEm = conjuntos
    .map((dados) => dados.atualizadoEm)
    .sort()
    .at(-1)!;

  const resultado: AtuacaoPoliticaDocumentada = {
    atualizadoEm,
    totalVotacoes: votacoes.length,
    totalProposicoes: proposicoes.length,
    votacoes,
    proposicoes,
    votacoesRecentes: votacoes.slice(0, 5),
    proposicoesRecentes: proposicoes.slice(0, 5),
  };

  cache.set(candidaturaId, resultado);
  return resultado;
}
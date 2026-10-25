/**
 * Complementos editoriais para a apresentação curta das fichas.
 *
 * Não inferir idade, cidade ou número de votos a partir de nomes, partido
 * ou endereço eleitoral. Campos ausentes não são exibidos.
 * Registrar uma fonte verificável para cada fato incluído aqui.
 */
export type FontePerfilPublico = {
  titulo: string;
  url: string;
};

export type DadosPerfilPublico = {
  idade?: number;
  cidade?: string;
  cidadeRotulo?: "Cidade" | "Cidade de atuação";
  votos?: number;
  percentualVotosValidos?: number;
  fonteDados?: FontePerfilPublico;
  fonteVotos?: FontePerfilPublico;
  // Forma feminina somente se apurada; sem esse campo usamos o rótulo oficial do TSE.
  rotuloEleitoral?: "Eleito" | "Eleita" | "Reeleito" | "Reeleita";
};

const dadosPorCandidatura: Record<string, DadosPerfilPublico> = {
  "160002536522": {
    // Atuação como vereador de Curitiba e deputado estadual do Paraná
    // documentada no perfil institucional da Assembleia Legislativa.
    cidade: "Curitiba (PR)",
    cidadeRotulo: "Cidade de atuação",
    fonteDados: {
      titulo: "Assembleia Legislativa do Paraná — perfil de Renato Freitas",
      url: "https://www.assembleia.pr.leg.br/deputados/perfil/renato-freitas",
    },
    // TRE-PR, resultado da totalização de 4/10/2026, Anexo IX, p. 108.
    votos: 115227,
    fonteVotos: {
      titulo: "TRE-PR — resultado da totalização, eleições 2026",
      url: "https://www.tre-pr.jus.br/eleicoes/eleicoes-2026/arquivos/tre-pr-relatorio-resultado-da-totalizacao-eleicoes-gerais-estaduais-2026-parana-1o-turno-para-governador-senador-deputados-federais-e-estaduais",
    },
  },
};

export function buscarDadosPerfilPublico(
  candidaturaId: string,
): DadosPerfilPublico | null {
  return dadosPorCandidatura[candidaturaId] ?? null;
}

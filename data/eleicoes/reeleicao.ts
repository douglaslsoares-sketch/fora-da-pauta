import { posicionamentosGerados } from "./posicionamentos-pec221-gerados";
import type { Candidatura, CargoEleitoral } from "./tipos";

export type SituacaoReeleicao =
  | "reeleicao"
  | "nao-concorre-a-reeleicao";

const deputadosFederaisIdentificadosPelaVotacao =
  new Set(
    posicionamentosGerados.map(
      (posicionamento) => posicionamento.candidaturaId
    )
  );

/**
 * Casos que não estão no arquivo gerado, mas cujo mandato
 * de deputado federal em 2026 está documentado.
 *
 * Filipe Barros, Luiz Nishimori, Ricardo Barros e Sargento Fahur:
 * evidência de voto nominal na Câmara em data/eleicoes/posicionamentos.ts.
 *
 * Gleisi Hoffmann e Pedro Lupion:
 * perfis oficiais da Câmara dos Deputados, mandato 2023–2027,
 * verificados em 27/08/2026.
 */
const deputadosFederaisAdicionais = new Set([
  "160002547656", // Gleisi
  "160002547660", // Filipe Barros
  "160002542323", // Luiz Nishimori
  "160002532857", // Ricardo Barros
  "160002547569", // Sargento Fahur
  "160002540769", // Pedro Lupion
]);

export function obterCargoAtualConhecido(
  candidaturaId: string
): CargoEleitoral | undefined {
  if (
    deputadosFederaisIdentificadosPelaVotacao.has(candidaturaId) ||
    deputadosFederaisAdicionais.has(candidaturaId)
  ) {
    return "deputado-federal";
  }

  return undefined;
}

export function obterSituacaoReeleicao(
  candidatura: Candidatura
): SituacaoReeleicao | undefined {
  const cargoAtual =
    obterCargoAtualConhecido(candidatura.id);

  if (!cargoAtual) {
    return undefined;
  }

  return candidatura.cargo === cargoAtual
    ? "reeleicao"
    : "nao-concorre-a-reeleicao";
}
import { posicionamentosGerados } from "./posicionamentos-pec221-gerados";
import type { Candidatura, CargoEleitoral } from "./tipos";

export type SituacaoReeleicao =
  | "reeleicao"
  | "nao-concorre-a-reeleicao";

export type MandatoAtualConhecido = {
  cargo: CargoEleitoral;
  uf?: string;
  inicio?: number;
  fim?: number;

  fonte?: {
    titulo: string;
    url: string;
    verificadoEm: string;
  };
};

const deputadosFederaisIdentificadosPelaVotacao =
  new Set(
    posicionamentosGerados.map(
      (posicionamento) =>
        posicionamento.candidaturaId,
    ),
  );

/**
 * Casos que não estão no arquivo gerado, mas cujo mandato
 * de deputado federal em 2026 está documentado.
 *
 * Filipe Barros, Luiz Nishimori, Ricardo Barros e Sargento Fahur:
 * evidência de voto nominal na Câmara.
 *
 * Gleisi Hoffmann e Pedro Lupion:
 * perfis oficiais da Câmara dos Deputados,
 * verificados em 27/08/2026.
 */
const deputadosFederaisAdicionais =
  new Set([
    "160002547656", // Gleisi
    "160002547660", // Filipe Barros
    "160002542323", // Luiz Nishimori
    "160002532857", // Ricardo Barros
    "160002547569", // Sargento Fahur
    "160002540769", // Pedro Lupion
  ]);

/**
 * Mandatos atuais documentados individualmente.
 *
 * Esta estrutura não é específica de um cargo.
 * Novos senadores, governadores, deputados ou outros
 * cargos poderão ser incorporados aqui à medida que
 * forem verificados em fonte institucional.
 */
const mandatosAtuaisDocumentados =
  new Map<string, MandatoAtualConhecido>([
    [
      "280002551544",
      {
        cargo: "senador",
        uf: "RJ",
        inicio: 2019,
        fim: 2027,

        fonte: {
          titulo: "Senado Federal",
          url:
            "https://www25.senado.leg.br/web/senadores/senador/-/perfil/5894",
          verificadoEm:
            "2026-09-25",
        },
      },
    ],
  ]);

export function obterMandatoAtualConhecido(
  candidaturaId: string,
): MandatoAtualConhecido | undefined {

  const documentado =
    mandatosAtuaisDocumentados.get(
      candidaturaId,
    );

  if (documentado) {
    return documentado;
  }

  if (
    deputadosFederaisIdentificadosPelaVotacao.has(
      candidaturaId,
    ) ||
    deputadosFederaisAdicionais.has(
      candidaturaId,
    )
  ) {
    return {
      cargo: "deputado-federal",
    };
  }

  return undefined;
}

export function obterCargoAtualConhecido(
  candidaturaId: string,
): CargoEleitoral | undefined {

  return obterMandatoAtualConhecido(
    candidaturaId,
  )?.cargo;
}

export function obterSituacaoReeleicao(
  candidatura: Candidatura,
): SituacaoReeleicao | undefined {

  const cargoAtual =
    obterCargoAtualConhecido(
      candidatura.id,
    );

  if (!cargoAtual) {
    return undefined;
  }

  return candidatura.cargo === cargoAtual
    ? "reeleicao"
    : "nao-concorre-a-reeleicao";
}
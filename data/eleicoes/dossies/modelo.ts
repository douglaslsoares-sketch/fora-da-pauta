export const EIXOS_DOSSIE = [
  "quem-e",
  "formacao-trabalho",
  "caminho-politica",
  "exercicio-cargo",
  "patrimonio-atividades-economicas",
  "acontecimentos-publicos",
  "o-que-diz-e-defende",
  "fontes-atualizacoes",
] as const;

export type EixoDossie =
  (typeof EIXOS_DOSSIE)[number];

export const NATUREZAS_REGISTRO = [
  "documentado",
  "publicado",
  "alegacao",
  "em-investigacao",
  "decisao",
  "contestada",
  "atualizada",
] as const;

export type NaturezaRegistro =
  (typeof NATUREZAS_REGISTRO)[number];

export type TipoFonteDossie =
  | "fonte-oficial"
  | "documento"
  | "reportagem"
  | "declaracao";

export type FonteDossie = {
  id: string;
  titulo: string;
  veiculoOuInstituicao: string;
  url: string;
  tipo: TipoFonteDossie;
  publicadaEm?: string;
};

export type RegistroAtribuido = {
  atribuicao: string;
  texto: string;
};

export type EventoDossie = {
  id: string;

  data: {
    inicio: string;
    fim?: string;
    rotulo: string;
  };

  titulo: string;
  resumo: string;

  eixos: EixoDossie[];
  natureza: NaturezaRegistro[];

  fatoDocumentado?: string[];

  oQueFoiPublicadoOuQuestionado?: RegistroAtribuido[];

  respostas?: RegistroAtribuido[];

  desdobramentos?: string[];

  fontes: FonteDossie[];

  ultimaVerificacao: string;
};

export type DossieCandidato = {
  candidaturaId: string;
  nome: string;

  atualizadoEm: string;

  emPoucasLinhas?: string;

  eventos: EventoDossie[];
};
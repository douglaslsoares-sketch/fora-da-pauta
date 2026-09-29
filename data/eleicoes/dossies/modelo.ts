export const EIXOS_DOSSIE = [
  "quem-e",
  "formacao-trabalho",
  "caminho-politica",
  "o-que-prometeu",
  "exercicio-cargo",
  "patrimonio-atividades-economicas",
  "suspeitas-investigacoes-acusacoes",

  // Classificação interna preservada para registros
  // públicos que não pertencem necessariamente ao
  // eixo de suspeitas, investigações ou acusações.
  "acontecimentos-publicos",

  "o-que-diz-e-defende",
  "linha-do-tempo",
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

export const TIPOS_MANIFESTACAO_PUBLICA = [
  "plenario",
  "comissao",
  "cpi-cpmi",
  "audiencia-publica",
  "pronunciamento-oficial",
  "entrevista",
  "coletiva",
  "rede-social",
  "outro",
] as const;

export type TipoManifestacaoPublica =
  (typeof TIPOS_MANIFESTACAO_PUBLICA)[number];

export type VerificacaoDocumental = {
  /*
   * Uma manifestação pode conter mais de uma afirmação
   * factual verificável.
   */
  afirmacoesVerificaveis?: string[];

  /*
   * Síntese descritiva do que a pesquisa documental
   * permitiu estabelecer. Não funciona como selo
   * de "verdadeiro" ou "falso".
   */
  sintese: string;

  evidenciasQueSustentam?: string[];

  evidenciasQueLimitamOuContrariam?: string[];

  naoFoiPossivelConfirmar?: string[];

  /*
   * Fontes usadas na checagem, separadas da fonte
   * original da própria manifestação.
   */
  fontes: FonteDossie[];

  verificadoEm: string;
};

export type PromessaCampanha = {
  id: string;

  eleicao: string;
  cargo: string;
  classificacao: {
    macrotema: string;
    assunto?: string;

    /*
     * Informa quem definiu a classificação utilizada.
     * Ex.: Tribunal Superior Eleitoral, documento da
     * própria candidatura ou Fora da Pauta.
     */
    origem: string;
  };

  titulo: string;

  /*
   * Formulação documental do compromisso encontrado
   * na fonte de campanha. Não representa avaliação
   * de cumprimento ou viabilidade.
   */
  compromisso: string;

  origem: string;
  referencia?: string;
  contexto?: string;

  /*
   * Delimita o que os documentos consultados
   * efetivamente permitem afirmar.
   */
  oQueAFontePermiteAfirmar?: string[];

  /*
   * Critérios editoriais objetivos que poderão ser
   * utilizados futuramente para acompanhar atos
   * relacionados ao compromisso, sem atribuir
   * automaticamente "cumpriu" ou "não cumpriu".
   */
  criteriosDeAcompanhamento?: string[];

  fontes: FonteDossie[];

  ultimaVerificacao: string;
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

  /*
   * Campos usados principalmente no eixo
   * "O que diz e o que defende".
   *
   * A manifestação pode ter ocorrido tanto em ambiente
   * institucional quanto em ambiente público externo.
   */
  tema?: string;

  tipoManifestacao?: TipoManifestacaoPublica;

  contextoManifestacao?: string;

  /*
   * Preenchido apenas quando a manifestação contém
   * afirmações factuais passíveis de verificação.
   *
   * Opiniões, preferências e posições normativas não
   * recebem avaliação factual artificial.
   */
  verificacaoDocumental?: VerificacaoDocumental;

  eixos: EixoDossie[];
  natureza: NaturezaRegistro[];

  fatoDocumentado?: string[];

  oQueFoiPublicadoOuQuestionado?: RegistroAtribuido[];

  respostas?: RegistroAtribuido[];

  desdobramentos?: string[];

  fontes: FonteDossie[];

  ultimaVerificacao: string;
};

export type BiografiaDossie = {
  paragrafos: string[];
  fontes: FonteDossie[];
  ultimaVerificacao: string;
};

export type DossieCandidato = {
  candidaturaId: string;
  nome: string;

  atualizadoEm: string;

  emPoucasLinhas?: string;

  biografia: BiografiaDossie;

  promessas?: PromessaCampanha[];

  eventos: EventoDossie[];
};
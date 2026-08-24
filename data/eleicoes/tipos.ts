export type CargoEleitoral =
  | "presidente"
  | "governador"
  | "senador"
  | "deputado-federal"
  | "deputado-estadual"
  | "deputado-distrital";

export type SituacaoCandidatura =
  | "registrada"
  | "deferida"
  | "indeferida"
  | "renuncia"
  | "falecido"
  | "cancelada"
  | "substituida"
  | "nao-informada"
  | "outra";

export type Candidatura = {
  id: string;
  eleicao: number;
  nomeUrna: string;
  nomeCompleto: string;
  numero: number;
  cargo: CargoEleitoral;
  uf: string;
  partido: string;
  siglaPartido: string;
  federacao?: string;
  situacao: SituacaoCandidatura;
  situacaoTse: string;
  fonteOficial: string;
  ultimaVerificacao: string;
};

export type PosicaoPolitica =
  | "favoravel"
  | "contrario"
  | "parcial"
  | "sem-posicao-publica";

export type FontePosicionamento = {
  titulo: string;
  url: string;
  veiculoOuInstituicao: string;
  publicadoEm?: string;
  verificadoEm: string;
};

export type TipoEvidenciaPolitica =
  | "voto-nominal"
  | "declaracao-publica"
  | "entrevista"
  | "emenda"
  | "programa-eleitoral"
  | "documento-oficial"
  | "outra";

export type ResultadoVoto =
  | "sim"
  | "nao"
  | "abstencao"
  | "ausente"
  | "nao-votou"
  | "nao-se-aplica";

export type EvidenciaPolitica = {
  tipo: TipoEvidenciaPolitica;
  titulo: string;
  descricao?: string;
  resultadoVoto?: ResultadoVoto;
  proposicao?: string;
  data?: string;
  fonte: FontePosicionamento;
};

export type Posicionamento = {
  id: string;
  candidaturaId: string;
  pautaId: string;
  posicao: PosicaoPolitica;
  resumo: string;

  /**
   * Mantido para compatibilidade com os registros já existentes.
   */
  fontes: FontePosicionamento[];

  /**
   * Trilha estruturada das evidências utilizadas na classificação.
   */
  evidencias?: EvidenciaPolitica[];

  atualizadoEm: string;
};

export type Pauta = {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
};

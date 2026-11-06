/** Identidade permanente, independente de eleições brasileiras e de país. */
export type FonteDocumental = {
  titulo: string;
  url: string;
  consultadoEm: string; // ISO date YYYY-MM-DD
};
export type VinculoPolitico = {
  tipo: "cargo" | "partido" | "instituicao";
  descricao: string;
  pais: string; // ISO 3166-1 alpha-2
  inicio?: string;
  fim?: string;
  fonte: FonteDocumental;
};
export type AcontecimentoPolitico = {
  data: string;
  titulo: string;
  descricao?: string;
  categoria?: "decisao" | "declaracao" | "ato-oficial" | "eleicao" | "investigacao" | "processo" | "outro";
  natureza?: "fato-documentado" | "alegacao" | "declaracao-atribuida";
  fonte: FonteDocumental;
};
export type PessoaPoliticaInternacional = {
  pessoaPoliticaId: string;
  nomePublico: string;
  nomeCompleto?: string;
  paises: string[];
  situacaoIdentidade: "CONFIRMADA" | "EM_REVISAO";
  fonteIdentidade: FonteDocumental;
  vinculos: VinculoPolitico[];
  acontecimentos: AcontecimentoPolitico[];
};

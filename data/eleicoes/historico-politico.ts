import dadosCamara from "./gerado/historico-politico-camara.json";

export type ItemDaTrajetoriaPolitica = {
  titulo: string;
  periodo?: string;
  descricao?: string;
  fonte: {
    titulo: string;
    url: string;
  };
};

export type ItemDaAtuacaoPolitica = {
  titulo: string;
  data?: string;
  descricao: string;
  fonte: {
    titulo: string;
    url: string;
  };
};

export type HistoricoPoliticoDoCandidato = {
  candidaturaId: string;
  trajetoria: ItemDaTrajetoriaPolitica[];
  atuacao: ItemDaAtuacaoPolitica[];
};

type ItemBrutoDaCamara = {
  titulo: string;
  periodo?: string | null;
  descricao?: string | null;
  fonte: {
    titulo: string;
    url: string;
  };
};

type HistoricoBrutoDaCamara = {
  candidaturaId: string;
  deputadoId: string;
  trajetoria: ItemBrutoDaCamara[];
};

/*
 * Regra editorial:
 *
 * - nenhum cargo, mandato, atuação ou posição deve ser incluído
 *   sem fonte identificável;
 * - inferência por partido, ideologia ou nome não é aceita;
 * - ausência de registro não significa ausência de trajetória;
 * - a interface só mostra informações efetivamente documentadas.
 */

const historicosDaCamara =
  (dadosCamara as HistoricoBrutoDaCamara[]).map(
    (historico): HistoricoPoliticoDoCandidato => ({
      candidaturaId: historico.candidaturaId,

      trajetoria: historico.trajetoria.map(
        (item) => ({
          titulo: item.titulo,

          periodo:
            item.periodo ?? undefined,

          descricao:
            item.descricao ?? undefined,

          fonte: {
            titulo: item.fonte.titulo,
            url: item.fonte.url,
          },
        }),
      ),

      atuacao: [],
    }),
  );

export const historicosPoliticos:
  HistoricoPoliticoDoCandidato[] =
    historicosDaCamara;

export function buscarHistoricoPolitico(
  candidaturaId: string,
) {
  return (
    historicosPoliticos.find(
      (item) =>
        item.candidaturaId === candidaturaId,
    ) ?? null
  );
}
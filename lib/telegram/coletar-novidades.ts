import "server-only";

import { buscarAtuacaoPolitica } from "@/data/eleicoes/atuacao-politica";
import { buscarDossiePorCandidaturaId } from "@/data/eleicoes/dossies";
import { prepararAvisosDossie } from "./preparar-avisos-dossie";
import { prepararAvisosAtuacao } from "./preparar-avisos-atuacao";
import { sql } from "../interesses/db";
import {
  registrarNovidadesNaFila,
  type EventoNotificacao,
} from "./registrar-novidades";

export async function coletarNovidadesCandidatos() {
  // Prioriza fontes nunca verificadas e depois as mais antigas.
  // O lote limitado permite continuar nas próximas execuções.
  const candidaturas = await sql<{ candidatura_id: string }[]>`
    SELECT a.candidatura_id
    FROM public.telegram_acompanhamentos AS a
    LEFT JOIN public.telegram_fontes_notificacao AS f
      ON f.tipo = 'candidato'
      AND f.referencia = a.candidatura_id
    WHERE a.status IN ('ativo', 'aguardando_eleicao')
      AND a.cancelled_at IS NULL
    GROUP BY a.candidatura_id, f.verificado_at
    ORDER BY f.verificado_at ASC NULLS FIRST, a.candidatura_id
    LIMIT 10
  `;

  const resumo = {
    fontesVerificadas: 0,
    fontesInicializadas: 0,
    fontesSemDados: 0,
    fontesComFalha: 0,
    eventosNovos: 0,
    avisosInseridos: 0,
  };

  for (const { candidatura_id: id } of candidaturas) {
    try {
      const atuacao = buscarAtuacaoPolitica(id);
      const dossie = buscarDossiePorCandidaturaId(id);

      if (!atuacao && !dossie) {
        // Nenhum arquivo disponível: não inicializa uma fonte vazia.
        console.warn(`[telegram] Sem atuação ou dossiê: candidatura ${id}`);
        resumo.fontesSemDados++;
        continue;
      }

      const eventos: EventoNotificacao[] = [
        ...prepararAvisosAtuacao(atuacao, id),
        ...prepararAvisosDossie(dossie),
      ];

      const resultado = await registrarNovidadesNaFila({
        tipo: "candidato",
        referencia: id,
        eventos,
      });

      resumo.fontesVerificadas++;
      if (resultado.inicializacao) resumo.fontesInicializadas++;
      resumo.eventosNovos += resultado.eventosNovos;
      resumo.avisosInseridos += resultado.avisosInseridos;
    } catch {
      resumo.fontesComFalha++;
      console.error("Falha ao conferir novidades de uma candidatura.");
    }
  }

  return resumo;
}
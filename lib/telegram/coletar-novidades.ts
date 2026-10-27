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
  // Rotação determinística de 10 fichas a cada janela de 15 minutos.
  // Fontes sem arquivo permanecem SEM inicialização editorial, mas
  // não bloqueiam a verificação das outras fichas inscritas.
  //
  // O deslocamento circular é calculado no banco, sem trazer todas
  // as candidaturas para a aplicação e sem criar novas tabelas.
  const janela = Math.floor(Date.now() / (15 * 60 * 1000));
  const candidaturas = await sql<{ candidatura_id: string }[]>`
    WITH acompanhadas AS (
      SELECT DISTINCT a.candidatura_id
      FROM public.telegram_acompanhamentos AS a
      WHERE a.status IN ('ativo', 'aguardando_eleicao', 'nao_eleito')
        AND a.cancelled_at IS NULL
    ), numeradas AS (
      SELECT candidatura_id,
             row_number() OVER (ORDER BY candidatura_id) - 1 AS indice,
             count(*) OVER () AS total
      FROM acompanhadas
    )
    SELECT candidatura_id
    FROM numeradas
    ORDER BY ((indice - ((${janela}::bigint * 10) % total) + total) % total),
             candidatura_id
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
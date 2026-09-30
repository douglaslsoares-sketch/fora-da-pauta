import "server-only";

import { sql } from "../interesses/db";
import { planejarNovidades } from "./novidades";

export type EventoNotificacao = {
  id: string;
  texto: string;
};

type EntradaNovidades = {
  tipo: "candidato" | "edicoes";
  referencia: string;
  eventos: readonly EventoNotificacao[];
};

export async function registrarNovidadesNaFila({
  tipo,
  referencia,
  eventos,
}: EntradaNovidades) {
  if (
    (tipo !== "candidato" && tipo !== "edicoes") ||
    (tipo === "candidato" && !/^\d{8,20}$/.test(referencia)) ||
    (tipo === "edicoes" && referencia !== "")
  ) {
    throw new Error("Fonte de notificação inválida.");
  }

  const porId = new Map<string, EventoNotificacao>();

  for (const evento of eventos) {
    if (
      typeof evento.id !== "string" ||
      !evento.id ||
      evento.id !== evento.id.trim() ||
      typeof evento.texto !== "string" ||
      !evento.texto.trim() ||
      Array.from(evento.texto).length > 4096
    ) {
      throw new Error("Evento de notificação inválido.");
    }

    const anterior = porId.get(evento.id);
    if (anterior && anterior.texto !== evento.texto) {
      throw new Error("Identificador repetido com conteúdos diferentes.");
    }

    porId.set(evento.id, evento);
  }

  return sql.begin(async (tx) => {
    // Serializa o registro para evitar duas primeiras leituras concorrentes.
    await tx`SELECT pg_advisory_xact_lock(20260930, 1814)`;

    const criada = await tx`
      INSERT INTO public.telegram_fontes_notificacao (tipo, referencia)
      VALUES (${tipo}, ${referencia})
      ON CONFLICT (tipo, referencia) DO NOTHING
      RETURNING tipo
    `;

    const conhecidos = await tx<{ evento_id: string }[]>`
      SELECT evento_id
      FROM public.telegram_eventos_conhecidos
      WHERE tipo = ${tipo} AND referencia = ${referencia}
    `;

    const plano = planejarNovidades(
      [...porId.keys()],
      criada.length > 0 ? null : conhecidos.map((item) => item.evento_id),
    );

    const idsRegistrar = plano.inicializacao
      ? plano.idsConhecidos
      : plano.novosIds;

    for (const id of idsRegistrar) {
      await tx`
        INSERT INTO public.telegram_eventos_conhecidos
          (tipo, referencia, evento_id)
        VALUES (${tipo}, ${referencia}, ${id})
        ON CONFLICT (tipo, referencia, evento_id) DO NOTHING
      `;
    }

    let avisosInseridos = 0;

    for (const id of plano.novosIds) {
      const evento = porId.get(id)!;

      if (tipo === "candidato") {
        const inseridos = await tx`
          INSERT INTO public.telegram_fila_avisos
            (telegram_chat_id, tipo, referencia, evento_id, texto)
          SELECT telegram_chat_id, ${tipo}, ${referencia}, ${id}, ${evento.texto}
          FROM public.telegram_acompanhamentos
          WHERE candidatura_id = ${referencia}
            AND status = 'ativo'
            AND cancelled_at IS NULL
          ON CONFLICT (telegram_chat_id, tipo, referencia, evento_id)
          DO NOTHING
          RETURNING id
        `;
        avisosInseridos += inseridos.length;
      } else {
        const inseridos = await tx`
          INSERT INTO public.telegram_fila_avisos
            (telegram_chat_id, tipo, referencia, evento_id, texto)
          SELECT telegram_chat_id, ${tipo}, ${referencia}, ${id}, ${evento.texto}
          FROM public.telegram_preferencias
          WHERE tipo = 'novas_edicoes'
            AND referencia = ''
            AND status = 'ativo'
            AND cancelled_at IS NULL
          ON CONFLICT (telegram_chat_id, tipo, referencia, evento_id)
          DO NOTHING
          RETURNING id
        `;
        avisosInseridos += inseridos.length;
      }
    }

    await tx`
      UPDATE public.telegram_fontes_notificacao
      SET verificado_at = now()
      WHERE tipo = ${tipo} AND referencia = ${referencia}
    `;

    return {
      inicializacao: plano.inicializacao,
      eventosNovos: plano.novosIds.length,
      avisosInseridos,
    };
  });
}
import "server-only";

import { sql } from "../interesses/db";
import { planejarNovidades, prepararHistoricoPorGrupo } from "./novidades";

export type EventoNotificacao = {
  id: string;
  texto: string;
  /** Apenas revisões editoriais do dossiê informam quando foram publicadas. */
  publicadoEm?: string;
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

    if (
      evento.publicadoEm !== undefined &&
      (
        !evento.id.startsWith("dossie:") ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(evento.publicadoEm) ||
        !Number.isFinite(Date.parse(evento.publicadoEm))
      )
    ) {
      throw new Error("Data editorial de notificação inválida.");
    }

    const anterior = porId.get(evento.id);
    if (anterior && (anterior.texto !== evento.texto || anterior.publicadoEm !== evento.publicadoEm)) {
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

    const historico = prepararHistoricoPorGrupo(
      [...porId.keys()],
      conhecidos.map((item) => item.evento_id),
      tipo === "candidato"
        ? ["proposicao:cldf:", "votacao:cldf:", "proposicao:alepa:", "votacao:alepa:"]
        : [],
    );

    const plano = planejarNovidades(
      [...porId.keys()],
      criada.length > 0 ? null : historico.idsConhecidos,
    );

    // Na primeira leitura, históricos brutos continuam silenciosos.
    // Uma publicação editorial identificada por data não deve desaparecer
    // só porque a fonte da candidatura nunca havia sido inicializada.
    const novosIds = plano.inicializacao
      ? [...porId.values()].filter((item) => item.publicadoEm !== undefined).map((item) => item.id)
      : plano.novosIds;

    const idsRegistrar = [...new Set([
      ...historico.idsRegistrar,
      ...(plano.inicializacao ? plano.idsConhecidos : plano.novosIds),
    ])];

    for (const id of idsRegistrar) {
      await tx`
        INSERT INTO public.telegram_eventos_conhecidos
          (tipo, referencia, evento_id)
        VALUES (${tipo}, ${referencia}, ${id})
        ON CONFLICT (tipo, referencia, evento_id) DO NOTHING
      `;
    }

    let avisosInseridos = 0;

    for (const id of novosIds) {
      const evento = porId.get(id)!;

      if (tipo === "candidato") {
        const inseridos = await tx`
          INSERT INTO public.telegram_fila_avisos
            (telegram_chat_id, tipo, referencia, evento_id, texto)
          SELECT telegram_chat_id, ${tipo}, ${referencia}, ${id}, ${evento.texto}
          FROM public.telegram_acompanhamentos
          WHERE candidatura_id = ${referencia}
            AND (
              status = 'ativo'
              OR (${evento.publicadoEm !== undefined} AND status = 'aguardando_eleicao')
            )
            AND cancelled_at IS NULL
            AND (
              ${evento.publicadoEm ?? null}::timestamptz IS NULL
              OR (
                created_at <= ${evento.publicadoEm ?? null}::timestamptz
                AND updated_at <= ${evento.publicadoEm ?? null}::timestamptz
              )
            )
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
      eventosNovos: novosIds.length,
      avisosInseridos,
    };
  });
}
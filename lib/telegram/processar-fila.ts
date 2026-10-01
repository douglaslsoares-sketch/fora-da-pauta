import "server-only";

import { sql } from "../interesses/db";

type Aviso = {
  id: string;
  chat_id: string;
  texto: string;
};

type RespostaTelegram = {
  ok?: boolean;
  error_code?: number;
  parameters?: { retry_after?: number };
  result?: { message_id?: number };
};

export async function processarFilaTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN não configurado.");
  }

  const resumo = {
    enviados: 0,
    cancelados: 0,
    erros: 0,
    incertos: 0,
  };

  // Um processo interrompido pode ter enviado a mensagem.
  // Não recolocamos esses avisos na fila automaticamente.
  const abandonados = await sql`
    UPDATE public.telegram_fila_avisos
    SET status = 'incerto',
        ultimo_erro_codigo = 'PROCESSAMENTO_INTERROMPIDO',
        updated_at = now()
    WHERE status = 'processando'
      AND processamento_iniciado_at < now() - interval '10 minutes'
    RETURNING id
  `;
  resumo.incertos += abandonados.length;

  const cancelados = await sql`
    UPDATE public.telegram_fila_avisos AS f
    SET status = 'cancelado',
        ultimo_erro_codigo = 'ASSINATURA_INATIVA',
        updated_at = now()
    WHERE f.status IN ('pendente', 'erro')
      AND NOT (
        (f.tipo = 'candidato' AND EXISTS (
          SELECT 1 FROM public.telegram_acompanhamentos AS a
          WHERE a.telegram_chat_id = f.telegram_chat_id
            AND a.candidatura_id = f.referencia
            AND a.status = 'ativo'
            AND a.cancelled_at IS NULL
        ))
        OR
        (f.tipo = 'edicoes' AND EXISTS (
          SELECT 1 FROM public.telegram_preferencias AS p
          WHERE p.telegram_chat_id = f.telegram_chat_id
            AND p.tipo = 'novas_edicoes'
            AND p.referencia = ''
            AND p.status = 'ativo'
            AND p.cancelled_at IS NULL
        ))
      )
    RETURNING id
  `;
  resumo.cancelados += cancelados.length;

  const inicio = Date.now();

  for (let quantidade = 0; quantidade < 20; quantidade++) {
    if (Date.now() - inicio > 20_000) break;

    // Reserva um aviso por vez. Execuções concorrentes não pegam
    // a mesma linha, e a assinatura é conferida na reserva.
    const avisos = await sql<Aviso[]>`
      WITH escolhido AS (
        SELECT f.id
        FROM public.telegram_fila_avisos AS f
        WHERE f.status IN ('pendente', 'erro')
          AND f.tentativas < 5
          AND f.proxima_tentativa_at <= now()
          AND (
            (f.tipo = 'candidato' AND EXISTS (
              SELECT 1 FROM public.telegram_acompanhamentos AS a
              WHERE a.telegram_chat_id = f.telegram_chat_id
                AND a.candidatura_id = f.referencia
                AND a.status = 'ativo'
                AND a.cancelled_at IS NULL
            ))
            OR
            (f.tipo = 'edicoes' AND EXISTS (
              SELECT 1 FROM public.telegram_preferencias AS p
              WHERE p.telegram_chat_id = f.telegram_chat_id
                AND p.tipo = 'novas_edicoes'
                AND p.referencia = ''
                AND p.status = 'ativo'
                AND p.cancelled_at IS NULL
            ))
          )
        ORDER BY f.proxima_tentativa_at, f.id
        LIMIT 1
        FOR UPDATE OF f SKIP LOCKED
      )
      UPDATE public.telegram_fila_avisos AS f
      SET status = 'processando',
          tentativas = f.tentativas + 1,
          processamento_iniciado_at = now(),
          updated_at = now()
      FROM escolhido
      WHERE f.id = escolhido.id
      RETURNING f.id::text AS id,
                f.telegram_chat_id::text AS chat_id,
                f.texto
    `;

    const aviso = avisos[0];
    if (!aviso) break;

    let resposta: RespostaTelegram | null = null;
    let httpStatus = 0;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: aviso.chat_id,
            text: aviso.texto,
            disable_web_page_preview: true,
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(8_000),
        },
      );
      httpStatus = response.status;
      resposta = await response.json() as RespostaTelegram;
    } catch {
      // Sem confirmação, reenviar poderia duplicar uma mensagem.
    }

    if (
      resposta?.ok === true &&
      Number.isSafeInteger(resposta.result?.message_id)
    ) {
      await sql`
        UPDATE public.telegram_fila_avisos
        SET status = 'enviado',
            enviado_at = now(),
            telegram_message_id = ${resposta.result!.message_id!},
            ultimo_erro_codigo = NULL,
            updated_at = now()
        WHERE id = ${aviso.id}::bigint
          AND status = 'processando'
      `;
      resumo.enviados++;
      continue;
    }

    const rejeicaoConfirmada = resposta?.ok === false;
    const codigo = resposta?.error_code ?? httpStatus;
    const temporario = rejeicaoConfirmada && codigo === 429;
    const status = temporario
      ? "erro"
      : rejeicaoConfirmada && codigo >= 400 && codigo < 500
        ? "cancelado"
        : "incerto";

    const esperaInformada = resposta?.parameters?.retry_after;
    const espera = typeof esperaInformada === "number" &&
      Number.isFinite(esperaInformada)
        ? Math.min(86400, Math.max(1, Math.ceil(esperaInformada)))
        : 60;

    await sql`
      UPDATE public.telegram_fila_avisos
      SET status = ${status},
          proxima_tentativa_at =
            now() + (${espera}::integer * interval '1 second'),
          ultimo_erro_codigo = ${rejeicaoConfirmada
            ? `TELEGRAM_${codigo}`
            : "ENVIO_SEM_CONFIRMACAO"},
          updated_at = now()
      WHERE id = ${aviso.id}::bigint
        AND status = 'processando'
    `;

    if (status === "erro") resumo.erros++;
    else if (status === "cancelado") resumo.cancelados++;
    else resumo.incertos++;

    // Interrompe o lote ao receber limitação ou falha incerta.
    if (temporario || status === "incerto") break;
  }

  return resumo;
}
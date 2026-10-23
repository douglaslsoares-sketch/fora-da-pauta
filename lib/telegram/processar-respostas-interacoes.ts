import "server-only";
import { sql } from "@/lib/interesses/db";

type RespostaTelegram = {
  ok?: boolean;
  error_code?: number;
  result?: { message_id?: number };
  parameters?: { retry_after?: number };
};

export async function processarRespostasInteracoes() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN não configurado");
  const resumo = { enviados: 0, erros: 0, incertos: 0, indisponiveis: 0 };

  // Não reenviar automaticamente após envio incerto: isso duplicaria respostas.
  await sql`
    UPDATE public.interacoes_politicas
    SET notificacao_status = 'incerto',
        ultimo_erro_codigo = 'PROCESSAMENTO_INTERROMPIDO',
        updated_at = now()
    WHERE notificacao_status = 'processando'
      AND notificacao_iniciada_at < now() - interval '10 minutes'
  `;

  for (let i = 0; i < 12; i++) {
    const rows = await sql<{
      id: string; chat_id: string; resposta_texto: string;
      resposta_autoria: string; candidatura_id: string;
    }[]>`
      WITH escolhido AS (
        SELECT id
        FROM public.interacoes_politicas
        WHERE status = 'respondida'
          AND notificacao_status IN ('pendente','erro')
          AND notificacao_tentativas < 4
        ORDER BY resposta_confirmada_at, id
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE public.interacoes_politicas p SET
        notificacao_status = 'processando',
        notificacao_tentativas = p.notificacao_tentativas + 1,
        notificacao_iniciada_at = now(),
        updated_at = now()
      FROM escolhido WHERE p.id = escolhido.id
      RETURNING p.id::text AS id, p.telegram_chat_id::text AS chat_id,
        p.resposta_texto, p.resposta_autoria, p.candidatura_id
    `;
    const item = rows[0];
    if (!item) break;
    const autoria = item.resposta_autoria === "titular"
      ? "da própria pessoa pública"
      : item.resposta_autoria === "assessoria"
        ? "da assessoria"
        : "do órgão responsável";
    const texto = [
      "Fora da Pauta — resposta à sua manifestação",
      "",
      `Protocolo: ${item.id}`,
      `Resposta verificada recebida ${autoria}:`,
      "",
      item.resposta_texto,
      "",
      "Esta mensagem foi encaminhada ao seu Telegram pelo Fora da Pauta.",
    ].join("\n");
    let reply: RespostaTelegram | null = null;
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: item.chat_id,
          text: texto,
          disable_web_page_preview: true,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      reply = await response.json() as RespostaTelegram;
    } catch {
      // O servidor pode ter enviado; manter incerto.
    }
    if (reply?.ok && Number.isSafeInteger(reply.result?.message_id)) {
      await sql`
        UPDATE public.interacoes_politicas
        SET notificacao_status = 'enviado', notificacao_enviada_at = now(),
          telegram_message_id = ${reply.result!.message_id!},
          ultimo_erro_codigo = NULL, updated_at = now()
        WHERE id = ${item.id}::uuid AND notificacao_status = 'processando'
      `;
      resumo.enviados++;
      continue;
    }
    const code = reply?.error_code;
    const status = reply?.ok === false && code === 429 ? "erro" :
      reply?.ok === false && code && code >= 400 && code < 500 ? "incerto" : "incerto";
    await sql`
      UPDATE public.interacoes_politicas
      SET notificacao_status = ${status},
        ultimo_erro_codigo = ${reply?.ok === false ? `TELEGRAM_${code ?? "ERRO"}` : "ENVIO_SEM_CONFIRMACAO"},
        updated_at = now()
      WHERE id = ${item.id}::uuid AND notificacao_status = 'processando'
    `;
    if (status === "erro") resumo.erros++;
    else resumo.incertos++;
    // Parar em rate limit ou estado incerto.
    break;
  }
  return resumo;
}

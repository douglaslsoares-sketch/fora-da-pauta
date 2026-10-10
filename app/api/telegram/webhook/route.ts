import {
  createHash,
  timingSafeEqual,
} from "node:crypto";

import { NextResponse } from "next/server";

import { eleitos2026 } from "@/data/eleicoes/eleitos";
import { sql } from "@/lib/interesses/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramChat = {
  id?: number;
  type?: string;
};

type TelegramMessage = {
  text?: string;
  chat?: TelegramChat;
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

type VinculoPendente = {
  candidatura_ids: string[];
  consumido: boolean;
  consumed_by_chat_id: string | null;
  valido: boolean;
};

const START_PATTERN =
  /^\/start(?:@[A-Za-z0-9_]+)?(?:\s+([A-Za-z0-9_-]+))?\s*$/i;

function obterVariavelObrigatoria(nome: string) {
  const valor = process.env[nome]?.trim();

  if (!valor) {
    throw new Error(`ENV_MISSING:${nome}`);
  }

  return valor;
}

function segredoConfere(
  recebido: string,
  esperado: string,
) {
  const a = Buffer.from(recebido, "utf8");
  const b = Buffer.from(esperado, "utf8");

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}

function hashToken(token: string) {
  return createHash("sha256")
    .update(token, "utf8")
    .digest("hex");
}

async function enviarMensagemTelegram(
  chatId: string,
  texto: string,
) {
  const token = obterVariavelObrigatoria(
    "TELEGRAM_BOT_TOKEN",
  );

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: texto,
        disable_web_page_preview: true,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new Error(
      `TELEGRAM_SEND_FAILED:${response.status}`,
    );
  }
}

async function consumirVinculo(
  chatId: string,
  token: string,
) {
  const tokenHash = hashToken(token);

  const idsEleitos = new Set(
    eleitos2026.map((pessoa) => pessoa.id),
  );

  return sql.begin(async (tx) => {
    const vinculos = await tx<VinculoPendente[]>`
      SELECT
        candidatura_ids,
        consumed_at IS NOT NULL AS consumido,
        consumed_by_chat_id::text AS consumed_by_chat_id,
        expires_at > now() AS valido
      FROM public.telegram_vinculos_pendentes
      WHERE token_hash = ${tokenHash}
      LIMIT 1
      FOR UPDATE
    `;

    const vinculo = vinculos[0];

    if (!vinculo) {
      return {
        ok: false as const,
        motivo: "invalido" as const,
        quantidade: 0,
      };
    }

    if (vinculo.consumido) {
      if (vinculo.consumed_by_chat_id === chatId) {
        return {
          ok: true as const,
          quantidade: vinculo.candidatura_ids.length,
          repetido: true as const,
        };
      }

      return {
        ok: false as const,
        motivo: "invalido" as const,
        quantidade: 0,
      };
    }

    if (!vinculo.valido) {
      return {
        ok: false as const,
        motivo: "invalido" as const,
        quantidade: 0,
      };
    }

    const candidaturaIds = [
      ...new Set(vinculo.candidatura_ids),
    ].filter((id) => idsEleitos.has(id));

    if (
      candidaturaIds.length < 1 ||
      candidaturaIds.length !==
        vinculo.candidatura_ids.length
    ) {
      return {
        ok: false as const,
        motivo: "eleitos_invalidos" as const,
        quantidade: 0,
      };
    }

    await tx`
      INSERT INTO public.telegram_preferencias (
        telegram_chat_id,
        tipo,
        referencia,
        status,
        created_at,
        updated_at,
        cancelled_at
      )
      VALUES (
        ${chatId}::bigint,
        'notificacoes',
        '',
        'ativo',
        now(),
        now(),
        NULL
      )
      ON CONFLICT (
        telegram_chat_id,
        tipo,
        referencia
      )
      DO UPDATE SET
        status = 'ativo',
        updated_at = now(),
        cancelled_at = NULL
    `;

    for (const candidaturaId of candidaturaIds) {
      await tx`
        INSERT INTO public.telegram_acompanhamentos (
          telegram_chat_id,
          candidatura_id,
          status,
          created_at,
          updated_at,
          cancelled_at
        )
        VALUES (
          ${chatId}::bigint,
          ${candidaturaId},
          'ativo',
          now(),
          now(),
          NULL
        )
        ON CONFLICT (
          telegram_chat_id,
          candidatura_id
        )
        DO UPDATE SET
          status = 'ativo',
          updated_at = now(),
          cancelled_at = NULL
      `;
    }

    await tx`
      UPDATE public.telegram_vinculos_pendentes
      SET
        consumed_at = now(),
        consumed_by_chat_id = ${chatId}::bigint
      WHERE token_hash = ${tokenHash}
        AND consumed_at IS NULL
        AND consumed_by_chat_id IS NULL
    `;

    return {
      ok: true as const,
      quantidade: candidaturaIds.length,
      repetido: false as const,
    };
  });
}

async function desativarNotificacoes(
  chatId: string,
) {
  await sql.begin(async (tx) => {
    await tx`
      UPDATE public.telegram_preferencias
      SET
        status = 'cancelado',
        updated_at = now(),
        cancelled_at = now()
      WHERE telegram_chat_id = ${chatId}::bigint
        AND tipo = 'notificacoes'
        AND referencia = ''
        AND status = 'ativo'
    `;

    await tx`
      UPDATE public.telegram_fila_avisos
      SET
        status = 'cancelado',
        updated_at = now(),
        ultimo_erro_codigo =
          'CANCELADO_PELO_USUARIO'
      WHERE telegram_chat_id = ${chatId}::bigint
        AND status IN ('pendente', 'erro')
    `;
  });
}

export async function POST(
  request: Request,
) {
  const segredoEsperado =
    obterVariavelObrigatoria(
      "TELEGRAM_WEBHOOK_SECRET",
    );

  const segredoRecebido =
    request.headers
      .get("x-telegram-bot-api-secret-token")
      ?.trim() ?? "";

  if (
    !segredoRecebido ||
    !segredoConfere(
      segredoRecebido,
      segredoEsperado,
    )
  ) {
    return NextResponse.json(
      { ok: false },
      { status: 401 },
    );
  }

  let update: TelegramUpdate;

  try {
    update = await request.json() as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  const chatIdNumero = message?.chat?.id;
  const chatType = message?.chat?.type;
  const texto = message?.text?.trim();

  if (
    !Number.isSafeInteger(chatIdNumero) ||
    chatType !== "private" ||
    !texto
  ) {
    return NextResponse.json({ ok: true });
  }

  const chatId = String(chatIdNumero);

  if (/^\/parar(?:@[A-Za-z0-9_]+)?\s*$/i.test(texto)) {
    await desativarNotificacoes(chatId);

    await enviarMensagemTelegram(
      chatId,
      "Pronto. As notificações do Fora da Pauta foram desativadas.\n\n" +
        "As pessoas que você escolheu acompanhar continuam salvas. " +
        "Se quiser voltar a receber notificações, ative novamente pelo site.",
    );

    return NextResponse.json({ ok: true });
  }

  const start = texto.match(START_PATTERN);

  if (!start) {
    await enviarMensagemTelegram(
      chatId,
      "Para receber notificações do Fora da Pauta, escolha no site quem você quer acompanhar e depois ative o Telegram:\n\n" +
        "https://www.foradapauta.org/votou-fique-de-olho",
    );

    return NextResponse.json({ ok: true });
  }

  const payload = start[1];

  if (!payload) {
    await enviarMensagemTelegram(
      chatId,
      "Escolha no site quem você quer acompanhar. Depois, use o botão do Telegram para ativar as notificações:\n\n" +
        "https://www.foradapauta.org/votou-fique-de-olho",
    );

    return NextResponse.json({ ok: true });
  }

  if (payload === "edicoes") {
    await enviarMensagemTelegram(
      chatId,
      "Este link antigo foi substituído.\n\n" +
        "Agora há uma única opção para receber notificações do Fora da Pauta. " +
        "Faça a ativação pela página:\n\n" +
        "https://www.foradapauta.org/votou-fique-de-olho",
    );

    return NextResponse.json({ ok: true });
  }

  if (!payload.startsWith("v_")) {
    await enviarMensagemTelegram(
      chatId,
      "Este link não é mais válido. Faça uma nova ativação pelo site:\n\n" +
        "https://www.foradapauta.org/votou-fique-de-olho",
    );

    return NextResponse.json({ ok: true });
  }

  const token = payload.slice(2);

  if (!/^[A-Za-z0-9_-]{20,60}$/.test(token)) {
    await enviarMensagemTelegram(
      chatId,
      "Este link é inválido. Volte ao site e gere uma nova ativação.",
    );

    return NextResponse.json({ ok: true });
  }

  const resultado = await consumirVinculo(
    chatId,
    token,
  );

  if (!resultado.ok) {
    await enviarMensagemTelegram(
      chatId,
      "Este link expirou ou já foi utilizado.\n\n" +
        "Volte ao Fora da Pauta e toque novamente em ativar o Telegram.",
    );

    return NextResponse.json({ ok: true });
  }

  const complemento =
    resultado.quantidade === 1
      ? "1 pessoa"
      : `${resultado.quantidade} pessoas`;

  await enviarMensagemTelegram(
    chatId,
    "Pronto. Suas notificações do Fora da Pauta estão ativadas.\n\n" +
      `Você está acompanhando ${complemento}. ` +
      "Quando houver uma atualização relevante, ela poderá chegar por aqui.\n\n" +
      "Para interromper as notificações, envie /parar.",
  );

  return NextResponse.json({ ok: true });
}
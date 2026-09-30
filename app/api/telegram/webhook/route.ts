import {
  timingSafeEqual,
} from "node:crypto";

import { NextResponse } from "next/server";

import { candidaturas } from "@/data/eleicoes/candidaturas";
import { buscarPessoaPoliticaConfirmadaPorCandidatura } from "@/lib/eleicoes/identidade-politica";
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

const START_PATTERN =
  /^\/start(?:@[A-Za-z0-9_]+)?(?:\s+seguir_(\d{8,20}))?\s*$/i;

function obterVariavelObrigatoria(
  nome: string,
) {
  const valor =
    process.env[nome]?.trim();

  if (!valor) {
    throw new Error(
      `ENV_MISSING:${nome}`,
    );
  }

  return valor;
}

function segredoConfere(
  recebido: string,
  esperado: string,
) {
  const a =
    Buffer.from(
      recebido,
      "utf8",
    );

  const b =
    Buffer.from(
      esperado,
      "utf8",
    );

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(
    a,
    b,
  );
}

async function enviarMensagemTelegram({
  chatId,
  texto,
  candidaturaId,
}: {
  chatId: string;
  texto: string;
  candidaturaId?: string;
}) {
  const botToken =
    obterVariavelObrigatoria(
      "TELEGRAM_BOT_TOKEN",
    );

  const replyMarkup =
    candidaturaId
      ? {
          inline_keyboard: [
            [
              {
                text:
                  "Ver ficha no Fora da Pauta",
                url:
                  `https://www.foradapauta.org/conheca-seu-candidato/${candidaturaId}`,
              },
            ],
          ],
        }
      : undefined;

  const response =
    await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            chat_id:
              chatId,
            text:
              texto,
            disable_web_page_preview:
              true,
            reply_markup:
              replyMarkup,
          }),
        cache: "no-store",
      },
    );

  if (!response.ok) {
    throw new Error(
      `TELEGRAM_SEND_FAILED:${response.status}`,
    );
  }
}

async function registrarAcompanhamento(
  chatId: string,
  candidaturaId: string,
) {
  const pessoaPoliticaId =
    buscarPessoaPoliticaConfirmadaPorCandidatura(
      candidaturaId,
    );

  await sql`
    INSERT INTO telegram_acompanhamentos (
      telegram_chat_id,
      candidatura_id,
      identidade_politica_id,
      status,
      created_at,
      updated_at,
      cancelled_at
    )
    VALUES (
      ${chatId}::bigint,
      ${candidaturaId},
      ${pessoaPoliticaId},
      'aguardando_eleicao',
      now(),
      now(),
      NULL
    )
    ON CONFLICT (
      telegram_chat_id,
      candidatura_id
    )
    DO UPDATE SET
      identidade_politica_id =
        EXCLUDED.identidade_politica_id,

      status =
        CASE
          WHEN telegram_acompanhamentos.status
            IN (
              'ativo',
              'nao_eleito',
              'encerrado'
            )
            THEN telegram_acompanhamentos.status

          ELSE 'aguardando_eleicao'
        END,

      updated_at =
        now(),

      cancelled_at =
        NULL
  `;
}

export async function POST(
  request: Request,
) {
  try {
    const webhookSecret =
      obterVariavelObrigatoria(
        "TELEGRAM_WEBHOOK_SECRET",
      );

    const secretRecebido =
      request.headers
        .get(
          "x-telegram-bot-api-secret-token",
        )
        ?.trim() ?? "";

    if (
      !secretRecebido ||
      !segredoConfere(
        secretRecebido,
        webhookSecret,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
        },
        {
          status: 401,
        },
      );
    }

    const update =
      (
        await request
          .json()
          .catch(() => null)
      ) as TelegramUpdate | null;

    const message =
      update?.message;

    const texto =
      message?.text?.trim();

    const chatIdRaw =
      message?.chat?.id;

    const chatType =
      message?.chat?.type;

    /*
     * O acompanhamento e individual.
     * Ignoramos mensagens vindas de grupos.
     */
    if (
      !texto ||
      typeof chatIdRaw !== "number" ||
      chatType !== "private"
    ) {
      return NextResponse.json({
        ok: true,
      });
    }

    const chatId =
      String(chatIdRaw);

    const match =
      texto.match(
        START_PATTERN,
      );

    if (!match) {
      return NextResponse.json({
        ok: true,
      });
    }

    const candidaturaId =
      match[1];

    if (!candidaturaId) {
      await enviarMensagemTelegram({
        chatId,
        texto:
          "Para acompanhar um candidato, abra a ficha no Fora da Pauta e toque em \"Acompanhar no Telegram\".",
      });

      return NextResponse.json({
        ok: true,
      });
    }

    const candidato =
      candidaturas.find(
        (item) =>
          item.id ===
          candidaturaId,
      );

    if (!candidato) {
      await enviarMensagemTelegram({
        chatId,
        texto:
          "Nao foi possivel localizar essa candidatura na base eleitoral do Fora da Pauta.",
      });

      return NextResponse.json({
        ok: true,
      });
    }

    await registrarAcompanhamento(
      chatId,
      candidaturaId,
    );

    await enviarMensagemTelegram({
      chatId,
      candidaturaId,
      texto:
        `Voce esta acompanhando ${candidato.nomeUrna}.\n\n` +
        "Se essa candidatura for eleita, o Fora da Pauta enviara aqui avisos quando novos registros documentados forem incorporados a ficha.\n\n" +
        "Voce podera parar de acompanhar quando quiser.",
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Falha no webhook de acompanhamento do Telegram:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 500,
      },
    );
  }
}

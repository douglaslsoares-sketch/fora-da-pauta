import { timingSafeEqual } from "node:crypto";

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

type TelegramButton = {
  text: string;
  url: string;
};

const START_PATTERN =
  /^\/start(?:@[A-Za-z0-9_]+)?(?:\s+([A-Za-z0-9_-]+))?\s*$/i;

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

function obterBotUsername() {
  return (
    process.env
      .NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
      ?.trim()
      .replace(/^@/, "") ||
    "ForaDaPautaAcompanhaBot"
  );
}

function segredoConfere(
  recebido: string,
  esperado: string,
) {
  const a =
    Buffer.from(recebido, "utf8");

  const b =
    Buffer.from(esperado, "utf8");

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
  botoes = [],
}: {
  chatId: string;
  texto: string;
  botoes?: TelegramButton[][];
}) {
  const botToken =
    obterVariavelObrigatoria(
      "TELEGRAM_BOT_TOKEN",
    );

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
              botoes.length
                ? {
                    inline_keyboard:
                      botoes,
                  }
                : undefined,
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

      updated_at = now(),
      cancelled_at = NULL
  `;
}

async function registrarNovasEdicoes(
  chatId: string,
) {
  await sql`
    INSERT INTO telegram_preferencias (
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
      'novas_edicoes',
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
}

async function cancelarTudo(
  chatId: string,
) {
  await sql.begin(
    async (tx) => {
      await tx`
        UPDATE telegram_acompanhamentos
        SET
          status = 'cancelado',
          updated_at = now(),
          cancelled_at = now()
        WHERE
          telegram_chat_id =
            ${chatId}::bigint
          AND status NOT IN (
            'cancelado',
            'encerrado'
          )
      `;

      await tx`
        UPDATE telegram_preferencias
        SET
          status = 'cancelado',
          updated_at = now(),
          cancelled_at = now()
        WHERE
          telegram_chat_id =
            ${chatId}::bigint
          AND status = 'ativo'
      `;
    },
  );
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

    if (
      /^\/parar(?:@[A-Za-z0-9_]+)?\s*$/i.test(
        texto,
      )
    ) {
      await cancelarTudo(
        chatId,
      );

      await enviarMensagemTelegram({
        chatId,
        texto:
          "Pronto. O recebimento de avisos do Fora da Pauta foi interrompido.\n\nSe quiser voltar a acompanhar alguma coisa depois, basta ativar novamente pelo site.",
      });

      return NextResponse.json({
        ok: true,
      });
    }

    const match =
      texto.match(
        START_PATTERN,
      );

    if (!match) {
      return NextResponse.json({
        ok: true,
      });
    }

    const payload =
      match[1]?.toLowerCase();

    const botUsername =
      obterBotUsername();

    if (!payload) {
      await enviarMensagemTelegram({
        chatId,
        texto:
          "O bot do Fora da Pauta entrega diretamente pelo Telegram os avisos que você escolher receber.\n\nVocê pode acompanhar candidatos e, separadamente, escolher receber novas edições.",
        botoes: [
          [
            {
              text: "Receber novas edições",
              url:
                `https://t.me/${botUsername}?start=edicoes`,
            },
          ],
          [
            {
              text: "Escolher candidato",
              url:
                "https://www.foradapauta.org/conheca-seu-candidato",
            },
          ],
        ],
      });

      return NextResponse.json({
        ok: true,
      });
    }

    if (payload === "edicoes") {
      await registrarNovasEdicoes(
        chatId,
      );

      await enviarMensagemTelegram({
        chatId,
        texto:
          "Pronto. Você escolheu receber pelo Telegram os avisos de novas edições do Fora da Pauta.\n\nEssa escolha é independente do acompanhamento de candidatos.",
        botoes: [
          [
            {
              text: "Escolher candidato para acompanhar",
              url:
                "https://www.foradapauta.org/conheca-seu-candidato",
            },
          ],
        ],
      });

      return NextResponse.json({
        ok: true,
      });
    }

    const seguirMatch =
      payload.match(
        /^seguir_(\d{8,20})$/,
      );

    if (!seguirMatch) {
      await enviarMensagemTelegram({
        chatId,
        texto:
          "Não consegui identificar o acompanhamento solicitado. Abra novamente o link no Fora da Pauta.",
      });

      return NextResponse.json({
        ok: true,
      });
    }

    const candidaturaId =
      seguirMatch[1];

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
          "Não foi possível localizar essa candidatura na base eleitoral do Fora da Pauta.",
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
      texto:
        `Você está acompanhando ${candidato.nomeUrna}.\n\n` +
        "Se essa candidatura for eleita, o Fora da Pauta enviará aqui avisos quando novos registros documentados forem incorporados à ficha.\n\nVocê não precisa voltar ao site para procurar novidades. Para interromper os avisos, envie /parar.",
      botoes: [
        [
          {
            text: "Ver ficha no Fora da Pauta",
            url:
              `https://www.foradapauta.org/conheca-seu-candidato/${candidaturaId}`,
          },
        ],
        [
          {
            text: "Receber também novas edições",
            url:
              `https://t.me/${botUsername}?start=edicoes`,
          },
        ],
      ],
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Falha no webhook do Telegram:",
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

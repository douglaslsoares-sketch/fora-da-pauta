import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { candidaturas } from "@/data/eleicoes/candidaturas";
import { eleitos2026 } from "@/data/eleicoes/eleitos";
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

type VinculoPendente = {
  candidatura_ids: string[];
  consumido: boolean;
  consumed_by_chat_id: string | null;
  valido: boolean;
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

function hashToken(token: string) {
  return createHash("sha256")
    .update(token, "utf8")
    .digest("hex");
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
      const pessoaPoliticaId =
        buscarPessoaPoliticaConfirmadaPorCandidatura(candidaturaId);

      await tx`
        INSERT INTO public.telegram_acompanhamentos (
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
          identidade_politica_id = COALESCE(
            EXCLUDED.identidade_politica_id,
            telegram_acompanhamentos.identidade_politica_id
          ),
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
      await tx`
        UPDATE public.telegram_fila_avisos
        SET
          status = 'cancelado',
          updated_at = now(),
          ultimo_erro_codigo = 'CANCELADO_PELO_USUARIO'
        WHERE telegram_chat_id = ${chatId}::bigint
          AND status IN ('pendente', 'erro')
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
      !Number.isSafeInteger(chatIdRaw) ||
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
          "Pronto. O recebimento de avisos do Fora da Pauta foi interrompido.\n\nSe quiser voltar a acompanhar alguma coisa depois, envie /start e escolha novamente o que deseja acompanhar.",
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
      match[1];

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

    if (payload.startsWith("v_")) {
      const token = payload.slice(2);

      if (!/^[A-Za-z0-9_-]{20,60}$/.test(token)) {
        await enviarMensagemTelegram({
          chatId,
          texto: "Este link \u00e9 inv\u00e1lido. Volte ao site e gere uma nova ativa\u00e7\u00e3o.",
        });
        return NextResponse.json({ ok: true });
      }

      const resultado = await consumirVinculo(chatId, token);

      if (!resultado.ok) {
        await enviarMensagemTelegram({
          chatId,
          texto: "Este link expirou ou j\u00e1 foi utilizado.\n\n" +
            "Volte ao Fora da Pauta e toque novamente em ativar o Telegram.",
        });
        return NextResponse.json({ ok: true });
      }

      if (resultado.repetido) {
        await enviarMensagemTelegram({
          chatId,
          texto: "Suas escolhas j\u00e1 foram registradas com este link.\n\n" +
            "Para uma nova ativa\u00e7\u00e3o, gere outro link pelo site:\n\n" +
            "https://www.foradapauta.org/votou-fique-de-olho",
        });
        return NextResponse.json({ ok: true });
      }

      const quantidade = resultado.quantidade === 1
        ? "1 pessoa"
        : String(resultado.quantidade) + " pessoas";

      await enviarMensagemTelegram({
        chatId,
        texto: "Pronto. Suas notifica\u00e7\u00f5es do Fora da Pauta est\u00e3o ativadas.\n\n" +
          "Voc\u00ea est\u00e1 acompanhando " + quantidade + ". " +
          "Quando houver uma atualiza\u00e7\u00e3o relevante, ela poder\u00e1 chegar por aqui.\n\n" +
          "Para interromper as notifica\u00e7\u00f5es, envie /parar.",
      });
      return NextResponse.json({ ok: true });
    }

    if (payload.toLowerCase() === "edicoes") {
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
      payload.toLowerCase().match(
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

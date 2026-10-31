import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { candidaturas } from "@/data/eleicoes/candidaturas";
import { idsAcompanhaveis } from "@/lib/eleicoes/acompanhamento-politico";
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

  const idsEleitos = idsAcompanhaveis;

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
): Promise<boolean> {
  const pessoaPoliticaId =
    buscarPessoaPoliticaConfirmadaPorCandidatura(candidaturaId);

  return sql.begin(async (tx) => {
    // Uma inscrição no bot inclui novas edições por padrão.
    // Se a pessoa já desativou as edições, respeita a decisão anterior.
    await tx`
      INSERT INTO public.telegram_preferencias (
        telegram_chat_id, tipo, referencia, status,
        created_at, updated_at, cancelled_at
      )
      VALUES (
        ${chatId}::bigint, 'novas_edicoes', '', 'ativo',
        now(), now(), NULL
      )
      ON CONFLICT (telegram_chat_id, tipo, referencia) DO NOTHING
    `;

    await tx`
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
        'ativo',
        now(),
        now(),
        NULL
      )
      ON CONFLICT (telegram_chat_id, candidatura_id)
      DO UPDATE SET
        identidade_politica_id = COALESCE(
          EXCLUDED.identidade_politica_id,
          telegram_acompanhamentos.identidade_politica_id
        ),
        status = CASE
          WHEN telegram_acompanhamentos.status = 'encerrado'
            THEN 'encerrado'
          ELSE 'ativo'
        END,
        updated_at = now(),
        cancelled_at = NULL
    `;

    const preferencias = await tx<{ ativa: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM public.telegram_preferencias
        WHERE telegram_chat_id = ${chatId}::bigint
          AND tipo = 'novas_edicoes'
          AND referencia = ''
          AND status = 'ativo'
          AND cancelled_at IS NULL
      ) AS ativa
    `;
    return preferencias[0]?.ativa === true;
  });
}


async function mostrarPreferencias(chatId: string) {
  const [pessoas, edicoes] = await Promise.all([
    sql<{ candidatura_id: string }[]>`
      SELECT candidatura_id
      FROM public.telegram_acompanhamentos
      WHERE telegram_chat_id = ${chatId}::bigint
        AND status IN ('ativo', 'aguardando_eleicao', 'nao_eleito')
        AND cancelled_at IS NULL
      ORDER BY candidatura_id
      LIMIT 100
    `,
    sql<{ tipo: string }[]>`
      SELECT tipo
      FROM public.telegram_preferencias
      WHERE telegram_chat_id = ${chatId}::bigint
        AND tipo = 'novas_edicoes'
        AND status = 'ativo'
        AND cancelled_at IS NULL
      LIMIT 1
    `,
  ]);

  const nomes = new Map(candidaturas.map((item) => [item.id, item.nomeUrna]));
  const itens = pessoas.slice(0, 20).map(({ candidatura_id }) =>
    "• " + (nomes.get(candidatura_id) ?? "Candidatura " + candidatura_id) +
    "\n  Parar: /parar_candidato_" + candidatura_id
  );
  const restantes = pessoas.length > 20
    ? "\n... e mais " + (pessoas.length - 20) + " pessoas."
    : "";
  await enviarMensagemTelegram({
    chatId,
    texto:
      "Suas escolhas no Fora da Pauta:\n\n" +
      "Novas edições: " + (edicoes.length ? "ativadas" : "não ativadas") + ".\n" +
      "Políticos acompanhados: " + pessoas.length + ".\n\n" +
      (itens.length ? itens.join("\n") + restantes : "Nenhum político selecionado.") +
      "\n\nPara parar apenas novas edições, envie /parar_edicoes." +
      "\nPara parar tudo, envie /parar.",
    botoes: [[{
      text: "Voltar ao Fora da Pauta",
      url: "https://foradapauta.org/",
    }]],
  });
}

async function cancelarEdicoes(chatId: string) {
  return sql.begin(async (tx) => {
    const alteradas = await tx`
      UPDATE public.telegram_preferencias
      SET status = 'cancelado', cancelled_at = now(), updated_at = now()
      WHERE telegram_chat_id = ${chatId}::bigint
        AND tipo = 'novas_edicoes'
        AND referencia = ''
        AND status = 'ativo'
      RETURNING tipo
    `;
    await tx`
      UPDATE public.telegram_fila_avisos
      SET status = 'cancelado', updated_at = now(),
          ultimo_erro_codigo = 'PREFERENCIA_DESATIVADA'
      WHERE telegram_chat_id = ${chatId}::bigint
        AND tipo = 'edicoes'
        AND status IN ('pendente', 'erro')
    `;
    return alteradas.length > 0;
  });
}

async function cancelarCandidato(chatId: string, candidaturaId: string) {
  return sql.begin(async (tx) => {
    const alteradas = await tx`
      UPDATE public.telegram_acompanhamentos
      SET status = 'cancelado', cancelled_at = now(), updated_at = now()
      WHERE telegram_chat_id = ${chatId}::bigint
        AND candidatura_id = ${candidaturaId}
        AND status IN ('ativo', 'aguardando_eleicao', 'nao_eleito')
        AND cancelled_at IS NULL
      RETURNING candidatura_id
    `;
    await tx`
      UPDATE public.telegram_fila_avisos
      SET status = 'cancelado', updated_at = now(),
          ultimo_erro_codigo = 'ACOMPANHAMENTO_DESATIVADO'
      WHERE telegram_chat_id = ${chatId}::bigint
        AND tipo = 'candidato'
        AND referencia = ${candidaturaId}
        AND status IN ('pendente', 'erro')
    `;
    return alteradas.length > 0;
  });
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

    // Demonstração acionada apenas pela pessoa que digita /teste em seu chat privado.
    // Nunca envia a outros usuários nem adiciona avisos à fila.
    if (/^\/teste(?:@[A-Za-z0-9_]+)?\s*$/i.test(texto)) {
      await enviarMensagemTelegram({
        chatId,
        texto:
          "TESTE — Fora da Pauta\n\n" +
          "Esta é uma notificação demonstrativa, não uma edição publicada.\n\n" +
          "Abra a leitura, volte ao Telegram e experimente as opções abaixo.\n" +
          "Nenhuma notificação será enviada a outras pessoas.",
        botoes: [
          [{ text: "Ler artigo demonstrativo", url: "https://www.foradapauta.org/teste-telegram" }],
          [{ text: "Minhas escolhas", url: "https://www.foradapauta.org/votou-fique-de-olho" }],
          [{ text: "Buscar pessoas e fichas", url: "https://www.foradapauta.org/conheca-seu-candidato" }],
          [{ text: "Ver edição: escala 6×1", url: "https://www.foradapauta.org/campanhas/fim-escala-6x1" }],
          [{ text: "Abrir o site", url: "https://www.foradapauta.org/" }],
        ],
      });
      return NextResponse.json({ ok: true });
    }

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


    if (/^\/(?:opcoes|preferencias)(?:@[A-Za-z0-9_]+)?\s*$/i.test(texto)) {
      await mostrarPreferencias(chatId);
      return NextResponse.json({ ok: true });
    }

    if (/^\/parar_edicoes(?:@[A-Za-z0-9_]+)?\s*$/i.test(texto)) {
      const alterou = await cancelarEdicoes(chatId);
      await enviarMensagemTelegram({
        chatId,
        texto: alterou
          ? "Avisos de novas edições interrompidos. Seus outros acompanhamentos continuam ativos. Envie /opcoes para conferir."
          : "Novas edições já estavam desativadas. Envie /opcoes para conferir.",
      });
      return NextResponse.json({ ok: true });
    }

    const cancelarPessoa = texto.match(
      /^\/parar_candidato_(\d{8,20})(?:@[A-Za-z0-9_]+)?\s*$/i,
    );

    if (cancelarPessoa) {
      const alterou = await cancelarCandidato(chatId, cancelarPessoa[1]);
      await enviarMensagemTelegram({
        chatId,
        texto: alterou
          ? "Acompanhamento interrompido. Suas outras escolhas continuam ativas. Envie /opcoes para conferir."
          : "Este acompanhamento já estava desativado. Envie /opcoes para conferir.",
      });
      return NextResponse.json({ ok: true });
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

    if (payload?.toLowerCase() === "opcoes") {
      await mostrarPreferencias(chatId);
      return NextResponse.json({ ok: true });
    }

    if (!payload) {
      await enviarMensagemTelegram({
        chatId,
        texto:
          "O Fora da Pauta pode avisar você sobre novas publicações e sobre políticos que escolher acompanhar. Tudo por esta mesma conversa.\n\nEnvie /opcoes para consultar ou modificar suas escolhas.",
        botoes: [
          [
            {
              text: "Acompanhar o Fora da Pauta",
              url:
                `https://t.me/${botUsername}?start=projeto`,
            },
          ],
          [
            {
              text: "Voltar ao Fora da Pauta",
              url:
                "https://foradapauta.org/",
            },
          ],
        ],
      });

      return NextResponse.json({
        ok: true,
      });
    }

    if (payload.startsWith("s_")) {
      const codigo = payload.slice(2);
      if (!/^[A-Za-z0-9_-]{32}$/.test(codigo)) {
        await enviarMensagemTelegram({ chatId, texto: "Link de confirmação inválido." });
        return NextResponse.json({ ok: true });
      }
      const hash = hashToken(codigo);
      const codigoRetorno = randomBytes(24).toString("base64url");
      const hashRetorno = hashToken(codigoRetorno);
      const confirmado = await sql.begin(async tx => {
        const vinculos = await tx<{ sessao_hash: string; telegram_chat_id: string | null; candidaturas_pendentes: string[] }[]>`
          SELECT sessao_hash, telegram_chat_id::text AS telegram_chat_id, candidaturas_pendentes
          FROM public.telegram_sessoes_site
          WHERE codigo_hash = ${hash}
            AND codigo_expira_at > now()
            AND expira_at > now()
          FOR UPDATE
        `;
        const vinculo = vinculos[0];
        if (!vinculo || (vinculo.telegram_chat_id && vinculo.telegram_chat_id !== chatId)) return false;
        const idsEleitos = idsAcompanhaveis;
        const pendentes = vinculo.candidaturas_pendentes ?? [];
        if (pendentes.some(id => !idsEleitos.has(id))) return false;
        await tx`
          INSERT INTO telegram_preferencias
            (telegram_chat_id, tipo, referencia, status, created_at, updated_at, cancelled_at)
          VALUES (${chatId}::bigint, 'novas_edicoes', '', 'ativo', now(), now(), NULL)
          ON CONFLICT (telegram_chat_id, tipo, referencia) DO NOTHING
        `;
        for (const id of pendentes) {
          const identidade = buscarPessoaPoliticaConfirmadaPorCandidatura(id);
          await tx`
            INSERT INTO public.telegram_acompanhamentos
              (telegram_chat_id, candidatura_id, identidade_politica_id, status, created_at, updated_at, cancelled_at)
            VALUES (${chatId}::bigint, ${id}, ${identidade}, 'ativo', now(), now(), NULL)
            ON CONFLICT (telegram_chat_id, candidatura_id)
            DO UPDATE SET identidade_politica_id = COALESCE(EXCLUDED.identidade_politica_id,
                telegram_acompanhamentos.identidade_politica_id),
              status = 'ativo', updated_at = now(), cancelled_at = NULL
          `;
        }
        await tx`
          UPDATE public.telegram_sessoes_site
          SET telegram_chat_id = ${chatId}::bigint,
              vinculada_at = now(), codigo_hash = ${hashRetorno},
              codigo_expira_at = now() + interval '15 minutes',
              candidaturas_pendentes = '{}'
          WHERE sessao_hash = ${vinculo.sessao_hash}
        `;
        return true;
      });
      if (!confirmado) {
        await enviarMensagemTelegram({
          chatId,
          texto: "Este link expirou ou já foi usado. Volte ao site e solicite uma nova confirmação.",
        });
        return NextResponse.json({ ok: true });
      }
      await enviarMensagemTelegram({
        chatId,
        texto:
          "Sua inscrição foi registrada no Telegram. " +
          "Para finalizar e conferir suas escolhas no Fora da Pauta, toque no botão abaixo. " +
          "As novas edições são ativadas por padrão, sem reativar uma preferência que você tenha desativado. " +
          "As pessoas escolhidas ficam na mesma conversa. Envie /opcoes para consultar suas preferências.",
        botoes: [[{
          text: "Concluir a inscrição",
          url: `https://www.foradapauta.org/api/telegram/concluir?codigo=${codigoRetorno}`,
        }]],
      });
      return NextResponse.json({ ok: true });
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
            "https://www.foradapauta.org/",
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

    if (["edicoes", "projeto"].includes(payload.toLowerCase())) {
      await registrarNovasEdicoes(
        chatId,
      );

      await enviarMensagemTelegram({
        chatId,
        texto:
          "Pronto. Você escolheu receber pelo Telegram as novidades editoriais do Fora da Pauta.\n\nVocê pode acompanhar políticos nesta mesma conversa, sem criar outra conta. Envie /opcoes para consultar suas escolhas.",
        botoes: [
          [
            {
              text: "Voltar ao Fora da Pauta",
              url:
                "https://foradapauta.org/",
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

    const novasEdicoesAtivas = await registrarAcompanhamento(
      chatId,
      candidaturaId,
    );

    await enviarMensagemTelegram({
      chatId,
      texto:
        `Você está acompanhando ${candidato.nomeUrna}.\n\n` +
        "O Fora da Pauta reúne informações públicas verificadas sobre a atuação política dessa pessoa, tenha sido eleita ou não. Quando houver novidades documentadas, você poderá receber avisos aqui no Telegram, com as fontes para consultar.\n\n" +
        (novasEdicoesAtivas
          ? "Você também receberá avisos sobre novas edições do Fora da Pauta. Tudo nesta mesma conversa.\n\n"
          : "Você havia desativado as novas edições, e essa escolha foi preservada. Se quiser reativá-las, envie /start projeto.\n\n") +
        `Para consultar suas escolhas, envie /opcoes. Para deixar de acompanhar apenas ${candidato.nomeUrna}, envie /parar_candidato_${candidaturaId}.`,
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

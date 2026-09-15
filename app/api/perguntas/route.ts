import {
  createHash,
  randomBytes,
} from "node:crypto";

import { NextResponse } from "next/server";

import { sql } from "@/lib/interesses/db";
import {
  consumeRateLimit,
} from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_POST_BODY_BYTES =
  32 * 1024;

const QUESTION_BURST_LIMIT = 8;
const QUESTION_BURST_WINDOW_SECONDS =
  10 * 60;

const QUESTION_24H_LIMIT = 40;
const QUESTION_24H_WINDOW_SECONDS =
  24 * 60 * 60;

type QuestionRequest = {
  confirmedText?: string;
  rawTranscript?: string | null;
  inputType?: "voice" | "text";
  website?: string;
};

function trackingHash(
  token: string,
) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function normalizeNullableText(
  value: unknown,
) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized =
    value.trim();

  return normalized || null;
}

function isSameOrigin(
  request: Request,
) {
  const origin =
    request.headers.get(
      "origin",
    );

  /*
   * A ausencia de Origin nao desliga o rate limit.
   * Navegadores normais enviam Origin neste POST.
   */
  if (!origin) {
    return true;
  }

  try {
    return (
      new URL(origin).origin ===
      new URL(request.url).origin
    );
  }
  catch {
    return false;
  }
}

function declaredRequestTooLarge(
  request: Request,
) {
  const value =
    request.headers.get(
      "content-length",
    );

  if (!value) {
    return false;
  }

  const bytes =
    Number(value);

  return (
    Number.isFinite(bytes) &&
    bytes > MAX_POST_BODY_BYTES
  );
}

function tooManyRequests(
  retryAfterSeconds: number,
) {
  return NextResponse.json(
    {
      error:
        "Muitas perguntas foram enviadas em pouco tempo. Aguarde um pouco e tente novamente.",
    },
    {
      status: 429,
      headers: {
        "Cache-Control":
          "no-store",

        "Retry-After":
          String(
            Math.max(
              1,
              retryAfterSeconds,
            ),
          ),
      },
    },
  );
}

export async function GET(
  request: Request,
) {
  try {
    const url =
      new URL(request.url);

    const requestedLimit =
      Number(
        url.searchParams.get("limit") ?? "30",
      );

    const limit =
      Number.isFinite(requestedLimit)
        ? Math.min(
            Math.max(
              Math.trunc(requestedLimit),
              1,
            ),
            100,
          )
        : 30;

    const rows = await sql`
      SELECT
        id,
        confirmed_text,
        response_text,
        response_published_at
      FROM public_questions
      WHERE
        is_public IS TRUE
        AND status = 'answered'
        AND response_text IS NOT NULL
        AND response_published_at IS NOT NULL
      ORDER BY
        response_published_at DESC,
        created_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json(
      {
        questions:
          rows.map((row) => ({
            id: String(row.id),
            question:
              String(row.confirmed_text),
            answer:
              String(row.response_text),
            publishedAt:
              row.response_published_at,
          })),
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Falha ao listar perguntas públicas:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar as perguntas e respostas.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    /*
     * Impede que outro site use o navegador de terceiros
     * para enviar perguntas ao Fora da Pauta.
     */
    if (
      !isSameOrigin(
        request,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Origem da requisição não permitida.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    /*
     * Rejeita corpos declaradamente grandes antes de
     * carregar e interpretar o JSON.
     */
    if (
      declaredRequestTooLarge(
        request,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A solicitação excede o tamanho permitido.",
        },
        {
          status: 413,
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    const body =
      (await request
        .json()
        .catch(() => ({}))) as QuestionRequest;

    /*
     * Campo-armadilha simples.
     *
     * Usuarios reais nao o preenchem.
     */
    if (body.website?.trim()) {
      return NextResponse.json(
        { ok: true },
        {
          status: 201,
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    const confirmedText =
      body.confirmedText?.trim();

    const rawTranscript =
      normalizeNullableText(
        body.rawTranscript,
      );

    const inputType =
      body.inputType === "voice"
        ? "voice"
        : "text";

    if (!confirmedText) {
      return NextResponse.json(
        {
          error:
            "A pergunta não pode estar vazia.",
        },
        { status: 400 },
      );
    }

    if (confirmedText.length > 2000) {
      return NextResponse.json(
        {
          error:
            "A pergunta excede o tamanho permitido.",
        },
        { status: 400 },
      );
    }

    if (
      rawTranscript &&
      rawTranscript.length > 5000
    ) {
      return NextResponse.json(
        {
          error:
            "A transcrição excede o tamanho permitido.",
        },
        { status: 400 },
      );
    }

    /*
     * So requisicoes estruturalmente validas consomem
     * os contadores de envio.
     */
    const burstLimit =
      await consumeRateLimit({
        request,
        scope:
          "questions:submit:10m",
        limit:
          QUESTION_BURST_LIMIT,
        windowSeconds:
          QUESTION_BURST_WINDOW_SECONDS,
      });

    if (!burstLimit.allowed) {
      return tooManyRequests(
        burstLimit
          .retryAfterSeconds,
      );
    }

    const longLimit =
      await consumeRateLimit({
        request,
        scope:
          "questions:submit:24h",
        limit:
          QUESTION_24H_LIMIT,
        windowSeconds:
          QUESTION_24H_WINDOW_SECONDS,
      });

    if (!longLimit.allowed) {
      return tooManyRequests(
        longLimit
          .retryAfterSeconds,
      );
    }

    const trackingToken =
      randomBytes(32)
        .toString("base64url");

    const tokenHash =
      trackingHash(
        trackingToken,
      );

    const result =
      await sql.begin(
        async (tx) => {

          const questionRows =
            await tx`
              INSERT INTO public_questions (
                tracking_token_hash,
                input_type,
                raw_transcript,
                confirmed_text
              )
              VALUES (
                ${tokenHash},
                ${inputType},
                ${rawTranscript},
                ${confirmedText}
              )
              RETURNING
                id,
                status,
                created_at
            `;

          const question =
            questionRows[0] as {
              id: string;
              status: string;
              created_at: string;
            };

          await tx`
            INSERT INTO public_question_events (
              question_id,
              event_type,
              event_data
            )
            VALUES (
              ${question.id}::uuid,
              'submitted',
              jsonb_build_object(
                'input_type',
                ${inputType}::text
              )
            )
          `;

          return question;
        },
      );

    return NextResponse.json(
      {
        questionId:
          result.id,

        status:
          result.status,

        createdAt:
          result.created_at,

        trackingToken,

        trackingPath:
          `/pergunta/${trackingToken}`,
      },
      {
        status: 201,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Falha ao registrar pergunta pública:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível enviar a pergunta.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}
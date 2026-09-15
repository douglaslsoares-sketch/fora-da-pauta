import {
  cookies,
} from "next/headers";

import {
  NextResponse,
} from "next/server";

import {
  QUESTIONS_ADMIN_COOKIE,
  verifyQuestionsAdminSessionToken,
} from "@/lib/questionsAdminAuth";

import {
  sql,
} from "@/lib/interesses/db";

export const dynamic =
  "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isSameOrigin(
  request: Request,
) {
  const origin =
    request.headers.get(
      "origin",
    );

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

function noStoreJson(
  body: unknown,
  status: number,
) {
  const response =
    NextResponse.json(
      body,
      {
        status,
      },
    );

  response.headers.set(
    "Cache-Control",
    "no-store",
  );

  return response;
}

export async function POST(
  request: Request,
) {
  if (
    !isSameOrigin(
      request,
    )
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "Origem não autorizada.",
      },
      403,
    );
  }

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      QUESTIONS_ADMIN_COOKIE,
    )?.value;

  if (
    !verifyQuestionsAdminSessionToken(
      token,
    )
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "Acesso não autorizado.",
      },
      401,
    );
  }

  const body =
    (
      await request
        .json()
        .catch(
          () => ({}),
        )
    ) as {
      questionId?: unknown;
      responseText?: unknown;
      publishPublicly?: unknown;
    };

  const questionId =
    typeof body.questionId ===
      "string"
      ? body.questionId.trim()
      : "";

  const responseText =
    typeof body.responseText ===
      "string"
      ? body.responseText.trim()
      : "";

  if (
    !UUID_PATTERN.test(
      questionId,
    )
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "Pergunta inválida.",
      },
      400,
    );
  }

  if (
    !responseText ||
    responseText.length > 10000
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "A resposta está vazia ou excede o tamanho permitido.",
      },
      400,
    );
  }

  if (
    typeof body.publishPublicly !==
      "boolean"
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "A decisão de publicação é obrigatória.",
      },
      400,
    );
  }

  const publishPublicly =
    body.publishPublicly;

  try {
    const result =
      await sql.begin(
        async (tx) => {

          const rows =
            await tx`
              SELECT
                id,
                status,
                is_public

              FROM public_questions

              WHERE id =
                ${questionId}::uuid

              FOR UPDATE
            `;

          if (
            rows.length !== 1
          ) {
            throw new Error(
              "QUESTION_NOT_FOUND",
            );
          }

          const previousStatus =
            String(
              rows[0].status,
            );

          const previousIsPublic =
            Boolean(
              rows[0].is_public,
            );

          if (
            previousStatus ===
              "hidden"
          ) {
            throw new Error(
              "QUESTION_HIDDEN",
            );
          }

          const updatedRows =
            await tx`
              UPDATE public_questions

              SET
                response_text =
                  ${responseText},

                status =
                  'answered',

                is_public =
                  ${publishPublicly}::boolean,

                response_published_at =
                  CASE
                    WHEN
                      ${publishPublicly}::boolean
                    THEN
                      COALESCE(
                        response_published_at,
                        now()
                      )

                    ELSE
                      NULL
                  END

              WHERE id =
                ${questionId}::uuid

              RETURNING
                id,
                status,
                is_public,
                response_published_at,
                updated_at
            `;

          const eventType =
            previousStatus ===
              "answered"
              ? "answer_updated"
              : "answered";

          const eventData =
            JSON.stringify({
              previousStatus,
              previousIsPublic,
              publishPublicly,
              source:
                "questions_admin",
            });

          await tx`
            INSERT INTO public_question_events (
              question_id,
              event_type,
              event_data
            )
            VALUES (
              ${questionId}::uuid,
              ${eventType}::text,
              ${eventData}::jsonb
            )
          `;

          return updatedRows[0];
        },
      );

    return noStoreJson(
      {
        ok: true,

        question: {
          id:
            String(
              result.id,
            ),

          status:
            String(
              result.status,
            ),

          isPublic:
            Boolean(
              result.is_public,
            ),

          responsePublishedAt:
            result.response_published_at
              ? String(
                  result.response_published_at,
                )
              : null,

          updatedAt:
            String(
              result.updated_at,
            ),
        },
      },
      200,
    );
  }
  catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message ===
        "QUESTION_NOT_FOUND"
    ) {
      return noStoreJson(
        {
          ok: false,
          error:
            "Pergunta não encontrada.",
        },
        404,
      );
    }

    if (
      message ===
        "QUESTION_HIDDEN"
    ) {
      return noStoreJson(
        {
          ok: false,
          error:
            "Esta pergunta está indisponível.",
        },
        409,
      );
    }

    console.error(
      "Falha ao responder pergunta pública:",
      error,
    );

    return noStoreJson(
      {
        ok: false,
        error:
          "Não foi possível salvar a resposta.",
      },
      500,
    );
  }
}
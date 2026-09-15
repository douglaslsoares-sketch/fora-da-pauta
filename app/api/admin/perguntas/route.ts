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

export async function GET() {
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
    const response =
      NextResponse.json(
        {
          ok: false,
          error:
            "Acesso não autorizado.",
        },
        {
          status: 401,
        },
      );

    response.headers.set(
      "Cache-Control",
      "no-store",
    );

    return response;
  }

  try {
    const rows =
      await sql`
        SELECT
          id,
          input_type,
          raw_transcript,
          confirmed_text,
          status,
          response_text,
          is_public,
          response_published_at,
          created_at,
          updated_at

        FROM public_questions

        ORDER BY
          created_at DESC

        LIMIT 100
      `;

    const questions =
      rows.map(
        (row) => ({
          id:
            String(
              row.id,
            ),

          inputType:
            String(
              row.input_type,
            ),

          rawTranscript:
            row.raw_transcript
              ? String(
                  row.raw_transcript,
                )
              : null,

          confirmedText:
            String(
              row.confirmed_text,
            ),

          status:
            String(
              row.status,
            ),

          responseText:
            row.response_text
              ? String(
                  row.response_text,
                )
              : null,

          isPublic:
            Boolean(
              row.is_public,
            ),

          responsePublishedAt:
            row.response_published_at
              ? String(
                  row.response_published_at,
                )
              : null,

          createdAt:
            String(
              row.created_at,
            ),

          updatedAt:
            String(
              row.updated_at,
            ),
        }),
      );

    const response =
      NextResponse.json(
        {
          ok: true,
          questions,
        },
        {
          status: 200,
        },
      );

    response.headers.set(
      "Cache-Control",
      "no-store",
    );

    return response;
  }
  catch (error) {
    console.error(
      "Falha ao listar perguntas no painel:",
      error,
    );

    const response =
      NextResponse.json(
        {
          ok: false,
          error:
            "Não foi possível carregar as perguntas.",
        },
        {
          status: 500,
        },
      );

    response.headers.set(
      "Cache-Control",
      "no-store",
    );

    return response;
  }
}
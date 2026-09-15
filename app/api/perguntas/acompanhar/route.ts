import {
  createHash,
} from "node:crypto";

import { NextResponse } from "next/server";

import { sql } from "@/lib/interesses/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function trackingHash(
  token: string,
) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function GET(
  request: Request,
) {
  try {
    const url =
      new URL(request.url);

    const token =
      url.searchParams
        .get("token")
        ?.trim();

    if (
      !token ||
      token.length < 30 ||
      token.length > 100 ||
      !/^[A-Za-z0-9_-]+$/.test(token)
    ) {
      return NextResponse.json(
        {
          error:
            "Link de acompanhamento inválido.",
        },
        { status: 400 },
      );
    }

    const tokenHash =
      trackingHash(token);

    const rows = await sql`
      SELECT
        id,
        confirmed_text,
        status,
        response_text,
        is_public,
        response_published_at,
        created_at,
        updated_at
      FROM public_questions
      WHERE tracking_token_hash =
        ${tokenHash}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Pergunta não encontrada.",
        },
        { status: 404 },
      );
    }

    const row = rows[0];

    return NextResponse.json(
      {
        questionId:
          String(row.id),

        question:
          String(row.confirmed_text),

        status:
          String(row.status),

        answer:
          row.response_text
            ? String(row.response_text)
            : null,

        isPublic:
          Boolean(row.is_public),

        publishedAt:
          row.response_published_at,

        createdAt:
          row.created_at,

        updatedAt:
          row.updated_at,
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
      "Falha ao acompanhar pergunta:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível consultar a pergunta.",
      },
      { status: 500 },
    );
  }
}
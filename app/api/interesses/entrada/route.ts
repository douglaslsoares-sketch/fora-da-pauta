import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";

type InputRequest = {
  sessionId?: string;
  text?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    UUID_PATTERN.test(value)
  );
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json().catch(() => ({}))) as InputRequest;

    const sessionId = body.sessionId;
    const text = body.text?.trim();

    if (!validUuid(sessionId)) {
      return NextResponse.json(
        { error: "Sessão inválida." },
        { status: 400 },
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: "A resposta não pode estar vazia." },
        { status: 400 },
      );
    }

    if (text.length > 20000) {
      return NextResponse.json(
        { error: "A resposta excede o tamanho permitido." },
        { status: 400 },
      );
    }

    const result = await sql.begin(async (tx) => {
      const sessionRows = await tx`
        SELECT
          id,
          status
        FROM audit_sessions
        WHERE id = ${sessionId}::uuid
        FOR UPDATE
      `;

      if (sessionRows.length === 0) {
        throw new Error("SESSION_NOT_FOUND");
      }

      const session = sessionRows[0] as {
        id: string;
        status: string;
      };

      if (session.status !== "active") {
        throw new Error("SESSION_NOT_ACTIVE");
      }

      const inputRows = await tx`
        INSERT INTO user_inputs (
          session_id,
          input_type,
          transcript
        )
        VALUES (
          ${sessionId}::uuid,
          'text',
          ${text}
        )
        RETURNING
          id,
          session_id,
          input_type,
          transcript,
          created_at
      `;

      return inputRows[0] as {
        id: string;
        session_id: string;
        input_type: "text";
        transcript: string;
        created_at: string;
      };
    });

    return NextResponse.json(
      {
        inputId: result.id,
        sessionId: result.session_id,
        inputType: result.input_type,
        transcript: result.transcript,
        createdAt: result.created_at,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "UNKNOWN_ERROR";

    if (message === "SESSION_NOT_FOUND") {
      return NextResponse.json(
        { error: "Sessão não encontrada." },
        { status: 404 },
      );
    }

    if (message === "SESSION_NOT_ACTIVE") {
      return NextResponse.json(
        { error: "A sessão não está ativa." },
        { status: 409 },
      );
    }

    console.error(
      "Falha ao registrar entrada da Campanha de Interesses:",
      error,
    );

    return NextResponse.json(
      { error: "Não foi possível registrar a resposta." },
      { status: 500 },
    );
  }
}

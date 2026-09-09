import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";

type SessionRequest = {
  channel?: "text" | "voice";
  participantKey?: string;
};

function getParticipantSecret() {
  const secret = process.env.INTERESSES_PARTICIPANT_SECRET;

  if (!secret) {
    throw new Error(
      "INTERESSES_PARTICIPANT_SECRET não configurado.",
    );
  }

  return secret;
}

function hashParticipantKey(participantKey: string) {
  return createHmac("sha256", getParticipantSecret())
    .update(participantKey)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as SessionRequest;

    const channel = body.channel === "voice" ? "voice" : "text";

    const participantKey = body.participantKey?.trim();

    if (
      !participantKey ||
      participantKey.length < 20 ||
      participantKey.length > 200
    ) {
      return NextResponse.json(
        {
          error:
            "Identificador pseudonimizado do participante ausente ou inválido.",
        },
        { status: 400 },
      );
    }

    const participantKeyHash = hashParticipantKey(participantKey);

    const result = await sql.begin(async (tx) => {
      const participantRows = await tx`
        INSERT INTO pseudonymous_participants (
          participant_key_hash,
          last_seen_at
        )
        VALUES (
          ${participantKeyHash},
          now()
        )
        ON CONFLICT (participant_key_hash)
        DO UPDATE SET
          last_seen_at = now()
        RETURNING id
      `;

      const participant = participantRows[0] as {
        id: string;
      };

      const sessionRows = await tx`
        INSERT INTO audit_sessions (
          channel,
          participant_id
        )
        VALUES (
          ${channel},
          ${participant.id}::uuid
        )
        RETURNING
          id,
          created_at,
          channel,
          status
      `;

      return sessionRows[0] as {
        id: string;
        created_at: string;
        channel: "text" | "voice";
        status: string;
      };
    });

    return NextResponse.json(
      {
        sessionId: result.id,
        createdAt: result.created_at,
        channel: result.channel,
        status: result.status,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Falha ao criar sessão da Campanha de Interesses:",
      error,
    );

    return NextResponse.json(
      {
        error: "Não foi possível iniciar a sessão.",
      },
      { status: 500 },
    );
  }
}

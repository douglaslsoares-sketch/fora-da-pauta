import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import {
  QUESTIONS_ADMIN_COOKIE,
  verifyQuestionsAdminSessionToken,
} from "@/lib/questionsAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RegistroAudio = {
  audio: Uint8Array;
  mime_type: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = (await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value;
  if (!verifyQuestionsAdminSessionToken(token)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ erro: "Identificador inválido." }, { status: 400 });
  }
  try {
    const registros = await sql<RegistroAudio[]>`
      SELECT audio, mime_type FROM public.politicos_feedback_voz
      WHERE id = ${id}::uuid LIMIT 1
    `;
    const audio = registros[0];
    if (!audio) {
      return NextResponse.json({ erro: "Áudio não encontrado." }, { status: 404 });
    }
    const tipo = audio.mime_type;
    if (!["audio/webm", "audio/mp4", "audio/ogg"].includes(tipo)) {
      return NextResponse.json({ erro: "Formato inválido." }, { status: 500 });
    }
    const buffer = Buffer.from(audio.audio);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": tipo,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Accept-Ranges": "none",
      },
    });
  } catch (error) {
    console.error("Falha ao consultar áudio da avaliação:", error);
    return NextResponse.json({ erro: "Áudio temporariamente indisponível." }, { status: 503 });
  }
}

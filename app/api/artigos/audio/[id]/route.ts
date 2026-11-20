import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const store = await cookies();
  const admin = verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value);
  const { id } = await context.params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) return new Response("Não encontrado", { status: 404 });
  try {
    const rows = await sql<{ audio: Buffer; status: string; aprovado: boolean }[]>`
      SELECT audio, status, aprovado FROM public.admin_artigos_audio WHERE artigo_id = ${id}::uuid LIMIT 1
    `;
    const record = rows[0];
    if (!record || (!admin && (record.status !== "publicado" || !record.aprovado)))
      return new Response("Não encontrado", { status: 404 });
    const audio = record.audio;
    return new Response(new Uint8Array(audio), {
      headers: { "Content-Type": "audio/mpeg", "Content-Length": String(audio.length),
        "Cache-Control": admin ? "private, no-store" : "public, max-age=300",
        "X-Content-Type-Options": "nosniff" }
    });
  } catch {
    return NextResponse.json({ erro: "Áudio indisponível." }, { status: 503 });
  }
}

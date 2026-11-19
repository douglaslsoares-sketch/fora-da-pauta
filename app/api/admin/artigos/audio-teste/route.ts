import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const error = (message: string, status: number) =>
  NextResponse.json({ erro: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return error("Origem não autorizada.", 403);
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) return error("Acesso não autorizado.", 401);
  const limit = await consumeRateLimit({ request, scope: "admin:artigos:audio-teste", limit: 3, windowSeconds: 3600 });
  if (!limit.allowed) return error("Limite de testes de voz atingido. Tente mais tarde.", 429);
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  if (typeof body?.id !== "string" || !/^[a-f0-9-]{36}$/i.test(body.id)) return error("Artigo inválido.", 400);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return error("Serviço de narração não configurado.", 503);
  try {
    const rows = await sql<{ titulo: string; resumo: string; conteudo: string }[]>`
      SELECT titulo, resumo, conteudo FROM public.admin_artigos WHERE id = ${body.id}::uuid LIMIT 1
    `;
    const article = rows[0];
    if (!article) return error("Artigo não encontrado.", 404);
    const script = [article.titulo, article.resumo, article.conteudo].filter(Boolean).join("\n\n");
    if (!script.trim() || script.length > 3000) return error("O teste de voz aceita até 3.000 caracteres. O artigo completo exigirá geração em etapas.", 400);
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "marin",
        input: script,
        response_format: "mp3",
        instructions: "Leia em português brasileiro, com voz feminina natural, próxima e conversacional, sem teatralidade. Respeite as perguntas e faça pausas suaves entre título, resumo e parágrafos."
      }),
      signal: AbortSignal.timeout(55000)
    });
    if (!response.ok) return error("Não foi possível gerar o teste de voz. Tente novamente mais tarde.", 502);
    return new Response(response.body, { status: 200, headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, no-store", "Content-Disposition": "inline" } });
  } catch {
    return error("Falha temporária ao preparar o áudio.", 503);
  }
}

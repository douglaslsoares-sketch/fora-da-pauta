import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { ensureArticleAudioTable } from "@/lib/articleAudio";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const reply = (erro: string, status: number) => NextResponse.json({ erro }, { status, headers: { "Cache-Control": "no-store" } });
async function authorized() {
  const store = await cookies();
  return verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value);
}
export async function GET(request: Request) {
  if (!(await authorized())) return reply("Acesso negado.", 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) return reply("Artigo inválido.", 400);
  try {
    await ensureArticleAudioTable();
    const rows = await sql<{ aprovado: boolean; gerado_em: string }[]>`
      SELECT aprovado, gerado_em::text FROM public.admin_artigos_audio WHERE artigo_id = ${id}::uuid LIMIT 1
    `;
    return NextResponse.json({ existe: rows.length > 0, aprovado: rows[0]?.aprovado ?? false, gerado_em: rows[0]?.gerado_em ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch { return reply("Não foi possível consultar o áudio.", 503); }
}
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply("Origem não autorizada.", 403);
  if (!(await authorized())) return reply("Acesso negado.", 401);
  const body = await request.json().catch(() => null) as { id?: unknown; acao?: unknown } | null;
  const id = body?.id;
  if (typeof id !== "string" || !/^[a-f0-9-]{36}$/i.test(id)) return reply("Artigo inválido.", 400);
  if (body?.acao !== "gerar" && body?.acao !== "aprovar") return reply("Operação inválida.", 400);
  try {
    await ensureArticleAudioTable();
    if (body.acao === "aprovar") {
      const rows = await sql`
        UPDATE public.admin_artigos_audio SET aprovado = true, aprovado_em = now()
        WHERE artigo_id = ${id}::uuid AND NOT aprovado
          AND EXISTS (SELECT 1 FROM public.admin_artigos p WHERE p.id = artigo_id AND p.status = 'rascunho')
        RETURNING artigo_id
      `;
      return rows.length ? NextResponse.json({ ok: true, aprovado: true }) : reply("Nenhum áudio pendente de aprovação.", 409);
    }
    const limit = await consumeRateLimit({ request, scope: "admin:artigos:audio-completo", limit: 3, windowSeconds: 3600 });
    if (!limit.allowed) return reply("Limite de gerações atingido. Aguarde.", 429);
    const rows = await sql<{ titulo: string; resumo: string; conteudo: string; status: string }[]>`
      SELECT titulo, resumo, conteudo, status FROM public.admin_artigos WHERE id = ${id}::uuid LIMIT 1
    `;
    const article = rows[0];
    if (!article || article.status !== "rascunho") return reply("Somente rascunhos podem gerar narração.", 409);
    const script = [article.titulo, article.resumo, article.conteudo].filter(Boolean).join("\n\n");
    if (!script.trim() || script.length > 4000) return reply("A geração definitiva nesta etapa aceita até 4.000 caracteres. Para textos maiores, será necessário processamento em partes.", 400);
    const key = process.env.OPENAI_API_KEY;
    if (!key) return reply("Serviço de voz não configurado.", 503);
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: "marin", input: script, response_format: "mp3",
        instructions: "Leia em português brasileiro, com voz feminina natural e conversacional, respeitando a entonação de perguntas e pausas suaves entre parágrafos. Mantenha um timbre uniforme." }),
      signal: AbortSignal.timeout(50000)
    });
    if (!response.ok) return reply("O serviço não conseguiu gerar o áudio.", 502);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length || bytes.length > 8_000_000) return reply("Arquivo de áudio excedeu o limite permitido.", 502);
    const hex = Buffer.from(bytes).toString("hex");
    await sql`
      INSERT INTO public.admin_artigos_audio (artigo_id, audio, aprovado, aprovado_em)
      VALUES (${id}::uuid, decode(${hex}, 'hex'), false, null)
      ON CONFLICT (artigo_id) DO UPDATE SET audio = EXCLUDED.audio, aprovado = false, aprovado_em = null, gerado_em = now()
    `;
    return NextResponse.json({ ok: true, aprovado: false }, { headers: { "Cache-Control": "no-store" } });
  } catch { return reply("Falha ao processar a narração.", 503); }
}

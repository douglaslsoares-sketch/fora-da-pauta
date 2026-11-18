import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { sql } from "@/lib/interesses/db";

export const dynamic = "force-dynamic";

async function autorizado() {
  const store = await cookies();
  return verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value);
}
const semCache = { "Cache-Control": "no-store" };

export async function GET() {
  if (!(await autorizado())) return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: semCache });
  try {
    await sql`CREATE TABLE IF NOT EXISTS public.recados_site (
      id uuid PRIMARY KEY,
      destinatario text NOT NULL CHECK (destinatario IN ('projeto', 'comunidade')),
      texto text NOT NULL,
      status text NOT NULL DEFAULT 'recebido',
      criado_em timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`ALTER TABLE public.recados_site ADD COLUMN IF NOT EXISTS resposta_rascunho text`;
    await sql`ALTER TABLE public.recados_site ADD COLUMN IF NOT EXISTS resposta_publicada text`;
    await sql`ALTER TABLE public.recados_site ADD COLUMN IF NOT EXISTS resposta_publicada_em timestamptz`;
    const rows = await sql`SELECT id, destinatario, texto, status, criado_em, resposta_rascunho, resposta_publicada, resposta_publicada_em FROM public.recados_site ORDER BY criado_em DESC LIMIT 100`;
    return NextResponse.json({ recados: rows }, { headers: semCache });
  } catch (error) {
    console.error("Erro ao consultar recados:", error);
    return NextResponse.json({ erro: "Não foi possível carregar os recados." }, { status: 500, headers: semCache });
  }
}

export async function PATCH(request: Request) {
  if (!(await autorizado())) return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: semCache });
  const origin = request.headers.get("origin");
  if (!origin || (() => { try { return new URL(origin).origin !== new URL(request.url).origin; } catch { return true; } })()) {
    return NextResponse.json({ erro: "Origem inválida." }, { status: 403, headers: semCache });
  }
  let data: { id?: unknown; status?: unknown; resposta_rascunho?: unknown; publicar_resposta?: unknown };
  try { data = await request.json(); } catch { return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 }); }
  const id = typeof data.id === "string" ? data.id : "";
  const status = data.status;
  const temResposta = Object.prototype.hasOwnProperty.call(data, "resposta_rascunho");
  const temStatus = Object.prototype.hasOwnProperty.call(data, "status");
  const publicar = data.publicar_resposta === true;
  const temPublicar = Object.prototype.hasOwnProperty.call(data, "publicar_resposta");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ||
    (!temStatus && !temResposta && !publicar) ||
    (temPublicar && !publicar) ||
    (publicar && (temStatus || temResposta)) ||
    (temStatus && !["recebido", "em_analise", "respondido", "arquivado"].includes(String(status))) ||
    (temResposta && (typeof data.resposta_rascunho !== "string" || data.resposta_rascunho.length > 5000))) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }
  try {
    await sql`ALTER TABLE public.recados_site ADD COLUMN IF NOT EXISTS resposta_rascunho text`;
    await sql`ALTER TABLE public.recados_site ADD COLUMN IF NOT EXISTS resposta_publicada text`;
    await sql`ALTER TABLE public.recados_site ADD COLUMN IF NOT EXISTS resposta_publicada_em timestamptz`;
    const rows = publicar
      ? await sql`UPDATE public.recados_site SET resposta_publicada = resposta_rascunho, resposta_publicada_em = now(), status = 'respondido' WHERE id = ${id}::uuid AND length(trim(coalesce(resposta_rascunho, ''))) > 0 RETURNING id, status, resposta_rascunho, resposta_publicada, resposta_publicada_em`
      : temResposta
        ? await sql`UPDATE public.recados_site SET resposta_rascunho = ${data.resposta_rascunho as string} WHERE id = ${id}::uuid RETURNING id, status, resposta_rascunho, resposta_publicada, resposta_publicada_em`
        : await sql`UPDATE public.recados_site SET status = ${status as string} WHERE id = ${id}::uuid RETURNING id, status, resposta_rascunho, resposta_publicada, resposta_publicada_em`;
    if (!rows.length) return NextResponse.json({ erro: publicar ? "Salve um rascunho com texto antes de disponibilizar a resposta." : "Recado não encontrado." }, { status: publicar ? 400 : 404 });
    return NextResponse.json({ ok: true, recado: rows[0] }, { headers: semCache });
  } catch (error) {
    console.error("Erro ao atualizar recado:", error);
    return NextResponse.json({ erro: "Não foi possível atualizar o recado." }, { status: 500 });
  }
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return NextResponse.json({ erro: "Origem inválida." }, { status: 403 });
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) return NextResponse.json({ erro: "Acesso negado." }, { status: 401 });
  const body = await request.json().catch(() => null) as { id?: unknown; status?: unknown } | null;
  const id = typeof body?.id === "string" && /^[a-f0-9-]{36}$/i.test(body.id) ? body.id : null;
  const status = body?.status;
  if (!id || (status !== "revisao" && status !== "rascunho")) return NextResponse.json({ erro: "Solicitação inválida." }, { status: 400 });
  try {
    const rows = status === "revisao"
      ? await sql<{ id: string }[]>`
          UPDATE public.admin_artigos
          SET status = 'revisao', updated_at = now()
          WHERE id = ${id}::uuid AND status = 'rascunho'
            AND length(trim(titulo)) > 0 AND length(trim(conteudo)) > 0 AND length(trim(fontes)) > 0
          RETURNING id::text
        `
      : await sql<{ id: string }[]>`
          UPDATE public.admin_artigos
          SET status = 'rascunho', updated_at = now()
          WHERE id = ${id}::uuid AND status = 'revisao'
          RETURNING id::text
        `;
    if (!rows.length) return NextResponse.json({ erro: status === "revisao" ? "Inclua título, texto e fontes antes de enviar para revisão." : "Artigo indisponível para voltar a rascunho." }, { status: 409 });
    return NextResponse.json({ ok: true, status });
  } catch {
    return NextResponse.json({ erro: "Não foi possível alterar a situação do artigo." }, { status: 503 });
  }
}

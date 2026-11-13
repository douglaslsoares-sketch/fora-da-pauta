import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ erro: "Origem inválida." }, { status: 403 });
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) return NextResponse.json({ erro: "Acesso negado." }, { status: 401 });
  const body = await request.json().catch(() => null) as { id?: unknown; action?: unknown; confirmation?: unknown } | null;
  const id = typeof body?.id === "string" && /^[a-f0-9-]{36}$/i.test(body.id) ? body.id : null;
  const action = body?.action;
  const confirmation = action === "publicar" ? "PUBLICAR ARTIGO" : "ARQUIVAR ARTIGO";
  if (!id || (action !== "publicar" && action !== "arquivar") || body?.confirmation !== confirmation) return NextResponse.json({ erro: "Confirmação inválida." }, { status: 400 });
  try {
    const rows = action === "publicar"
      ? await sql<{ id: string }[]>`
          UPDATE public.admin_artigos
          SET status = 'publicado', updated_at = now()
          WHERE id = ${id}::uuid AND status = 'revisao'
            AND length(trim(titulo)) > 0 AND length(trim(conteudo)) > 0 AND length(trim(fontes)) > 0
          RETURNING id::text
        `
      : await sql<{ id: string }[]>`
          UPDATE public.admin_artigos
          SET status = 'arquivado', updated_at = now()
          WHERE id = ${id}::uuid AND status = 'publicado'
          RETURNING id::text
        `;
    if (!rows.length) return NextResponse.json({ erro: "Situação do artigo não permite esta operação." }, { status: 409 });
    return NextResponse.json({ ok: true, status: action === "publicar" ? "publicado" : "arquivado" });
  } catch {
    return NextResponse.json({ erro: "Não foi possível alterar a publicação." }, { status: 503 });
  }
}

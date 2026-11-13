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
  if (process.env.VERCEL_ENV === "preview") return NextResponse.json({ erro: "Gravações bloqueadas na prévia até configurar um banco de testes isolado." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: unknown; action?: unknown; confirmation?: unknown } | null;
  const id = typeof body?.id === "string" && /^[a-f0-9-]{36}$/i.test(body.id) ? body.id : null;
  const action = body?.action;
  const confirmation = action === "publicar" ? "PUBLICAR ARTIGO" : "ARQUIVAR ARTIGO";
  if (!id || (action !== "publicar" && action !== "arquivar") || body?.confirmation !== confirmation) return NextResponse.json({ erro: "Confirmação inválida." }, { status: 400 });
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS public.admin_artigos_historico (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        artigo_id uuid NOT NULL,
        acao text NOT NULL,
        registrado_em timestamptz NOT NULL DEFAULT now()
      )
    `;
    const rows = action === "publicar"
      ? await sql<{ id: string }[]>`
          WITH updated AS (
          UPDATE public.admin_artigos
          SET status = 'publicado', updated_at = now()
          WHERE id = ${id}::uuid AND status = 'revisao'
            AND length(trim(titulo)) > 0 AND length(trim(conteudo)) > 0 AND length(trim(fontes)) > 0
          RETURNING id
          )
          INSERT INTO public.admin_artigos_historico (artigo_id, acao)
          SELECT id, 'publicado' FROM updated RETURNING artigo_id::text AS id
        `
      : await sql<{ id: string }[]>`
          WITH updated AS (
          UPDATE public.admin_artigos
          SET status = 'arquivado', updated_at = now()
          WHERE id = ${id}::uuid AND status = 'publicado'
          RETURNING id
          )
          INSERT INTO public.admin_artigos_historico (artigo_id, acao)
          SELECT id, 'arquivado' FROM updated RETURNING artigo_id::text AS id
        `;
    if (!rows.length) return NextResponse.json({ erro: "Situação do artigo não permite esta operação." }, { status: 409 });
    return NextResponse.json({ ok: true, status: action === "publicar" ? "publicado" : "arquivado" });
  } catch {
    return NextResponse.json({ erro: "Não foi possível alterar a publicação." }, { status: 503 });
  }
}

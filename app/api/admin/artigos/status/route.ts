import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql, administrativeDatabaseWritesAllowed } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return NextResponse.json({ erro: "Origem inválida." }, { status: 403 });
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) return NextResponse.json({ erro: "Acesso negado." }, { status: 401 });
  if (!administrativeDatabaseWritesAllowed()) return NextResponse.json({ erro: "Gravações permitidas apenas na versão de testes com banco isolado." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: unknown; status?: unknown } | null;
  const id = typeof body?.id === "string" && /^[a-f0-9-]{36}$/i.test(body.id) ? body.id : null;
  const status = body?.status;
  if (!id || (status !== "revisao" && status !== "rascunho")) return NextResponse.json({ erro: "Solicitação inválida." }, { status: 400 });
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS public.admin_artigos_historico (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        artigo_id uuid NOT NULL,
        acao text NOT NULL,
        registrado_em timestamptz NOT NULL DEFAULT now()
      )
    `;
    const rows = status === "revisao"
      ? await sql<{ id: string }[]>`
          WITH updated AS (
          UPDATE public.admin_artigos
          SET status = 'revisao', updated_at = now()
          WHERE id = ${id}::uuid AND status = 'rascunho'
            AND length(trim(titulo)) > 0 AND length(trim(conteudo)) > 0 AND length(trim(fontes)) > 0
          RETURNING id
          )
          INSERT INTO public.admin_artigos_historico (artigo_id, acao)
          SELECT id, 'revisao' FROM updated RETURNING artigo_id::text AS id
        `
      : await sql<{ id: string }[]>`
          WITH updated AS (
          UPDATE public.admin_artigos
          SET status = 'rascunho', updated_at = now()
          WHERE id = ${id}::uuid AND status = 'revisao'
          RETURNING id
          )
          INSERT INTO public.admin_artigos_historico (artigo_id, acao)
          SELECT id, 'rascunho' FROM updated RETURNING artigo_id::text AS id
        `;
    if (!rows.length) return NextResponse.json({ erro: status === "revisao" ? "Inclua título, texto e fontes antes de enviar para revisão." : "Artigo indisponível para voltar a rascunho." }, { status: 409 });
    return NextResponse.json({ ok: true, status });
  } catch {
    return NextResponse.json({ erro: "Não foi possível alterar a situação do artigo." }, { status: 503 });
  }
}

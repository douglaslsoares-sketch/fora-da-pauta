import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ erro: "Origem inválida." }, { status: 403 });
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) return NextResponse.json({ erro: "Acesso negado." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (body?.confirmation !== "PREPARAR ESTRUTURA") return NextResponse.json({ erro: "Confirmação necessária." }, { status: 400 });
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS public.admin_artigos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        titulo text NOT NULL,
        resumo text NOT NULL DEFAULT '',
        conteudo text NOT NULL DEFAULT '',
        fontes text NOT NULL DEFAULT '',
        status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'revisao', 'publicado', 'arquivado')),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `;
    await sql`ALTER TABLE public.admin_artigos ADD COLUMN IF NOT EXISTS fontes text NOT NULL DEFAULT ''`;
    await sql`
      CREATE TABLE IF NOT EXISTS public.admin_artigos_historico (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        artigo_id uuid NOT NULL,
        acao text NOT NULL,
        registrado_em timestamptz NOT NULL DEFAULT now()
      )
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: "Não foi possível preparar as tabelas. Verifique as permissões do banco." }, { status: 503 });
  }
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) return NextResponse.json({ erro: "Acesso negado." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) return NextResponse.json({ erro: "Artigo inválido." }, { status: 400 });
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS public.admin_artigos_historico (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        artigo_id uuid NOT NULL,
        acao text NOT NULL,
        registrado_em timestamptz NOT NULL DEFAULT now()
      )
    `;
    const historico = await sql<{ acao: string; registrado_em: string }[]>`
      SELECT acao, registrado_em::text FROM public.admin_artigos_historico
      WHERE artigo_id = ${id}::uuid ORDER BY registrado_em DESC, id DESC LIMIT 100
    `;
    return NextResponse.json({ historico }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ erro: "Histórico indisponível." }, { status: 503 });
  }
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { hashSessao, tokenSessao } from "@/lib/telegram/sessao-site";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "Acesso não autorizado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const token = await tokenSessao();
  if (!token) {
    return NextResponse.json({ ok: true, vinculado: false, novasEdicoes: false }, { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const rows = await sql<{ vinculado: boolean; novas_edicoes: boolean }[]>`
      SELECT
        s.telegram_chat_id IS NOT NULL AS vinculado,
        EXISTS (
          SELECT 1 FROM public.telegram_preferencias p
          WHERE p.telegram_chat_id = s.telegram_chat_id
            AND p.tipo = 'novas_edicoes'
            AND p.status = 'ativo'
            AND p.cancelled_at IS NULL
        ) AS novas_edicoes
      FROM public.telegram_sessoes_site s
      WHERE s.sessao_hash = ${hashSessao(token)}
        AND s.expira_at > now()
      LIMIT 1
    `;
    return NextResponse.json({
      ok: true,
      vinculado: rows[0]?.vinculado === true,
      novasEdicoes: rows[0]?.novas_edicoes === true,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Não foi possível verificar o vínculo." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

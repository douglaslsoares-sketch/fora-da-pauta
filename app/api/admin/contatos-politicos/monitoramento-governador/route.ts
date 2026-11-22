import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }
  try {
    const rows = await sql`SELECT candidatura_id, nome_civil, uf, situacao,
      nome_oficial, email_institucional, fonte_url, fontes_conferidas, verificado_em
      FROM public.contatos_governadores_monitorados
      WHERE uf = 'PR' ORDER BY verificado_em DESC LIMIT 1`;
    return NextResponse.json({
      registro: rows[0] || null,
      contatoAprovado: false,
      envioHabilitado: false,
      observacao: "A consulta programada não aprova contatos nem envia recados. Reconhecimento depende de confirmação nas duas fontes oficiais.",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({
      registro: null,
      contatoAprovado: false,
      envioHabilitado: false,
      observacao: "O primeiro ciclo de monitoramento pode ainda não ter sido executado.",
    }, { headers: { "Cache-Control": "private, no-store" } });
  }
}

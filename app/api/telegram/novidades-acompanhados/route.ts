import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { tokenSessao, inscricaoAtiva, hashSessao } from "@/lib/telegram/sessao-site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const token = await tokenSessao();
  if (!token || !(await inscricaoAtiva(token))) {
    return NextResponse.json({ versao: null }, { headers: { "Cache-Control": "no-store" } });
  }
  const linhas = await sql<{ versao: string | null }[]>`
    SELECT MAX(f.updated_at)::text AS versao
    FROM public.telegram_fila_avisos f
    JOIN public.telegram_sessoes_site s ON s.telegram_chat_id = f.telegram_chat_id
    JOIN public.telegram_acompanhamentos a
      ON a.telegram_chat_id = f.telegram_chat_id
      AND a.candidatura_id = f.referencia
    WHERE s.sessao_hash = ${hashSessao(token)}
      AND s.expira_at > now()
      AND f.tipo = 'candidato'
      AND f.status = 'enviado'
      AND a.status = 'ativo'
      AND a.cancelled_at IS NULL
  `;
  return NextResponse.json({ versao: linhas[0]?.versao ?? null }, { headers: { "Cache-Control": "no-store" } });
}

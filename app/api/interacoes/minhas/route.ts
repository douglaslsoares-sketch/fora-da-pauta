import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { tokenSessao, hashSessao } from "@/lib/telegram/sessao-site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  if (process.env.FDP_INTERACOES_HABILITADAS !== "1") {
    return NextResponse.json({ erro: "Serviço em preparação." }, { status: 503, headers: noStore });
  }
  const token = await tokenSessao();
  if (!token) return NextResponse.json({ erro: "Conecte o Telegram para consultar." }, { status: 401, headers: noStore });

  const registros = await sql<{
    id: string; candidatura_id: string; categoria: string;
    mensagem: string; status: string; resposta_texto: string | null;
    resposta_autoria: string | null; created_at: string;
  }[]>`
    SELECT p.id::text AS id, p.candidatura_id, p.categoria, p.mensagem,
      p.status, p.resposta_texto, p.resposta_autoria, p.created_at
    FROM public.interacoes_politicas p
    JOIN public.telegram_sessoes_site s ON s.telegram_chat_id = p.telegram_chat_id
    WHERE s.sessao_hash = ${hashSessao(token)}
      AND s.expira_at > now()
    ORDER BY p.created_at DESC LIMIT 40
  `;
  // Apenas as próprias mensagens: nunca retornar identificador Telegram ou dados de outros usuários.
  return NextResponse.json({ registros }, { headers: noStore });
}

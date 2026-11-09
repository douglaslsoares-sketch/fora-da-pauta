import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { tokenSessao, hashSessao } from "@/lib/telegram/sessao-site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const token = await tokenSessao();
  if (!token) return NextResponse.json({vinculado:false,questions:[]},{headers:{"Cache-Control":"no-store"}});
  const sessao = await sql<{telegram_chat_id:string}[]>`
    SELECT telegram_chat_id::text AS telegram_chat_id
    FROM public.telegram_sessoes_site
    WHERE sessao_hash = ${hashSessao(token)} AND expira_at > now() AND telegram_chat_id IS NOT NULL
    LIMIT 1
  `;
  const chatId = sessao[0]?.telegram_chat_id;
  if (!chatId) return NextResponse.json({vinculado:false,questions:[]},{headers:{"Cache-Control":"no-store"}});
  const rows = await sql<{confirmed_text:string;created_at:string;status:string;tracking_token:string}[]>`
    SELECT q.confirmed_text, q.created_at, q.status,
      e.event_data->>'tracking_token' AS tracking_token
    FROM public.public_questions q
    JOIN public.public_question_events e ON e.question_id = q.id
    WHERE e.event_type = 'submitted'
      AND e.event_data->>'telegram_chat_id' = ${chatId}
      AND e.event_data->>'tracking_token' IS NOT NULL
    ORDER BY q.created_at DESC LIMIT 100
  `;
  return NextResponse.json({vinculado:true,questions:rows.map(r=>({
    pergunta:r.confirmed_text,criadaEm:r.created_at,status:r.status,
    path:"/pergunta/"+r.tracking_token
  }))},{headers:{"Cache-Control":"no-store"}});
}

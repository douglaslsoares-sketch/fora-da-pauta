import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { hashSessao, tokenSessao } from "@/lib/telegram/sessao-site";
import { consumeRateLimit } from "@/lib/rateLimit";
import { idsAcompanhaveis } from "@/lib/eleicoes/acompanhamento-politico";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categorias = new Set(["pergunta","discordancia","elogio","sugestao","cobranca"]);
const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (process.env.FDP_INTERACOES_HABILITADAS !== "1") {
    return NextResponse.json({ erro: "Interações ainda não estão disponíveis." }, { status: 503, headers: noStore });
  }
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ erro: "Origem inválida." }, { status: 403, headers: noStore });
  }
  const tamanho = Number(request.headers.get("content-length") ?? 0);
  if (tamanho > 8192) return NextResponse.json({ erro: "Mensagem muito grande." }, { status: 413, headers: noStore });
  const token = await tokenSessao();
  if (!token) return NextResponse.json({ erro: "Conecte o Telegram antes de enviar sua manifestação." }, { status: 401, headers: noStore });
  const body = await request.json().catch(() => null) as null | {
    candidaturaId?: unknown; categoria?: unknown; mensagem?: unknown;
    origemCaminho?: unknown; consentiu?: unknown;
  };
  const id = body?.candidaturaId;
  const categoria = body?.categoria;
  const mensagem = typeof body?.mensagem === "string" ? body.mensagem.trim() : "";
  const origem = typeof body?.origemCaminho === "string" ? body.origemCaminho : "";
  if (typeof id !== "string" || !idsAcompanhaveis.has(id) ||
      typeof categoria !== "string" || !categorias.has(categoria) ||
      mensagem.length < 15 || mensagem.length > 2000 ||
      body?.consentiu !== true ||
      !/^\/(?:pessoas|conheca-seu-candidato|campanhas)\/[A-Za-z0-9/_-]{1,200}$/.test(origem)) {
    return NextResponse.json({ erro: "Confira a manifestação e autorize o encaminhamento." }, { status: 400, headers: noStore });
  }
  const limite = await consumeRateLimit({ request, scope: "interacoes:enviar:1h", limit: 5, windowSeconds: 3600 });
  if (!limite.allowed) return NextResponse.json({ erro: "Limite de manifestações atingido. Tente mais tarde." }, { status: 429, headers: { ...noStore, "Retry-After": String(limite.retryAfterSeconds) } });
  const registro = await sql.begin(async tx => {
    const vinculos = await tx<{ telegram_chat_id: string }[]>`
      SELECT telegram_chat_id::text AS telegram_chat_id
      FROM public.telegram_sessoes_site
      WHERE sessao_hash = ${hashSessao(token)}
        AND expira_at > now() AND telegram_chat_id IS NOT NULL
      LIMIT 1
    `;
    const chatId = vinculos[0]?.telegram_chat_id;
    if (!chatId) return null;
    const rows = await tx<{ id: string }[]>`
      INSERT INTO public.interacoes_politicas
        (telegram_chat_id, candidatura_id, categoria, mensagem, contexto,
         origem_caminho, autorizacao_encaminhamento_at)
      VALUES
        (${chatId}::bigint, ${id}, ${categoria}, ${mensagem},
         ${origem.startsWith("/campanhas/") ? "materia" : "ficha"},
         ${origem}, now())
      RETURNING id::text AS id
    `;
    return rows[0]?.id ?? null;
  });
  if (!registro) return NextResponse.json({ erro: "Conecte o Telegram antes de enviar sua manifestação." }, { status: 401, headers: noStore });
  // Apenas registra recebimento. O encaminhamento precisa de triagem humana e canal validado.
  return NextResponse.json({ recebido: true, protocolo: registro, situacao: "Recebida pelo Fora da Pauta. Aguardando análise para encaminhamento." }, { status: 201, headers: noStore });
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { sql } from "@/lib/interesses/db";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const statuses = new Set(["em_analise","encaminhada","respondida","sem_resposta","nao_encaminhada"]);
async function autorizado() {
  const token = (await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value;
  return verifyQuestionsAdminSessionToken(token);
}
export async function GET() {
  if (!await autorizado()) return NextResponse.json({ erro: "Acesso restrito." }, { status: 401, headers: noStore });
  const registros = await sql`
    SELECT id::text, candidatura_id, categoria, mensagem, contexto, origem_caminho,
      status, destino_oficial, destino_fonte_url, encaminhada_at, resposta_texto,
      resposta_autoria, resposta_origem_verificada, resposta_confirmada_at,
      notificacao_status, created_at, updated_at
    FROM public.interacoes_politicas ORDER BY created_at DESC LIMIT 100
  `;
  // O identificador do chat e os dados de autenticação não são expostos ao painel.
  return NextResponse.json({ registros }, { headers: noStore });
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ erro: "Origem inválida." }, { status: 403, headers: noStore });
  }
  if (!await autorizado()) return NextResponse.json({ erro: "Acesso restrito." }, { status: 401, headers: noStore });
  if (Number(request.headers.get("content-length") ?? 0) > 8192) {
    return NextResponse.json({ erro: "Requisição muito grande." }, { status: 413, headers: noStore });
  }
  const limit = await consumeRateLimit({ request, scope: "admin:interacoes:10m", limit: 30, windowSeconds: 600 });
  if (!limit.allowed) return NextResponse.json({ erro: "Muitas operações." }, { status: 429, headers: noStore });
  const data = await request.json().catch(() => null) as null | {
    id?: unknown; status?: unknown; destinoOficial?: unknown; fonteOficial?: unknown;
    respostaTexto?: unknown; autoria?: unknown; origemResposta?: unknown; observacao?: unknown;
  };
  const id = data?.id, status = data?.status;
  if (typeof id !== "string" || !uuid.test(id) || typeof status !== "string" || !statuses.has(status)) {
    return NextResponse.json({ erro: "Manifestação ou situação inválida." }, { status: 400, headers: noStore });
  }
  const destino = typeof data?.destinoOficial === "string" ? data.destinoOficial.trim() : "";
  const fonte = typeof data?.fonteOficial === "string" ? data.fonteOficial.trim() : "";
  const resposta = typeof data?.respostaTexto === "string" ? data.respostaTexto.trim() : "";
  const autoria = typeof data?.autoria === "string" ? data.autoria : "";
  const origem = typeof data?.origemResposta === "string" ? data.origemResposta.trim() : "";
  const nota = typeof data?.observacao === "string" ? data.observacao.trim() : "";
  if (destino.length > 250 || fonte.length > 500 || resposta.length > 2400 ||
      origem.length > 500 || nota.length > 500 ||
      (fonte && !/^https:\/\//i.test(fonte)) ||
      (status === "encaminhada" && (!destino || !fonte)) ||
      (status === "respondida" && (!resposta || !origem || !["titular","assessoria","orgao"].includes(autoria)))) {
    return NextResponse.json({ erro: "Confira origem, canal e texto da resposta." }, { status: 400, headers: noStore });
  }
  const updated = await sql.begin(async tx => {
    const rows = await tx<{ status: string; resposta_texto: string | null }[]>`
      SELECT status, resposta_texto FROM public.interacoes_politicas
      WHERE id = ${id}::uuid FOR UPDATE
    `;
    const anterior = rows[0]?.status;
    if (!anterior) return "inexistente";
    if (anterior === "respondida") return "finalizada";
    if (status === "encaminhada" && !["recebida","em_analise"].includes(anterior)) return "transicao";
    if (status === "respondida" && anterior !== "encaminhada") return "transicao";
    if (status === "em_analise" && anterior !== "recebida") return "transicao";
    if (status === "sem_resposta" && anterior !== "encaminhada") return "transicao";
    if (status === "nao_encaminhada" && !["recebida","em_analise"].includes(anterior)) return "transicao";
    await tx`
      UPDATE public.interacoes_politicas
      SET status = ${status},
        destino_oficial = CASE WHEN ${status} = 'encaminhada' THEN ${destino} ELSE destino_oficial END,
        destino_fonte_url = CASE WHEN ${status} = 'encaminhada' THEN ${fonte} ELSE destino_fonte_url END,
        encaminhada_at = CASE WHEN ${status} = 'encaminhada' THEN now() ELSE encaminhada_at END,
        resposta_texto = CASE WHEN ${status} = 'respondida' THEN ${resposta} ELSE resposta_texto END,
        resposta_autoria = CASE WHEN ${status} = 'respondida' THEN ${autoria} ELSE resposta_autoria END,
        resposta_origem_verificada = CASE WHEN ${status} = 'respondida' THEN ${origem} ELSE resposta_origem_verificada END,
        resposta_confirmada_at = CASE WHEN ${status} = 'respondida' THEN now() ELSE resposta_confirmada_at END,
        notificacao_status = CASE WHEN ${status} = 'respondida' THEN 'pendente' ELSE notificacao_status END,
        updated_at = now()
      WHERE id = ${id}::uuid
    `;
    await tx`
      INSERT INTO public.interacoes_politicas_historico (interacao_id, evento, observacao)
      VALUES (${id}::uuid, ${status}, ${nota || null})
    `;
    return "ok";
  });
  return NextResponse.json(updated === "ok" ? { ok: true } : { erro: "Transição não permitida ou solicitação inexistente." }, {
    status: updated === "ok" ? 200 : 409, headers: noStore,
  });
}

import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { consumeRateLimit } from "@/lib/rateLimit";
import { participacaoNomeAberta, prepararParticipacaoNome } from "@/lib/participacaoNome";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const responder = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  return responder({ aberta: await participacaoNomeAberta() });
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return responder({ erro: "Origem não autorizada." }, 403);
  if (Number(request.headers.get("content-length") || 0) > 3000)
    return responder({ erro: "Mensagem muito longa." }, 413);

  const raw = await request.text();
  if (raw.length > 2500) return responder({ erro: "Mensagem muito longa." }, 413);
  let entrada: { nome?: unknown; justificativa?: unknown; website?: unknown };
  try { entrada = JSON.parse(raw); } catch { return responder({ erro: "Dados inválidos." }, 400); }
  if (entrada.website) return responder({ ok: true }, 201);
  const nome = typeof entrada.nome === "string" ? entrada.nome.trim().replace(/\s+/g, " ") : "";
  const justificativa = typeof entrada.justificativa === "string" ? entrada.justificativa.trim() : "";
  if (nome.length < 2 || nome.length > 60 || justificativa.length > 400)
    return responder({ erro: "Use de 2 a 60 caracteres no nome e até 400 na explicação." }, 400);

  try {
    if (!(await participacaoNomeAberta()))
      return responder({ erro: "A consulta ainda não foi aberta." }, 403);
    const limite = await consumeRateLimit({ request, scope: "participacao:nome", limit: 3, windowSeconds: 86400 });
    if (!limite.allowed) return responder({ erro: "Limite diário de sugestões atingido." }, 429);
    await prepararParticipacaoNome();
    // A validação da consulta é refeita no INSERT: um fechamento simultâneo prevalece.
    const rows = await sql<{ id: string }[]>`
      INSERT INTO public.participacao_nome_sugestoes (nome, justificativa)
      SELECT ${nome}, ${justificativa}
      WHERE EXISTS (SELECT 1 FROM public.participacao_nome_config WHERE id = 1 AND aberta = true)
      RETURNING id::text
    `;
    if (!rows.length) return responder({ erro: "A consulta foi encerrada." }, 403);
    return responder({ ok: true }, 201);
  } catch {
    return responder({ erro: "Não foi possível registrar a sugestão." }, 503);
  }
}

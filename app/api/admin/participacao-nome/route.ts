import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/interesses/db";
import { prepararParticipacaoNome, listarSugestoesNome } from "@/lib/participacaoNome";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const responder = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function autorizado() {
  return verifyQuestionsAdminSessionToken((await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await autorizado())) return responder({ erro: "Acesso negado." }, 401);
  try {
    await prepararParticipacaoNome();
    const result = await sql<{ aberta: boolean }[]>`
      SELECT aberta FROM public.participacao_nome_config WHERE id = 1
    `;
    return responder({
      aberta: result[0]?.aberta === true,
      sugestoes: await listarSugestoesNome(),
    });
  } catch {
    return responder({ erro: "Não foi possível consultar a participação." }, 503);
  }
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return responder({ erro: "Origem não autorizada." }, 403);
  if (!(await autorizado())) return responder({ erro: "Acesso negado." }, 401);
  const body = await request.json().catch(() => null) as { aberta?: unknown; confirmacao?: unknown } | null;
  if (typeof body?.aberta !== "boolean" || body.confirmacao !== (body.aberta ? "ABRIR CONSULTA" : "ENCERRAR CONSULTA"))
    return responder({ erro: "Confirmação inválida." }, 400);
  try {
    await prepararParticipacaoNome();
    await sql`
      UPDATE public.participacao_nome_config
      SET aberta = ${body.aberta}, atualizada_em = now()
      WHERE id = 1
    `;
    return responder({ ok: true, aberta: body.aberta });
  } catch {
    return responder({ erro: "Não foi possível alterar a consulta." }, 503);
  }
}

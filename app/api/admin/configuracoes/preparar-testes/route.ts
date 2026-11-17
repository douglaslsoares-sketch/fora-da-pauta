import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { administrativeDatabaseWritesAllowed } from "@/lib/interesses/db";
import { prepararEstruturaDeTestes } from "@/lib/admin/preparar-banco-testes";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ erro: "Origem inválida." }, { status: 403, headers });
  }
  const session = (await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value;
  if (!verifyQuestionsAdminSessionToken(session)) {
    return NextResponse.json({ erro: "Acesso administrativo necessário." }, { status: 401, headers });
  }
  if (process.env.VERCEL_ENV !== "preview" || !administrativeDatabaseWritesAllowed()) {
    return NextResponse.json({ erro: "Operação disponível apenas no banco isolado da ramificação de testes." }, { status: 403, headers });
  }
  if (Number(request.headers.get("content-length") ?? "0") > 512) {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 413, headers });
  }
  const body = await request.json().catch(() => null) as { confirmation?: unknown } | null;
  if (body?.confirmation !== "PREPARAR SOMENTE BANCO DE TESTES") {
    return NextResponse.json({ erro: "Confirmação obrigatória." }, { status: 400, headers });
  }
  try {
    const total = await prepararEstruturaDeTestes();
    if (total !== 14) {
      return NextResponse.json({ erro: "Estrutura incompleta; consulte o diagnóstico antes de testar." }, { status: 503, headers });
    }
    return NextResponse.json({ ok: true, tabelas: total }, { headers });
  } catch {
    // Não registrar credenciais nem consultas com parâmetros no log.
    console.error("Falha ao preparar a estrutura isolada de testes.");
    return NextResponse.json({ erro: "Falha na inicialização; nenhuma alteração foi feita na produção." }, { status: 503, headers });
  }
}

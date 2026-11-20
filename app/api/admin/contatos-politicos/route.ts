import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { consultarContatoParlamentar } from "@/lib/eleicoes/consultar-contato-parlamentar";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;
export async function GET(request: NextRequest) {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value))
    return NextResponse.json({ erro: "Acesso não autorizado." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !/^\d{8,20}$/.test(id))
    return NextResponse.json({ erro: "Identificador de candidatura inválido." }, { status: 400 });
  const pessoa = candidaturas.find(p => p.id === id);
  if (!pessoa) return NextResponse.json({ erro: "Candidatura não encontrada." }, { status: 404 });
  const limite = await consumeRateLimit({ request, scope: "admin:contatos-politicos:consulta", limit: 25, windowSeconds: 3600 });
  if (!limite.allowed) return NextResponse.json({ erro: "Limite de consultas atingido." }, { status: 429 });
  const resultado = await consultarContatoParlamentar(pessoa);
  return NextResponse.json({ candidatura: { id: pessoa.id, nomeUrna: pessoa.nomeUrna, nomeCompleto: pessoa.nomeCompleto, uf: pessoa.uf, cargo: pessoa.cargo }, resultado, consultadoEm: new Date().toISOString() }, { headers: { "Cache-Control": "private, no-store" } });
}

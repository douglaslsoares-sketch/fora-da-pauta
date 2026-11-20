import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 35;

type Fonte = { nome: string; ok: boolean; mensagem: string; consultadaEm: string };

async function camara(): Promise<Fonte> {
  const url = "https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1";
  const consultadaEm = new Date().toISOString();
  try {
    const response = await fetch(url, {
      cache: "no-store", headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(11000)
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const json: unknown = await response.json();
    if (!json || typeof json !== "object" || !("dados" in json) ||
      !Array.isArray(json.dados) || json.dados.length < 1 ||
      typeof json.dados[0]?.id !== "number" ||
      typeof json.dados[0]?.nome !== "string") throw new Error("Formato de dados inesperado");
    return { nome: "Câmara dos Deputados", ok: true, mensagem: "Conexão e formato dos dados confirmados.", consultadaEm };
  } catch {
    return { nome: "Câmara dos Deputados", ok: false, mensagem: "Falha na conexão ou no formato dos dados oficiais.", consultadaEm };
  }
}
async function senado(): Promise<Fonte> {
  const url = "https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json";
  const consultadaEm = new Date().toISOString();
  try {
    const response = await fetch(url, {
      cache: "no-store", headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(11000)
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const json = await response.json() as { ListaParlamentarEmExercicio?: {
      Parlamentares?: { Parlamentar?: unknown[] | Record<string, unknown> } } };
    const base = json?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar;
    const registros = Array.isArray(base) ? base : base ? [base] : [];
    if (!registros.length || !registros.some(item => !!item &&
      typeof item === "object" && "IdentificacaoParlamentar" in item))
      throw new Error("Formato de dados inesperado");
    return { nome: "Senado Federal", ok: true, mensagem: "Conexão e formato dos dados confirmados.", consultadaEm };
  } catch {
    return { nome: "Senado Federal", ok: false, mensagem: "Falha na conexão ou no formato dos dados oficiais.", consultadaEm };
  }
}
export async function GET(request: Request) {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value))
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const limite = await consumeRateLimit({ request, scope: "admin:contatos-politicos:diagnostico", limit: 8, windowSeconds: 3600 });
  if (!limite.allowed) return NextResponse.json({ erro: "Limite de verificações atingido." }, { status: 429, headers: { "Cache-Control": "no-store" } });
  const fontes = await Promise.all([camara(), senado()]);
  return NextResponse.json({
    fontes,
    observacao: "O teste verifica somente acesso e formato das fontes. Não valida o contato individual de nenhum político, não habilita envio e não transmite mensagens."
  }, { headers: { "Cache-Control": "private, no-store" } });
}

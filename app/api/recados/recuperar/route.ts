import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { sql } from "@/lib/interesses/db";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = "fdp_recados_autor";
const noStore = { "Cache-Control": "no-store" };
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const valido = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
function mesmaOrigem(request: Request) {
  const origem = request.headers.get("origin");
  try { return !!origem && new URL(origem).origin === new URL(request.url).origin; } catch { return false; }
}
async function preparar() {
  await sql`CREATE TABLE IF NOT EXISTS public.recados_recuperacao (
    autor_hash text PRIMARY KEY,
    chave_hash text UNIQUE NOT NULL,
    autor_token text NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now()
  )`;
}
export async function POST(request: Request) {
  if (!mesmaOrigem(request)) return NextResponse.json({ erro: "Origem não autorizada." }, { status: 403, headers: noStore });
  const limite = await consumeRateLimit({ request, scope: "recados:recuperacao:criar", limit: 3, windowSeconds: 3600 });
  if (!limite.allowed) return NextResponse.json({ erro: "Aguarde antes de gerar outra chave." }, { status: 429, headers: noStore });
  const token = (await cookies()).get(COOKIE)?.value;
  if (!valido(token)) return NextResponse.json({ erro: "Nenhum histórico associado a este navegador." }, { status: 400, headers: noStore });
  try {
    await preparar();
    const autorHash = hash(token);
    const existente = await sql`SELECT 1 FROM public.recados_site WHERE autor_hash = ${autorHash} LIMIT 1`;
    if (!existente.length) return NextResponse.json({ erro: "Envie um recado antes de criar uma chave de recuperação." }, { status: 400, headers: noStore });
    const chave = randomBytes(32).toString("hex").toUpperCase();
    await sql`INSERT INTO public.recados_recuperacao (autor_hash, chave_hash, autor_token)
      VALUES (${autorHash}, ${hash(chave)}, ${token})
      ON CONFLICT (autor_hash) DO UPDATE SET chave_hash = EXCLUDED.chave_hash, autor_token = EXCLUDED.autor_token, criado_em = now()`;
    return NextResponse.json({ chave }, { headers: noStore });
  } catch (error) {
    console.error("Falha ao criar recuperação:", error);
    return NextResponse.json({ erro: "Não foi possível gerar a chave." }, { status: 500, headers: noStore });
  }
}
export async function PUT(request: Request) {
  if (!mesmaOrigem(request)) return NextResponse.json({ erro: "Origem não autorizada." }, { status: 403, headers: noStore });
  const limite = await consumeRateLimit({ request, scope: "recados:recuperacao:usar", limit: 5, windowSeconds: 3600 });
  if (!limite.allowed) return NextResponse.json({ erro: "Muitas tentativas. Aguarde antes de tentar novamente." }, { status: 429, headers: noStore });
  let dados: { chave?: unknown };
  try { dados = await request.json(); } catch { return NextResponse.json({ erro: "Dados inválidos." }, { status: 400, headers: noStore }); }
  const chave = typeof dados.chave === "string" ? dados.chave.replace(/[\s-]/g, "").toUpperCase() : "";
  if (!/^[A-F0-9]{64}$/.test(chave)) return NextResponse.json({ erro: "Informe a chave completa de recuperação." }, { status: 400, headers: noStore });
  try {
    await preparar();
    const rows = await sql`SELECT autor_token FROM public.recados_recuperacao WHERE chave_hash = ${hash(chave)} LIMIT 1`;
    const token = rows[0]?.autor_token;
    if (!valido(token)) return NextResponse.json({ erro: "Chave de recuperação inválida." }, { status: 400, headers: noStore });
    const response = NextResponse.json({ ok: true }, { headers: noStore });
    response.cookies.set({ name: COOKIE, value: token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  } catch (error) {
    console.error("Falha ao recuperar histórico:", error);
    return NextResponse.json({ erro: "Não foi possível recuperar o histórico." }, { status: 500, headers: noStore });
  }
}

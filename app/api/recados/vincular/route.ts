import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { sql } from "@/lib/interesses/db";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = "fdp_recados_autor";
const semCache = { "Cache-Control": "no-store" };
const hash = (v: string) => createHash("sha256").update(v).digest("hex");
const valido = (v: string | undefined): v is string => !!v && /^[a-f0-9]{64}$/.test(v);
async function preparar() {
  await sql`CREATE TABLE IF NOT EXISTS public.recados_vinculos (
    codigo_hash text PRIMARY KEY,
    autor_token text NOT NULL,
    expira_em timestamptz NOT NULL,
    usado_em timestamptz
  )`;
}
function mesmaOrigem(request: Request) {
  const origin = request.headers.get("origin");
  try { return !!origin && new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}
export async function POST(request: Request) {
  if (!mesmaOrigem(request)) return NextResponse.json({ erro: "Origem inválida." }, { status: 403, headers: semCache });
  const limite = await consumeRateLimit({ request, scope: "recados:vincular:criar", limit: 5, windowSeconds: 3600 });
  if (!limite.allowed) return NextResponse.json({ erro: "Aguarde antes de gerar outro código." }, { status: 429, headers: semCache });
  const token = (await cookies()).get(COOKIE)?.value;
  if (!valido(token)) return NextResponse.json({ erro: "Este navegador ainda não possui um histórico para vincular." }, { status: 400, headers: semCache });
  try {
    await preparar();
    const codigo = randomBytes(12).toString("hex").toUpperCase();
    await sql`INSERT INTO public.recados_vinculos (codigo_hash, autor_token, expira_em) VALUES (${hash(codigo)}, ${token}, now() + interval '10 minutes')`;
    return NextResponse.json({ codigo, validade_minutos: 10 }, { headers: semCache });
  } catch (error) {
    console.error("Falha ao gerar vínculo de recados:", error);
    return NextResponse.json({ erro: "Não foi possível gerar o código." }, { status: 500, headers: semCache });
  }
}
export async function PUT(request: Request) {
  if (!mesmaOrigem(request)) return NextResponse.json({ erro: "Origem inválida." }, { status: 403, headers: semCache });
  const limite = await consumeRateLimit({ request, scope: "recados:vincular:usar", limit: 5, windowSeconds: 3600 });
  if (!limite.allowed) return NextResponse.json({ erro: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429, headers: semCache });
  let dados: { codigo?: unknown };
  try { dados = await request.json(); } catch { return NextResponse.json({ erro: "Código inválido." }, { status: 400, headers: semCache }); }
  const codigo = typeof dados.codigo === "string" ? dados.codigo.replace(/[\s-]/g, "").toUpperCase() : "";
  if (!/^[A-F0-9]{24}$/.test(codigo)) return NextResponse.json({ erro: "Informe o código de 24 caracteres." }, { status: 400, headers: semCache });
  try {
    await preparar();
    const rows = await sql`UPDATE public.recados_vinculos SET usado_em = now() WHERE codigo_hash = ${hash(codigo)} AND usado_em IS NULL AND expira_em > now() RETURNING autor_token`;
    const token = rows[0]?.autor_token;
    if (!valido(token)) return NextResponse.json({ erro: "Código expirado, inválido ou já utilizado." }, { status: 400, headers: semCache });
    const response = NextResponse.json({ ok: true }, { headers: semCache });
    response.cookies.set({ name: COOKIE, value: token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  } catch (error) {
    console.error("Falha ao vincular histórico:", error);
    return NextResponse.json({ erro: "Não foi possível vincular o histórico." }, { status: 500, headers: semCache });
  }
}

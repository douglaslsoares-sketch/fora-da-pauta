import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { idsAcompanhaveis } from "@/lib/eleicoes/acompanhamento-politico";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "fdp_visitante_v1";
const DIAS = 180;
const HEADERS = { "Cache-Control": "no-store" };
const TOKEN_VALIDO = /^[A-Za-z0-9_-]{43}$/;
const ID_VALIDO = /^[0-9]{8,20}$/;

function hash(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

async function tokenAtual() {
  const token = (await cookies()).get(COOKIE)?.value;
  return token && TOKEN_VALIDO.test(token) ? token : null;
}

function origemValida(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

function erroIndisponivel() {
  return NextResponse.json(
    { erro: "Acompanhamento temporariamente indisponível." },
    { status: 503, headers: HEADERS },
  );
}

async function visitante(token: string) {
  const linhas = await sql<{ id: string }[]>`
    SELECT id::text AS id FROM public.site_visitantes
    WHERE sessao_hash = ${hash(token)} LIMIT 1
  `;
  return linhas[0]?.id ?? null;
}

export async function GET() {
  try {
    let token = await tokenAtual();
    if (!token) token = randomBytes(32).toString("base64url");
    const sessaoHash = hash(token);
    const id = randomUUID();
    const linhas = await sql<{ id: string }[]>`
      INSERT INTO public.site_visitantes (id, sessao_hash)
      VALUES (${id}::uuid, ${sessaoHash})
      ON CONFLICT (sessao_hash) DO UPDATE SET atualizado_em = now()
      RETURNING id::text AS id
    `;
    const acompanhamentos = await sql<{ candidatura_id: string }[]>`
      SELECT candidatura_id FROM public.site_acompanhamentos
      WHERE visitante_id = ${linhas[0].id}::uuid ORDER BY criado_em
      LIMIT 100
    `;
    const resposta = NextResponse.json(
      { ids: acompanhamentos.map(p => p.candidatura_id) },
      { headers: HEADERS },
    );
    resposta.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DIAS * 86400,
    });
    return resposta;
  } catch (error) {
    console.error("Falha ao consultar acompanhamentos do site:", error);
    return erroIndisponivel();
  }
}

async function alterar(request: Request, remover: boolean) {
  if (!origemValida(request)) {
    return NextResponse.json({ erro: "Origem inválida." }, { status: 403, headers: HEADERS });
  }
  const limite = await consumeRateLimit({
    request, scope: "site:acompanhamentos", limit: 30, windowSeconds: 600,
  });
  if (!limite.allowed) {
    return NextResponse.json({ erro: "Muitas tentativas. Aguarde alguns minutos." }, {
      status: 429,
      headers: { ...HEADERS, "Retry-After": String(limite.retryAfterSeconds) },
    });
  }
  const token = await tokenAtual();
  if (!token) {
    return NextResponse.json({ erro: "Abra novamente a lista de acompanhamento." }, {
      status: 401, headers: HEADERS,
    });
  }
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  const id = body?.id;
  if (typeof id !== "string" || !ID_VALIDO.test(id) || (!remover && !idsAcompanhaveis.has(id))) {
    return NextResponse.json({ erro: "Político não encontrado." }, { status: 400, headers: HEADERS });
  }
  try {
    const visitanteId = await visitante(token);
    if (!visitanteId) {
      return NextResponse.json({ erro: "Sessão não encontrada." }, { status: 401, headers: HEADERS });
    }
    if (remover) {
      await sql`
        DELETE FROM public.site_acompanhamentos
        WHERE visitante_id = ${visitanteId}::uuid AND candidatura_id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO public.site_acompanhamentos (visitante_id, candidatura_id)
        VALUES (${visitanteId}::uuid, ${id})
        ON CONFLICT (visitante_id, candidatura_id) DO NOTHING
      `;
    }
    return NextResponse.json({ salvo: true }, { headers: HEADERS });
  } catch (error) {
    console.error("Falha ao alterar acompanhamento do site:", error);
    return erroIndisponivel();
  }
}

export async function POST(request: Request) {
  return alterar(request, false);
}

export async function DELETE(request: Request) {
  return alterar(request, true);
}

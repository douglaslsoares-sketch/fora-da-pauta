import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ erro: "Origem inválida." }, { status: 403 });
  }
  const token = (await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value;
  if (!verifyQuestionsAdminSessionToken(token)) {
    return NextResponse.json({ erro: "Acesso administrativo necessário." }, { status: 401 });
  }
  const limite = await consumeRateLimit({
    request, scope: "admin:criar-tabelas-acompanhamento", limit: 3, windowSeconds: 3600,
  });
  if (!limite.allowed) {
    return NextResponse.json({ erro: "Limite de tentativas atingido." }, { status: 429 });
  }
  try {
    await sql.begin(async tx => {
      await tx`
        CREATE TABLE IF NOT EXISTS public.site_visitantes (
          id uuid PRIMARY KEY,
          sessao_hash text NOT NULL UNIQUE,
          criado_em timestamptz NOT NULL DEFAULT now(),
          atualizado_em timestamptz NOT NULL DEFAULT now()
        )
      `;
      await tx`
        CREATE TABLE IF NOT EXISTS public.site_acompanhamentos (
          visitante_id uuid NOT NULL REFERENCES public.site_visitantes(id) ON DELETE CASCADE,
          candidatura_id text NOT NULL,
          criado_em timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY (visitante_id, candidatura_id)
        )
      `;
      await tx`
        CREATE INDEX IF NOT EXISTS site_acompanhamentos_candidatura_idx
        ON public.site_acompanhamentos(candidatura_id)
      `;
    });
    return NextResponse.json({ criado: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Falha na criação de tabelas de acompanhamento:", error);
    return NextResponse.json({ erro: "Não foi possível criar as tabelas. Consulte os registros do servidor." }, { status: 500 });
  }
}

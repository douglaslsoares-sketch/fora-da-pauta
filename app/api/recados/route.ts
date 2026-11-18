import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/interesses/db";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || (() => { try { return new URL(origin).origin !== new URL(request.url).origin; } catch { return true; } })()) {
    return NextResponse.json({ erro: "Origem não permitida." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") || 0) > 12000) {
    return NextResponse.json({ erro: "Mensagem muito grande." }, { status: 413 });
  }
  const body = await request.text();
  if (body.length > 10000) return NextResponse.json({ erro: "Mensagem muito grande." }, { status: 413 });
  let dados: { destinatario?: unknown; texto?: unknown };
  try { dados = JSON.parse(body); } catch { return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 }); }
  const destino = dados.destinatario;
  const texto = typeof dados.texto === "string" ? dados.texto.trim() : "";
  if ((destino !== "projeto" && destino !== "comunidade") || !texto || texto.length > 2000) {
    return NextResponse.json({ erro: "Informe um destinatário e uma mensagem de até 2.000 caracteres." }, { status: 400 });
  }
  try {
    const limite = await consumeRateLimit({ request, scope: "recados:enviar:hora", limit: 5, windowSeconds: 3600 });
    if (!limite.allowed) return NextResponse.json({ erro: "Limite de mensagens atingido. Tente novamente mais tarde." }, { status: 429 });
    // Criação idempotente para instalações que ainda não executaram a migração.
    await sql`CREATE TABLE IF NOT EXISTS public.recados_site (
      id uuid PRIMARY KEY,
      destinatario text NOT NULL CHECK (destinatario IN ('projeto', 'comunidade')),
      texto text NOT NULL,
      status text NOT NULL DEFAULT 'recebido',
      criado_em timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`ALTER TABLE public.recados_site ADD COLUMN IF NOT EXISTS resposta_rascunho text`;
    await sql`ALTER TABLE public.recados_site ADD COLUMN IF NOT EXISTS resposta_publicada text`;
    await sql`ALTER TABLE public.recados_site ADD COLUMN IF NOT EXISTS resposta_publicada_em timestamptz`;
    const id = randomUUID();
    await sql`INSERT INTO public.recados_site (id, destinatario, texto) VALUES (${id}::uuid, ${destino as string}, ${texto})`;
    return NextResponse.json({ ok: true, protocolo: id, estado: "recebido" }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Falha ao registrar recado:", error);
    return NextResponse.json({ erro: "Não foi possível registrar o recado. Tente novamente." }, { status: 500 });
  }
}

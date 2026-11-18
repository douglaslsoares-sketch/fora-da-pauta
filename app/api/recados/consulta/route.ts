import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || (() => { try { return new URL(origin).origin !== new URL(request.url).origin; } catch { return true; } })()) {
    return NextResponse.json({ erro: "Origem não permitida." }, { status: 403, headers: noStore });
  }
  try {
    const limite = await consumeRateLimit({ request, scope: "recados:consulta:hora", limit: 15, windowSeconds: 3600 });
    if (!limite.allowed) return NextResponse.json({ erro: "Muitas consultas. Tente mais tarde." }, { status: 429, headers: noStore });
    const data = await request.json();
    const protocolo = typeof data?.protocolo === "string" ? data.protocolo.trim() : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(protocolo)) {
      return NextResponse.json({ erro: "Informe um protocolo válido." }, { status: 400, headers: noStore });
    }
    await sql`ALTER TABLE public.recados_site ADD COLUMN IF NOT EXISTS resposta_publicada text`;
    await sql`ALTER TABLE public.recados_site ADD COLUMN IF NOT EXISTS resposta_publicada_em timestamptz`;
    const rows = await sql`SELECT status, resposta_publicada, resposta_publicada_em FROM public.recados_site WHERE id = ${protocolo}::uuid LIMIT 1`;
    if (!rows.length) return NextResponse.json({ erro: "Protocolo não encontrado." }, { status: 404, headers: noStore });
    return NextResponse.json({ status: rows[0].status, resposta: rows[0].resposta_publicada, respondido_em: rows[0].resposta_publicada_em }, { headers: noStore });
  } catch (error) {
    console.error("Falha na consulta de recado:", error);
    return NextResponse.json({ erro: "Não foi possível consultar agora." }, { status: 500, headers: noStore });
  }
}

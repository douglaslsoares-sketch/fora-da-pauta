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
  if (Number(request.headers.get("content-length") || 0) > 1024) {
    return NextResponse.json({ erro: "Consulta muito grande." }, { status: 413, headers: noStore });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ erro: "Formato inválido." }, { status: 415, headers: noStore });
  }
  try {
    const limite = await consumeRateLimit({ request, scope: "recados:consulta:hora", limit: 15, windowSeconds: 3600 });
    if (!limite.allowed) return NextResponse.json({ erro: "Muitas consultas. Tente mais tarde." }, { status: 429, headers: noStore });
    const body = await request.text();
    if (body.length > 1024) return NextResponse.json({ erro: "Consulta muito grande." }, { status: 413, headers: noStore });
    let data: { protocolo?: unknown };
    try { data = JSON.parse(body); } catch { return NextResponse.json({ erro: "Dados inválidos." }, { status: 400, headers: noStore }); }
    const protocolo = typeof data?.protocolo === "string" ? data.protocolo.trim() : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(protocolo)) {
      return NextResponse.json({ erro: "Informe um protocolo válido." }, { status: 400, headers: noStore });
    }
    const rows = await sql`SELECT status, resposta_publicada, resposta_publicada_em FROM public.recados_site WHERE id = ${protocolo}::uuid LIMIT 1`;
    if (!rows.length) return NextResponse.json({ erro: "Protocolo não encontrado." }, { status: 404, headers: noStore });
    return NextResponse.json({ status: rows[0].status, resposta: rows[0].resposta_publicada, respondido_em: rows[0].resposta_publicada_em }, { headers: noStore });
  } catch (error) {
    console.error("Falha na consulta de recado:", error);
    return NextResponse.json({ erro: "Não foi possível consultar agora." }, { status: 500, headers: noStore });
  }
}

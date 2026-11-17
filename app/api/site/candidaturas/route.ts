import { NextRequest, NextResponse } from "next/server";
import { candidaturas } from "@/data/eleicoes/candidaturas";
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") || "").split(",").filter(id => /^\d{8,20}$/.test(id)).slice(0,100);
  const procurados = new Set(ids);
  const pessoas = candidaturas.filter(p => procurados.has(p.id)).map(p => ({ id: p.id, nomeUrna: p.nomeUrna }));
  return NextResponse.json({ pessoas }, { headers: { "Cache-Control": "no-store" } });
}

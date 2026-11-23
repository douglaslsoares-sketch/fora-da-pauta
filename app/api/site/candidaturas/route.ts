import { NextRequest, NextResponse } from "next/server";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") || "").split(",").filter(id => /^\d{8,20}$/.test(id)).slice(0,100);
  const procurados = new Set(ids);
  const pessoas = candidaturas.filter(p => procurados.has(p.id)).map(p => ({
    id: p.id,
    nomeUrna: p.nomeUrna,
    cargoLabel: formatarCargo(p.cargo),
    siglaPartido: p.siglaPartido,
    uf: p.uf,
  }));
  return NextResponse.json({ pessoas }, { headers: { "Cache-Control": "no-store" } });
}

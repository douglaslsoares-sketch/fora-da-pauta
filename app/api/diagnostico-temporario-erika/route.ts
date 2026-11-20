import { NextResponse } from "next/server";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { consultarContatoParlamentar } from "@/lib/eleicoes/consultar-contato-parlamentar";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

export async function GET(request: Request) {
  // Diagnóstico temporário de uma única identidade pública (sem dados de contato).
  const limite = await consumeRateLimit({
    request, scope: "contatos:qa-erika:temporario", limit: 5, windowSeconds: 3600
  });
  if (!limite.allowed) return NextResponse.json({ erro: "Limite de consultas." }, { status: 429 });
  const pessoa = candidaturas.find(item => item.id === "250002539612");
  if (!pessoa) return NextResponse.json({ erro: "Candidatura de teste não encontrada." }, { status: 404 });
  const resultado = await consultarContatoParlamentar(pessoa);
  return NextResponse.json({
    nomeUrna: pessoa.nomeUrna,
    cargo: pessoa.cargo, uf: pessoa.uf,
    resultado: resultado.situacao,
    possuiContatoInstitucional: resultado.situacao === "encontrado",
    fonteInstitucional: resultado.fonteUrl,
    motivo: resultado.situacao !== "encontrado" ? resultado.motivo : undefined,
    envioHabilitado: false
  }, { headers: { "Cache-Control": "no-store" } });
}

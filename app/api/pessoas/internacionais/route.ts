import { NextRequest, NextResponse } from "next/server";
import registros from "@/data/pessoas/pessoas-internacionais.json";
import type { PessoaPoliticaInternacional } from "@/data/pessoas/modelo-pessoa-politica";

function normalizar(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

/** Busca somente identidades documentadas; nunca infere identidade por nome. */
export async function GET(request: NextRequest) {
  const termo = normalizar(new URL(request.url).searchParams.get("nome") ?? "");
  if (termo.length < 2) return NextResponse.json({ resultados: [], total: 0 });
  const resultados = (registros as PessoaPoliticaInternacional[])
    .filter(p => p.situacaoIdentidade === "CONFIRMADA")
    .filter(p => normalizar(p.nomePublico).includes(termo) || normalizar(p.nomeCompleto ?? "").includes(termo))
    .sort((a,b) => a.nomePublico.localeCompare(b.nomePublico,"pt-BR"))
    .slice(0,40)
    .map(p => ({
      pessoaPoliticaId: p.pessoaPoliticaId,
      nomePublico: p.nomePublico,
      paises: p.paises,
      url: `/pessoa/${p.pessoaPoliticaId}`,
    }));
  return NextResponse.json({ resultados, total: resultados.length });
}

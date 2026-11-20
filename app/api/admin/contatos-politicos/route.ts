import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { consultarContatoParlamentar } from "@/lib/eleicoes/consultar-contato-parlamentar";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";
import { idsEleitosEm2026 } from "@/lib/eleicoes/acompanhamento-politico";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;
export async function GET(request: NextRequest) {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value))
    return NextResponse.json({ erro: "Acesso não autorizado." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !/^\d{8,20}$/.test(id))
    return NextResponse.json({ erro: "Identificador de candidatura inválido." }, { status: 400 });
  const pessoa = candidaturas.find(p => p.id === id);
  if (!pessoa) return NextResponse.json({ erro: "Candidatura não encontrada." }, { status: 404 });
  const limite = await consumeRateLimit({ request, scope: "admin:contatos-politicos:consulta", limit: 25, windowSeconds: 3600 });
  if (!limite.allowed) return NextResponse.json({ erro: "Limite de consultas atingido." }, { status: 429 });
  const resultado = await consultarContatoParlamentar(pessoa);
  // O resultado eleitoral de 2026 não comprova exercício de mandato
  // na legislatura atual. Contextualizar apenas enquanto a posse não ocorreu
  // e quando não foi localizado contato federal em exercício.
  const aguardaNovaLegislatura = (pessoa.cargo === "deputado-federal" || pessoa.cargo === "senador")
    && idsEleitosEm2026.has(pessoa.id)
    && Date.now() < new Date("2027-02-01T00:00:00-03:00").getTime()
    && resultado.situacao !== "encontrado";
  const contextoMandato = aguardaNovaLegislatura ? {
    titulo: "Eleito em 2026 — novo mandato ainda não iniciado",
    explicacao: "A posse dos parlamentares federais eleitos em 2026 será em 1º de fevereiro de 2027. A pesquisa na Câmara ou no Senado verifica quem já exerce mandato federal, e não todos os eleitos para a próxima legislatura. Esta informação não exclui outro mandato em exercício.",
    fontePosse: "https://especial.camara.leg.br/posse2027/preparo-para-a-nova-legislatura/",
    ...(pessoa.id === "160002536522" ? {
      cargoAtual: "O cadastro da Assembleia Legislativa do Paraná apresenta Renato Freitas como deputado estadual e publica o contato de seu gabinete. Este contato estadual não foi aprovado automaticamente para o envio pelo Fora da Pauta.",
      fonteCargoAtual: "https://www.assembleia.pr.leg.br/deputados/perfil/renato-freitas"
    } : {})
  } : null;
  return NextResponse.json({
    candidatura: { id: pessoa.id, nomeUrna: pessoa.nomeUrna, nomeCompleto: pessoa.nomeCompleto, uf: pessoa.uf, cargo: pessoa.cargo },
    resultado, contextoMandato, consultadoEm: new Date().toISOString()
  }, { headers: { "Cache-Control": "private, no-store" } });
}

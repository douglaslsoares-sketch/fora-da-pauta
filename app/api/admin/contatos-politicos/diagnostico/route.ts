import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 35;

type Fonte = { nome: string; ok: boolean; mensagem: string; consultadaEm: string; tipo?: "api" | "pagina"; verificacaoManual?: boolean; canais?: { titulo: string; url: string }[] };

async function camara(): Promise<Fonte> {
  const url = "https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1";
  const consultadaEm = new Date().toISOString();
  try {
    const response = await fetch(url, {
      cache: "no-store", headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(11000)
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const json: unknown = await response.json();
    if (!json || typeof json !== "object" || !("dados" in json) ||
      !Array.isArray(json.dados) || json.dados.length < 1 ||
      typeof json.dados[0]?.id !== "number" ||
      typeof json.dados[0]?.nome !== "string") throw new Error("Formato de dados inesperado");
    return { nome: "Câmara dos Deputados", ok: true, mensagem: "Conexão e formato dos dados confirmados.", consultadaEm };
  } catch {
    return { nome: "Câmara dos Deputados", ok: false, mensagem: "Falha na conexão ou no formato dos dados oficiais.", consultadaEm };
  }
}
async function senado(): Promise<Fonte> {
  const url = "https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json";
  const consultadaEm = new Date().toISOString();
  try {
    const response = await fetch(url, {
      cache: "no-store", headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(11000)
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const json = await response.json() as { ListaParlamentarEmExercicio?: {
      Parlamentares?: { Parlamentar?: unknown[] | Record<string, unknown> } } };
    const base = json?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar;
    const registros = Array.isArray(base) ? base : base ? [base] : [];
    if (!registros.length || !registros.some(item => !!item &&
      typeof item === "object" && "IdentificacaoParlamentar" in item))
      throw new Error("Formato de dados inesperado");
    return { nome: "Senado Federal", ok: true, mensagem: "Conexão e formato dos dados confirmados.", consultadaEm };
  } catch {
    return { nome: "Senado Federal", ok: false, mensagem: "Falha na conexão ou no formato dos dados oficiais.", consultadaEm };
  }
}
async function presidencia(): Promise<Fonte> {
  // A Presidência não disponibiliza nesta funcionalidade uma API pública
  // equivalente à lista de deputados/senadores. O diagnóstico verifica
  // apenas a página oficial de orientação — nunca um envio de mensagens.
  const orientacoes = "https://www.gov.br/casacivil/pt-br/peticionamento-eletronico/peticionamento-eletronico-2013-usuario-externo-da-presidencia-da-republica";
  const canais = [
    { titulo: "Fale com o Presidente (consultar disponibilidade)", url: "https://falepr.presidencia.gov.br/index.php?idioma=br" },
    { titulo: "Ouvidoria da Presidência — Fala.BR", url: "https://falabr.cgu.gov.br/" },
    { titulo: "Orientações institucionais da Presidência", url: orientacoes }
  ];
  const consultadaEm = new Date().toISOString();
  try {
    const response = await fetch(orientacoes, {
      cache: "no-store", headers: { Accept: "text/html" },
      signal: AbortSignal.timeout(11000)
    });
    if (!response.ok) throw new Error("Página institucional indisponível");
    const html = await response.text();
    if (!/Peticionamento Eletr[oô]nico|Fale com o Presidente/i.test(html) || !/Presid[eê]ncia da Rep[uú]blica/i.test(html)) {
      throw new Error("Conteúdo institucional não reconhecido");
    }
    return {
      nome: "Presidência da República", tipo: "pagina", verificacaoManual: true, ok: true, consultadaEm,
      mensagem: "Página de orientações acessível. O serviço Fale com o Presidente pode estar indisponível ou exigir verificação humana; a disponibilidade para envio NÃO foi testada. A Ouvidoria pelo Fala.BR é um canal diferente.",
      canais
    };
  } catch {
    return {
      nome: "Presidência da República", tipo: "pagina", verificacaoManual: true, ok: false, consultadaEm,
      mensagem: "O servidor não conseguiu confirmar o conteúdo da página de orientações. Isso não indica falha do canal de atendimento. Consulte os links oficiais para verificar manualmente a disponibilidade do Fale com o Presidente ou da Ouvidoria. O envio não foi testado.",
      canais
    };
  }
}
export async function GET(request: Request) {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value))
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const limite = await consumeRateLimit({ request, scope: "admin:contatos-politicos:diagnostico", limit: 8, windowSeconds: 3600 });
  if (!limite.allowed) return NextResponse.json({ erro: "Limite de verificações atingido." }, { status: 429, headers: { "Cache-Control": "no-store" } });
  const fontes = await Promise.all([camara(), senado(), presidencia()]);
  return NextResponse.json({
    fontes,
    observacao: "Câmara e Senado: teste de API e formato. Presidência: apenas disponibilidade das orientações institucionais, não do formulário de envio. Nenhum contato individual é aprovado e nenhuma mensagem é transmitida."
  }, { headers: { "Cache-Control": "private, no-store" } });
}

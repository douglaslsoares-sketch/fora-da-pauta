import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

const headers = { "Cache-Control": "private, no-store" };
const urlApiSenado = "https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json";
const urlListaSenado = "https://www25.senado.leg.br/web/senadores/em-exercicio/";

type Senador = {
  IdentificacaoParlamentar?: {
    CodigoParlamentar?: string;
    NomeParlamentar?: string;
    NomeCompletoParlamentar?: string;
    UfParlamentar?: string;
    EmailParlamentar?: string;
  };
};
type DadosSenado = {
  ListaParlamentarEmExercicio?: {
    Parlamentares?: { Parlamentar?: Senador | Senador[] };
  };
};

function normalizar(nome: string) {
  return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function GET(request: NextRequest) {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ erro: "Acesso não autorizado." }, { status: 401, headers });
  }
  const id = request.nextUrl.searchParams.get("id") || "";
  if (!/^\d{8,20}$/.test(id)) {
    return NextResponse.json({ erro: "Identificador inválido." }, { status: 400, headers });
  }

  const candidatura = candidaturas.find(p => p.id === id);
  if (!candidatura || candidatura.cargo !== "governador") {
    return NextResponse.json({ erro: "A consulta é exclusiva para candidaturas a governador." },
      { status: 404, headers });
  }

  const limite = await consumeRateLimit({
    request, scope: "admin:contatos-politicos:mandato-senado",
    limit: 20, windowSeconds: 3600,
  });
  if (!limite.allowed) {
    return NextResponse.json({ erro: "Limite de consultas atingido." }, { status: 429, headers });
  }

  try {
    const resposta = await fetch(urlApiSenado, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(13000),
    });
    if (!resposta.ok) throw new Error("Senado indisponível");
    const dados = await resposta.json() as DadosSenado;
    const lista = dados.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar;
    if (!lista) throw new Error("Dados incompletos do Senado");
    const parlamentares = Array.isArray(lista) ? lista : [lista];
    const encontrado = parlamentares.find(item => {
      const info = item.IdentificacaoParlamentar;
      return Boolean(
        info && normalizar(info.NomeCompletoParlamentar || "") === normalizar(candidatura.nomeCompleto)
        && info.UfParlamentar?.toUpperCase() === candidatura.uf.toUpperCase()
      );
    })?.IdentificacaoParlamentar;
    const codigo = encontrado?.CodigoParlamentar;
    const email = encontrado?.EmailParlamentar;
    const emailInstitucional = typeof email === "string" &&
      /^[a-z0-9._%+-]+@(senado|senador)\.leg\.br$/i.test(email)
        ? email : null;

    return NextResponse.json({
      mandatoSenadoEmExercicio: Boolean(encontrado),
      nomeOficial: encontrado?.NomeCompletoParlamentar || null,
      uf: encontrado?.UfParlamentar || null,
      emailInstitucional,
      fonteUrl: codigo && /^\d+$/.test(String(codigo))
        ? "https://www25.senado.leg.br/web/senadores/senador/-/perfil/" + codigo
        : urlListaSenado,
      consultadoEm: new Date().toISOString(),
      aviso: encontrado
        ? "Mandato no Senado confirmado pela lista de senadores em exercício. O contato permanece separado do cargo de governador eleito e não está aprovado para envio."
        : "Essa pessoa não foi localizada entre os senadores em exercício. Isso não confirma início do mandato de governador.",
      envioHabilitado: false,
      contatoAprovado: false,
    }, { headers });
  } catch {
    return NextResponse.json({
      erro: "A lista oficial do Senado está indisponível. Tente consultar a fonte diretamente.",
      fonteUrl: urlListaSenado,
      envioHabilitado: false,
      contatoAprovado: false,
    }, { status: 503, headers });
  }
}
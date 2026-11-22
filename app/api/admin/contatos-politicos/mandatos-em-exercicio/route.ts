import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { consultarContatoParlamentar } from "@/lib/eleicoes/consultar-contato-parlamentar";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";
import type { Candidatura } from "@/data/eleicoes/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;
const headers = { "Cache-Control": "private, no-store" };
const cargosAcompanhados = new Set(["governador", "senador", "deputado-federal", "deputado-estadual", "deputado-distrital"]);

type CargoExercicio = "senador" | "deputado-federal" | "deputado-estadual";
type Situacao = "confirmado" | "nao_confirmado" | "indisponivel" | "manual";
type Verificacao = {
  cargo: CargoExercicio;
  situacao: Situacao;
  instituicao: string;
  nomeOficial: string | null;
  emailInstitucional: string | null;
  fonteUrl: string | null;
  explicacao: string;
};

function resultadoFederal(cargo: "senador" | "deputado-federal", resultado: Awaited<ReturnType<typeof consultarContatoParlamentar>>): Verificacao {
  const instituicao = cargo === "senador" ? "Senado Federal" : "Câmara dos Deputados";
  if (resultado.situacao === "encontrado") {
    return {
      cargo, situacao: "confirmado", instituicao,
      nomeOficial: resultado.nomeOficial,
      emailInstitucional: resultado.emailInstitucional,
      fonteUrl: resultado.fonteUrl,
      explicacao: "Nome e UF confrontados com o cadastro oficial de mandato em exercício. A conferência não autoriza envio.",
    };
  }
  return {
    cargo,
    situacao: resultado.situacao === "indisponivel" ? "indisponivel" : "nao_confirmado",
    instituicao,
    nomeOficial: null,
    emailInstitucional: null,
    fonteUrl: resultado.fonteUrl,
    explicacao: resultado.motivo + " Um resultado não confirmado NÃO demonstra que a pessoa não exerce mandato.",
  };
}

function estado(pessoa: Candidatura): Verificacao {
  // Não presumir que as 27 casas legislativas ofereçam APIs equivalentes.
  // A Assembleia do Paraná possui consulta pública por legislatura.
  const eParana = pessoa.uf === "PR";
  return {
    cargo: "deputado-estadual",
    situacao: "manual",
    instituicao: pessoa.uf === "DF" ? "Câmara Legislativa do Distrito Federal" : "Assembleia Legislativa de " + pessoa.uf,
    nomeOficial: null,
    emailInstitucional: null,
    fonteUrl: eParana ? "https://www.assembleia.pr.leg.br/deputados/conheca" : null,
    explicacao: eParana
      ? "Verificar pessoalmente na lista por legislatura da Assembleia Legislativa do Paraná. A consulta estadual não foi automatizada."
      : "Fonte estadual ainda não integrada e validada. Faça conferência manual na casa legislativa da UF antes de qualquer conclusão.",
  };
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
  const pessoa = candidaturas.find(item => item.id === id);
  if (!pessoa || !cargosAcompanhados.has(pessoa.cargo)) {
    return NextResponse.json({ erro: "Candidatura não encontrada ou cargo não abrangido." }, { status: 404, headers });
  }
  const limite = await consumeRateLimit({
    request, scope: "admin:contatos-politicos:mandatos-atuais", limit: 15, windowSeconds: 3600,
  });
  if (!limite.allowed) {
    return NextResponse.json({ erro: "Limite de consultas atingido." }, { status: 429, headers });
  }

  // O cargo da candidatura de 2026 NÃO determina o exercício de cargo atual.
  // Fornecer o mesmo nome civil/UF às fontes de cada casa é apenas uma busca informativa.
  // A rotina existente confirma email e EXERCÍCIO, nunca aprova contato automaticamente.
  const [senado, camara] = await Promise.allSettled([
    consultarContatoParlamentar({ ...pessoa, cargo: "senador" }),
    consultarContatoParlamentar({ ...pessoa, cargo: "deputado-federal" }),
  ]);

  function seguro(cargo: "senador" | "deputado-federal", resposta: PromiseSettledResult<Awaited<ReturnType<typeof consultarContatoParlamentar>>>): Verificacao {
    if (resposta.status === "fulfilled") return resultadoFederal(cargo, resposta.value);
    return {
      cargo,
      situacao: "indisponivel",
      instituicao: cargo === "senador" ? "Senado Federal" : "Câmara dos Deputados",
      nomeOficial: null,
      emailInstitucional: null,
      fonteUrl: cargo === "senador" ? "https://www25.senado.leg.br/web/senadores/em-exercicio/" : "https://www.camara.leg.br/deputados/quem-sao",
      explicacao: "Fonte oficial indisponível para esta consulta. Nenhuma conclusão sobre mandato pode ser tirada.",
    };
  }
  const verificacoes = [
    seguro("senador", senado),
    seguro("deputado-federal", camara),
    estado(pessoa),
  ];
  return NextResponse.json({
    candidatura: { id: pessoa.id, nome: pessoa.nomeCompleto, cargoEleito: pessoa.cargo, uf: pessoa.uf },
    verificacoes,
    consultadoEm: new Date().toISOString(),
    aviso: "Mandatos atuais são distintos dos cargos da eleição de 2026. Conferência apenas informativa. Nenhum contato aprovado; envio de mensagens desabilitado.",
    contatoAprovado: false,
    envioHabilitado: false,
  }, { headers });
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/interesses/db";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { consultarContatoParlamentar } from "@/lib/eleicoes/consultar-contato-parlamentar";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headersSemCache = { "Cache-Control": "private, no-store" };
const JANELA_REVISAO_DIAS = 7;

async function autenticado() {
  const store = await cookies();
  return verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value);
}
function origemConfiavel(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}
async function prepararTabelas() {
  await sql`CREATE TABLE IF NOT EXISTS public.contatos_politicos_revisados (
    candidatura_id text PRIMARY KEY,
    nome_civil text NOT NULL,
    cargo text NOT NULL CHECK (cargo IN ('deputado-federal', 'senador')),
    uf text NOT NULL,
    instituicao text NOT NULL,
    email_institucional text NOT NULL,
    fonte_url text NOT NULL,
    status text NOT NULL CHECK (status IN ('revisado', 'revogado')),
    revisado_em timestamptz NOT NULL DEFAULT now(),
    expira_em timestamptz NOT NULL,
    revogado_em timestamptz
  )`;
  await sql`CREATE TABLE IF NOT EXISTS public.contatos_politicos_revisao_historico (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidatura_id text NOT NULL,
    acao text NOT NULL CHECK (acao IN ('revisado', 'revogado')),
    email_institucional text NOT NULL,
    fonte_url text NOT NULL,
    registrado_em timestamptz NOT NULL DEFAULT now()
  )`;
}
function identificar(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") || "";
  if (!/^\d{8,20}$/.test(id)) return null;
  const pessoa = candidaturas.find(item => item.id === id);
  return pessoa && (pessoa.cargo === "deputado-federal" || pessoa.cargo === "senador") ? pessoa : null;
}
export async function GET(request: NextRequest) {
  if (!(await autenticado()))
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: headersSemCache });
  const pessoa = identificar(request);
  if (!pessoa)
    return NextResponse.json({ erro: "Parlamentar não encontrado." }, { status: 400, headers: headersSemCache });
  try {
    await prepararTabelas();
    const rows = await sql`SELECT candidatura_id, nome_civil, cargo, uf, instituicao,
      email_institucional, fonte_url, status, revisado_em, expira_em, revogado_em
      FROM public.contatos_politicos_revisados WHERE candidatura_id = ${pessoa.id} LIMIT 1`;
    const registro = rows[0];
    const vigente = !!registro && registro.status === "revisado" && new Date(registro.expira_em).getTime() > Date.now();
    return NextResponse.json({ registro: registro || null, vigente, envioHabilitado: false }, { headers: headersSemCache });
  } catch (error) {
    console.error("Falha ao ler revisão de contato:", error);
    return NextResponse.json({ erro: "Não foi possível consultar o histórico de revisão." }, { status: 500, headers: headersSemCache });
  }
}
export async function POST(request: NextRequest) {
  if (!(await autenticado()))
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: headersSemCache });
  if (!origemConfiavel(request))
    return NextResponse.json({ erro: "Origem não permitida." }, { status: 403, headers: headersSemCache });
  const pessoa = identificar(request);
  if (!pessoa)
    return NextResponse.json({ erro: "Apenas parlamentares identificados podem ter contato revisado." }, { status: 400, headers: headersSemCache });
  if (Number(request.headers.get("content-length") || 0) > 2000)
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 413, headers: headersSemCache });
  let dados: { confirmacao?: unknown; emailEsperado?: unknown; fonteEsperada?: unknown };
  try {
    const corpo = await request.text();
    if (corpo.length > 2000) throw new Error("too long");
    dados = JSON.parse(corpo);
  } catch {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400, headers: headersSemCache });
  }
  const emailEsperado = typeof dados.emailEsperado === "string" ? dados.emailEsperado.trim().toLowerCase() : "";
  const fonteEsperada = typeof dados.fonteEsperada === "string" ? dados.fonteEsperada.trim() : "";
  if (dados.confirmacao !== "REVISEI_NA_FONTE_OFICIAL" ||
      !emailEsperado || emailEsperado.length > 254 ||
      !fonteEsperada.startsWith("https://") || fonteEsperada.length > 800)
    return NextResponse.json({ erro: "Confirmação da fonte e do contato obrigatória." }, { status: 400, headers: headersSemCache });
  try {
    const limite = await consumeRateLimit({ request, scope: "admin:contatos-politicos:revisao", limit: 12, windowSeconds: 3600 });
    if (!limite.allowed)
      return NextResponse.json({ erro: "Limite de revisões atingido. Tente novamente mais tarde." }, { status: 429, headers: headersSemCache });

    // Nunca confiar em e-mails fornecidos pelo navegador; reconsultar a fonte.
    const resultado = await consultarContatoParlamentar(pessoa);
    if (resultado.situacao !== "encontrado" ||
        resultado.emailInstitucional.toLowerCase() !== emailEsperado ||
        resultado.fonteUrl !== fonteEsperada)
      return NextResponse.json({ erro: "A fonte oficial não confirmou exatamente o contato exibido. Faça uma nova conferência." },
        { status: 409, headers: headersSemCache });

    await prepararTabelas();
    const expiraEm = new Date(Date.now() + JANELA_REVISAO_DIAS * 24 * 60 * 60 * 1000).toISOString();
    const registro = await sql.begin(async tx => {
      const rows = await tx`INSERT INTO public.contatos_politicos_revisados
        (candidatura_id, nome_civil, cargo, uf, instituicao, email_institucional,
         fonte_url, status, revisado_em, expira_em, revogado_em)
        VALUES (${pessoa.id}, ${pessoa.nomeCompleto}, ${pessoa.cargo}, ${pessoa.uf},
          ${resultado.casa}, ${resultado.emailInstitucional}, ${resultado.fonteUrl},
          'revisado', now(), ${expiraEm}::timestamptz, NULL)
        ON CONFLICT (candidatura_id) DO UPDATE SET
          nome_civil = EXCLUDED.nome_civil, cargo = EXCLUDED.cargo, uf = EXCLUDED.uf,
          instituicao = EXCLUDED.instituicao,
          email_institucional = EXCLUDED.email_institucional,
          fonte_url = EXCLUDED.fonte_url, status = 'revisado',
          revisado_em = now(), expira_em = EXCLUDED.expira_em, revogado_em = NULL
        RETURNING candidatura_id, nome_civil, cargo, uf, instituicao,
          email_institucional, fonte_url, status, revisado_em, expira_em, revogado_em`;
      await tx`INSERT INTO public.contatos_politicos_revisao_historico
        (candidatura_id, acao, email_institucional, fonte_url)
        VALUES (${pessoa.id}, 'revisado', ${resultado.emailInstitucional}, ${resultado.fonteUrl})`;
      return rows[0];
    });
    return NextResponse.json({
      registro, vigente: true, envioHabilitado: false,
      mensagem: "Contato revisado e registrado para preparação. O envio de recados continua bloqueado."
    }, { headers: headersSemCache });
  } catch (error) {
    console.error("Falha ao registrar revisão de contato:", error);
    return NextResponse.json({ erro: "Não foi possível registrar a revisão. Nenhuma mensagem foi enviada." },
      { status: 500, headers: headersSemCache });
  }
}
export async function DELETE(request: NextRequest) {
  if (!(await autenticado()))
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: headersSemCache });
  if (!origemConfiavel(request))
    return NextResponse.json({ erro: "Origem não permitida." }, { status: 403, headers: headersSemCache });
  const pessoa = identificar(request);
  if (!pessoa) return NextResponse.json({ erro: "Parlamentar não encontrado." }, { status: 400, headers: headersSemCache });
  try {
    await prepararTabelas();
    const registro = await sql.begin(async tx => {
      const rows = await tx`UPDATE public.contatos_politicos_revisados
        SET status = 'revogado', revogado_em = now()
        WHERE candidatura_id = ${pessoa.id}
        RETURNING candidatura_id, nome_civil, cargo, uf, instituicao,
          email_institucional, fonte_url, status, revisado_em, expira_em, revogado_em`;
      if (rows[0]) {
        await tx`INSERT INTO public.contatos_politicos_revisao_historico
          (candidatura_id, acao, email_institucional, fonte_url)
          VALUES (${pessoa.id}, 'revogado', ${rows[0].email_institucional}, ${rows[0].fonte_url})`;
      }
      return rows[0] || null;
    });
    return NextResponse.json({ registro, vigente: false, envioHabilitado: false, mensagem: "Revisão revogada. Envio continua bloqueado." },
      { headers: headersSemCache });
  } catch (error) {
    console.error("Falha ao revogar revisão:", error);
    return NextResponse.json({ erro: "Não foi possível revogar a revisão." }, { status: 500, headers: headersSemCache });
  }
}

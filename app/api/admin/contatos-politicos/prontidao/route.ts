import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/interesses/db";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { consultarContatoParlamentar } from "@/lib/eleicoes/consultar-contato-parlamentar";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 55;
const semCache = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value))
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: semCache });

  const id = request.nextUrl.searchParams.get("id") || "";
  if (!/^\d{8,20}$/.test(id))
    return NextResponse.json({ erro: "Identificador inválido." }, { status: 400, headers: semCache });
  const pessoa = candidaturas.find(item => item.id === id);
  if (!pessoa || (pessoa.cargo !== "deputado-federal" && pessoa.cargo !== "senador"))
    return NextResponse.json({ erro: "A verificação de prontidão aceita somente deputados federais e senadores." }, { status: 400, headers: semCache });

  try {
    const limite = await consumeRateLimit({ request, scope: "admin:recados-politicos:prontidao", limit: 12, windowSeconds: 3600 });
    if (!limite.allowed)
      return NextResponse.json({ erro: "Limite de conferências atingido." }, { status: 429, headers: semCache });

    const rows = await sql`
      SELECT nome_civil, cargo, uf, instituicao, email_institucional, fonte_url, status, expira_em
      FROM public.contatos_politicos_revisados
      WHERE candidatura_id = ${pessoa.id}
      LIMIT 1
    `;
    const registro = rows[0] as {
      nome_civil: string; cargo: string; uf: string;
      instituicao: string; email_institucional: string;
      fonte_url: string; status: string; expira_em: Date | string;
    } | undefined;
    const revisaoVigente = !!registro && registro.status === "revisado" &&
      new Date(registro.expira_em).getTime() > Date.now() &&
      registro.cargo === pessoa.cargo && registro.uf === pessoa.uf &&
      registro.nome_civil === pessoa.nomeCompleto;
    let contatoIgualAoAtual = false;
    let consultaFonteConcluida = false;
    if (revisaoVigente && registro) {
      const atual = await consultarContatoParlamentar(pessoa);
      consultaFonteConcluida = atual.situacao !== "indisponivel";
      contatoIgualAoAtual = atual.situacao === "encontrado" &&
        atual.emailInstitucional.toLowerCase() === registro.email_institucional.toLowerCase() &&
        atual.fonteUrl === registro.fonte_url && atual.casa === registro.instituicao;
    }
    // Presença de configurações não comprova autorização do domínio no provedor.
    // Esta checagem não cria mensagens, não chama serviços de e-mail e nunca envia.
    const credenciaisEnvioPresentes = !!(
      process.env.RESEND_API_KEY && process.env.FDP_RECADOS_EMAIL_REMETENTE
    );
    return NextResponse.json({
      pessoa: { nomeUrna: pessoa.nomeUrna, uf: pessoa.uf },
      revisaoVigente,
      consultaFonteConcluida,
      contatoIgualAoAtual,
      credenciaisEnvioPresentes,
      prontoParaTesteDeTransporte: revisaoVigente && contatoIgualAoAtual && credenciaisEnvioPresentes,
      envioHabilitado: false,
      mensagem: "Simulação de prontidão: nenhuma mensagem foi criada, registrada para envio ou transmitida.",
      consultadoEm: new Date().toISOString()
    }, { headers: semCache });
  } catch (error) {
    console.error("Falha na simulação de prontidão de contato político:", error);
    return NextResponse.json({ erro: "Não foi possível concluir o teste de prontidão. Nenhuma mensagem foi enviada." },
      { status: 500, headers: semCache });
  }
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { consumeRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 35;

const dominio = "foradapauta.org";
const semCache = { "Cache-Control": "private, no-store" };
const estados = new Set([
  "not_started", "pending", "verified", "failed",
  "partially_verified", "partially_failed", "temporary_failure"
]);

type DominioResend = { id?: unknown; name?: unknown; status?: unknown };

export async function GET(request: Request) {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401, headers: semCache });
  }

  const limite = await consumeRateLimit({
    request, scope: "admin:contatos-politicos:dominio-resend",
    limit: 10, windowSeconds: 3600
  });
  if (!limite.allowed) {
    return NextResponse.json({ erro: "Limite de consultas atingido." },
      { status: 429, headers: semCache });
  }

  const consultadoEm = new Date().toISOString();
  const chave = process.env.RESEND_API_KEY?.trim();
  const base = { dominio, consultadoEm, envioHabilitado: false };
  if (!chave) {
    return NextResponse.json({
      ...base, situacao: "nao_configurado",
      mensagem: "A chave de API do Resend não está configurada neste ambiente. Nenhuma mensagem foi enviada."
    }, { headers: semCache });
  }

  try {
    let after: string | undefined;
    for (let pagina = 0; pagina < 10; pagina++) {
      const url = new URL("https://api.resend.com/domains");
      url.searchParams.set("limit", "100");
      if (after) url.searchParams.set("after", after);
      const resposta = await fetch(url, {
        method: "GET",
        headers: { Authorization: "Bearer " + chave, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(10000)
      });
      if (!resposta.ok) {
        return NextResponse.json({
          ...base, situacao: resposta.status === 401 || resposta.status === 403
            ? "acesso_resend_negado" : "consulta_resend_falhou",
          mensagem: "O Resend não permitiu concluir a consulta do domínio. Nenhuma mensagem foi enviada."
        }, { status: 502, headers: semCache });
      }

      const json: unknown = await resposta.json();
      if (!json || typeof json !== "object" || !("data" in json) ||
        !Array.isArray(json.data)) {
        return NextResponse.json({
          ...base, situacao: "resposta_inesperada",
          mensagem: "O Resend retornou um formato de dados inesperado."
        }, { status: 502, headers: semCache });
      }
      const dados = json.data as DominioResend[];
      const encontrado = dados.find(item => item?.name === dominio);
      if (encontrado) {
        const statusResend = typeof encontrado.status === "string" &&
          estados.has(encontrado.status) ? encontrado.status : "desconhecido";
        return NextResponse.json({
          ...base, situacao: "encontrado", statusResend,
          dominioVerificadoNoResend: statusResend === "verified",
          mensagem: "Consulta somente leitura concluída. Nenhum e-mail foi criado ou enviado."
        }, { headers: semCache });
      }

      const maisPaginas = "has_more" in json && json.has_more === true;
      if (!maisPaginas) {
        return NextResponse.json({
          ...base, situacao: "dominio_nao_encontrado",
          mensagem: "O domínio não aparece na lista consultada desta conta do Resend."
        }, { headers: semCache });
      }
      const ultimo = dados[dados.length - 1];
      if (typeof ultimo?.id !== "string" || !ultimo.id || ultimo.id === after) break;
      after = ultimo.id;
    }
    return NextResponse.json({
      ...base, situacao: "consulta_inconclusiva",
      mensagem: "A listagem foi paginada e não permitiu concluir a busca. Nenhum e-mail foi enviado."
    }, { headers: semCache });
  } catch {
    return NextResponse.json({
      ...base, situacao: "consulta_indisponivel",
      mensagem: "Não foi possível consultar o Resend neste momento. Nenhum e-mail foi enviado."
    }, { status: 502, headers: semCache });
  }
}

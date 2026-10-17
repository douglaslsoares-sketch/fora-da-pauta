import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/interesses/db";
import { consumeRateLimit } from "@/lib/rateLimit";
import {
  COOKIE_SESSAO_TELEGRAM, DIAS_SESSAO, MINUTOS_CODIGO,
  hashSessao, inscricaoAtiva, tokenSessao,
} from "@/lib/telegram/sessao-site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOT = "ForaDaPautaAcompanhaBot";
const semCache = { "Cache-Control": "no-store" };

function permitido(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}

export async function GET() {
  const ativo = await inscricaoAtiva(await tokenSessao());
  return NextResponse.json({ ativo }, { headers: semCache });
}

export async function POST(request: Request) {
  if (!permitido(request)) return NextResponse.json({ erro: "Origem inválida" }, { status: 403 });
  const limite = await consumeRateLimit({
    request, scope: "telegram:sessao:iniciar", limit: 10, windowSeconds: 600,
  });
  if (!limite.allowed) return NextResponse.json(
    { erro: "Muitas tentativas. Aguarde alguns minutos." },
    { status: 429, headers: { ...semCache, "Retry-After": String(limite.retryAfterSeconds) } },
  );
  // O código do bot serve apenas para vincular este navegador, nunca para autenticar outra pessoa.
  const corpo = await request.json().catch(() => ({})) as { ids?: unknown };
  const idsInformados = corpo.ids;
  let idsPendentes: string[] = [];
  if (idsInformados !== undefined) {
    if (!Array.isArray(idsInformados) || idsInformados.length < 1 ||
      idsInformados.length > 100 ||
      idsInformados.some(id => typeof id !== "string" || !/^\d{8,20}$/.test(id))) {
      return NextResponse.json({ erro: "Seleção inválida." }, { status: 400, headers: semCache });
    }
    const { eleitos2026 } = await import("@/data/eleicoes/eleitos");
    const validos = new Set(eleitos2026.map(p => p.id));
    idsPendentes = [...new Set(idsInformados as string[])];
    if (idsPendentes.some(id => !validos.has(id))) {
      return NextResponse.json({ erro: "Pessoa não eleita." }, { status: 400, headers: semCache });
    }
  }
  const anterior = await tokenSessao();
  const token = anterior ?? randomBytes(32).toString("base64url");
  const codigo = randomBytes(24).toString("base64url");
  const sessaoHash = hashSessao(token);
  const codigoHash = hashSessao(codigo);
  const result = await sql<{ vinculado: boolean }[]>`
    INSERT INTO public.telegram_sessoes_site
      (sessao_hash, codigo_hash, codigo_expira_at, expira_at, candidaturas_pendentes)
    VALUES
      (${sessaoHash}, ${codigoHash}, now() + (${MINUTOS_CODIGO} * interval '1 minute'),
       now() + (${DIAS_SESSAO} * interval '1 day'), ${idsPendentes})
    ON CONFLICT (sessao_hash)
    DO UPDATE SET
      codigo_hash = EXCLUDED.codigo_hash,
      codigo_expira_at = EXCLUDED.codigo_expira_at,
      expira_at = EXCLUDED.expira_at,
      candidaturas_pendentes = EXCLUDED.candidaturas_pendentes
    RETURNING telegram_chat_id IS NOT NULL AS vinculado
  `;
  const resposta = NextResponse.json({
    url: `https://t.me/${BOT}?start=s_${codigo}`,
    vinculado: result[0]?.vinculado ?? false,
  }, { headers: semCache });
  resposta.cookies.set(COOKIE_SESSAO_TELEGRAM, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: DIAS_SESSAO * 86400,
  });
  return resposta;
}

export async function PUT(request: Request) {
  if (!permitido(request)) return NextResponse.json({ erro: "Origem inválida" }, { status: 403 });
  const limite = await consumeRateLimit({
    request, scope: "telegram:sessao:salvar", limit: 30, windowSeconds: 600,
  });
  if (!limite.allowed) return NextResponse.json(
    { erro: "Muitas tentativas. Aguarde alguns minutos." },
    { status: 429, headers: { ...semCache, "Retry-After": String(limite.retryAfterSeconds) } },
  );
  const token = await tokenSessao();
  if (!token) return NextResponse.json({ erro: "Vincule o Telegram." }, { status: 401 });
  const body = await request.json().catch(() => null) as { ids?: unknown } | null;
  if (!Array.isArray(body?.ids) || body.ids.length < 1 || body.ids.length > 100 ||
      body.ids.some(id => typeof id !== "string" || !/^\d{8,20}$/.test(id))) {
    return NextResponse.json({ erro: "Seleção inválida." }, { status: 400 });
  }
  const ids = [...new Set(body.ids as string[])];
  // Somente adiciona/reativa os selecionados, sem apagar escolhas anteriores.
  const { eleitos2026 } = await import("@/data/eleicoes/eleitos");
  const { buscarPessoaPoliticaConfirmadaPorCandidatura } = await import("@/lib/eleicoes/identidade-politica");
  const validos = new Set(eleitos2026.map(p => p.id));
  if (ids.some(id => !validos.has(id))) return NextResponse.json({ erro: "Pessoa não eleita." }, { status: 400 });
  const resultado = await sql.begin(async tx => {
    const linhas = await tx<{ telegram_chat_id: string }[]>`
      SELECT telegram_chat_id::text AS telegram_chat_id
      FROM public.telegram_sessoes_site
      WHERE sessao_hash = ${hashSessao(token)}
        AND expira_at > now() AND telegram_chat_id IS NOT NULL
      FOR UPDATE
    `;
    const chatId = linhas[0]?.telegram_chat_id;
    if (!chatId) return false;
    for (const id of ids) {
      const politicoId = buscarPessoaPoliticaConfirmadaPorCandidatura(id);
      await tx`
        INSERT INTO public.telegram_acompanhamentos
          (telegram_chat_id, candidatura_id, identidade_politica_id,
           status, created_at, updated_at, cancelled_at)
        VALUES (${chatId}::bigint, ${id}, ${politicoId}, 'ativo', now(), now(), NULL)
        ON CONFLICT (telegram_chat_id, candidatura_id)
        DO UPDATE SET identidade_politica_id = COALESCE(
            EXCLUDED.identidade_politica_id, telegram_acompanhamentos.identidade_politica_id),
          status = 'ativo', updated_at = now(), cancelled_at = NULL
      `;
    }
    return true;
  });
  return NextResponse.json(resultado ? { salvo: true } : { erro: "Vincule o Telegram." }, {
    status: resultado ? 200 : 401, headers: semCache,
  });
}

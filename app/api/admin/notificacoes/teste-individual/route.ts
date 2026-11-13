import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
import { hashSessao, tokenSessao } from "@/lib/telegram/sessao-site";
import { consumeRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return json({ ok: false, error: "Origem não autorizada." }, 403);
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) return json({ ok: false, error: "Acesso administrativo necessário." }, 401);
  const token = await tokenSessao();
  if (!token) return json({ ok: false, error: "Vincule o Telegram neste navegador." }, 403);
  const body = await request.json().catch(() => null) as { title?: unknown; message?: unknown; articleUrl?: unknown; confirmation?: unknown } | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const articleUrl = typeof body?.articleUrl === "string" ? body.articleUrl.trim() : "";
  if (body?.confirmation !== "ENVIAR SOMENTE PARA MIM") return json({ ok: false, error: "Confirmação individual obrigatória." }, 400);
  if (!title || title.length > 140 || !message || message.length > 1000) return json({ ok: false, error: "Título ou mensagem inválidos." }, 400);
  let url: URL;
  try { url = new URL(articleUrl); } catch { return json({ ok: false, error: "Link inválido." }, 400); }
  if (url.protocol !== "https:" || !["foradapauta.org", "www.foradapauta.org"].includes(url.hostname) || url.username || url.password || url.port || url.search || url.hash || !/^\\/edicoes\\/[a-f0-9-]{36}\\/?$/i.test(url.pathname)) {
    return json({ ok: false, error: "Escolha um artigo publicado na página de edições." }, 400);
  }
  const articleId = url.pathname.split("/")[2];
  const limit = await consumeRateLimit({ request, scope: "admin:telegram:teste-individual", limit: 2, windowSeconds: 3600 });
  if (!limit.allowed) return json({ ok: false, error: "Limite de testes atingido. Aguarde antes de tentar novamente." }, 429);
  try {
    const rows = await sql<{ telegram_chat_id: string }[]>`
      SELECT s.telegram_chat_id::text AS telegram_chat_id
      FROM public.telegram_sessoes_site s
      WHERE s.sessao_hash = ${hashSessao(token)}
        AND s.expira_at > now()
        AND s.telegram_chat_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.telegram_preferencias p
          WHERE p.telegram_chat_id = s.telegram_chat_id
            AND p.tipo = 'novas_edicoes'
            AND p.status = 'ativo'
            AND p.cancelled_at IS NULL
        )
      LIMIT 1
    `;
    const articles = await sql<{ id: string }[]>`
      SELECT id::text FROM public.admin_artigos
      WHERE id = ${articleId}::uuid AND status = 'publicado' LIMIT 1
    `;
    if (!articles.length) return json({ ok: false, error: "Artigo não publicado ou já arquivado." }, 409);
    const chatId = rows[0]?.telegram_chat_id;
    if (!chatId) return json({ ok: false, error: "Inscrição em novas edições não encontrada para este navegador." }, 403);
    // Impede testes com links inexistentes ou ainda privados.
    const articleResponse = await fetch(url.href, { cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(7000) });
    if (articleResponse.status !== 200) return json({ ok: false, error: "O artigo ainda não está disponível publicamente. Publique e confira antes de enviar." }, 409);
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return json({ ok: false, error: "Bot indisponível." }, 503);
    const telegram = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `TESTE INDIVIDUAL — FORA DA PAUTA\n\n${title}\n\n${message}\n\n${url.href}`,
        disable_web_page_preview: true,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!telegram.ok) return json({ ok: false, error: "O Telegram não confirmou o envio." }, 502);
    return json({ ok: true, message: "Teste enviado apenas para a conta vinculada a este navegador." });
  } catch {
    return json({ ok: false, error: "Não foi possível concluir o teste individual." }, 503);
  }
}

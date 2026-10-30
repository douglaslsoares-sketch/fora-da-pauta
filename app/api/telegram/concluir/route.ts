import { randomBytes } from "node:crypto";
import { telegramLiberadoNesteAmbiente } from "@/lib/telegram/ambiente";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";
import { COOKIE_SESSAO_TELEGRAM, DIAS_SESSAO, hashSessao } from "@/lib/telegram/sessao-site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!telegramLiberadoNesteAmbiente()) return NextResponse.json({ erro: "Conclusão de ensaio indisponível nesta prévia." }, { status: 503 });
  const codigo = request.nextUrl.searchParams.get("codigo");
  if (!codigo || !/^[A-Za-z0-9_-]{32}$/.test(codigo)) {
    return NextResponse.redirect(new URL("/votou-fique-de-olho?retorno=telegram", request.url), 303);
  }
  const tokenNovo = randomBytes(32).toString("base64url");
  const hashNovo = hashSessao(tokenNovo);
  const hashCodigo = hashSessao(codigo);
  const vinculado = await sql.begin(async tx => {
    const sessoes = await tx<{ telegram_chat_id: string }[]>`
      SELECT telegram_chat_id::text AS telegram_chat_id
      FROM public.telegram_sessoes_site
      WHERE codigo_hash = ${hashCodigo}
        AND codigo_expira_at > now()
        AND expira_at > now()
        AND telegram_chat_id IS NOT NULL
      FOR UPDATE
    `;
    const chatId = sessoes[0]?.telegram_chat_id;
    if (!chatId) return false;
    // Um novo navegador usa sua propria sessao, sem alterar a anterior.
    await tx`
      INSERT INTO public.telegram_sessoes_site
        (sessao_hash, expira_at, telegram_chat_id, vinculada_at, candidaturas_pendentes)
      VALUES
        (${hashNovo}, now() + (${DIAS_SESSAO} * interval '1 day'),
         ${chatId}::bigint, now(), '{}')
    `;
    await tx`
      UPDATE public.telegram_sessoes_site
      SET codigo_hash = NULL, codigo_expira_at = NULL,
          vinculada_at = COALESCE(vinculada_at, now())
      WHERE telegram_chat_id = ${chatId}::bigint
        AND vinculada_at IS NULL
    `;
    return true;
  });
  const resposta = NextResponse.redirect(
    new URL(vinculado ? "/votou-fique-de-olho?retorno=telegram" : "/votou-fique-de-olho?retorno=expirado", request.url),
    303,
  );
  resposta.headers.set("Cache-Control", "no-store");
  resposta.headers.set("Referrer-Policy", "no-referrer");
  if (vinculado) resposta.cookies.set(COOKIE_SESSAO_TELEGRAM, tokenNovo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DIAS_SESSAO * 86400,
  });
  return resposta;
}

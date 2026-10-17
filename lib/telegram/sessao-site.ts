import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "@/lib/interesses/db";

export const COOKIE_SESSAO_TELEGRAM = "fdp_tg_site_v1";
export const DIAS_SESSAO = 180;
export const MINUTOS_CODIGO = 15;

export function hashSessao(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function tokenSessao() {
  const valor = (await cookies()).get(COOKIE_SESSAO_TELEGRAM)?.value;
  return valor && /^[a-zA-Z0-9_-]{43}$/.test(valor) ? valor : null;
}

// Nao devolve dados de identidade ou chat Telegram ao cliente.
export async function inscricaoAtiva(token: string | null) {
  if (!token) return false;
  const resultado = await sql<{ ativo: boolean }[]>`
    SELECT (
      EXISTS (
        SELECT 1 FROM public.telegram_preferencias AS p
        WHERE p.telegram_chat_id = s.telegram_chat_id
          AND p.tipo = 'novas_edicoes'
          AND p.status = 'ativo'
          AND p.cancelled_at IS NULL
      )
      OR EXISTS (
        SELECT 1 FROM public.telegram_acompanhamentos AS a
        WHERE a.telegram_chat_id = s.telegram_chat_id
          AND a.status IN ('ativo', 'aguardando_eleicao')
          AND a.cancelled_at IS NULL
      )
    ) AS ativo
    FROM public.telegram_sessoes_site AS s
    WHERE s.sessao_hash = ${hashSessao(token)}
      AND s.expira_at > now()
      AND s.telegram_chat_id IS NOT NULL
    LIMIT 1
  `;
  return resultado[0]?.ativo === true;
}

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
  // A inscrição é o vínculo confirmado com o bot, independentemente
  // de já existir uma escolha individual ou preferência de edições.
  const resultado = await sql<{ ativo: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM public.telegram_sessoes_site
      WHERE sessao_hash = ${hashSessao(token)}
        AND expira_at > now()
        AND telegram_chat_id IS NOT NULL
    ) AS ativo
  `;
  return resultado[0]?.ativo === true;
}

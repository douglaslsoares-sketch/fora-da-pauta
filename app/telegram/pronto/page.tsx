import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/interesses/db";
import { COOKIE_SESSAO_TELEGRAM, hashSessao } from "@/lib/telegram/sessao-site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Pronto, agora você está de olho",
  robots: { index: false, follow: false },
};

export default async function ConfirmacaoTelegram() {
  const cookie = (await cookies()).get(COOKIE_SESSAO_TELEGRAM)?.value;
  if (!cookie) redirect("/votou-fique-de-olho");
  const sessao = await sql`
    SELECT 1 FROM public.telegram_sessoes_site
    WHERE sessao_hash = ${hashSessao(cookie)}
      AND telegram_chat_id IS NOT NULL
      AND expira_at > now()
    LIMIT 1
  `;
  if (sessao.length === 0) redirect("/votou-fique-de-olho");

  // Após o bot confirmar a vinculação, reinicia a escolha de pessoas.
  // A página de busca consulta a sessão do Telegram e preserva os acompanhamentos.
  redirect("/votou-fique-de-olho?busca=1");
}

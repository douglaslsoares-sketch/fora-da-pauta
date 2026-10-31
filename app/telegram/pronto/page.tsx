import Image from "next/image";
import Link from "next/link";
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

  return (
    <main className="min-h-[calc(100svh-58px)] bg-white px-6 py-12 text-black">
      <section className="mx-auto flex max-w-[560px] flex-col items-center text-center">
        <Image src="/opengraph-image.jpg" alt="Fora da Pauta — Há mais para entender" width={1200} height={630}
          className="mb-8 h-auto w-full rounded-xl" priority />
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Pronto, agora você está de olho.
        </h1>
        <p className="mt-4 max-w-[42ch] text-base leading-7 text-black/65">
          Você já pode receber os avisos do Fora da Pauta pelo Telegram. Escolha o que deseja fazer.
        </p>
        <Link href="/#opcoes" className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-[#FFD700] px-6 py-3 text-lg font-bold text-black hover:bg-[#ebc700]">
          Continuar →
        </Link>
      </section>
    </main>
  );
}

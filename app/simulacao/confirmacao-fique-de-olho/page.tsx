import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Simulação da confirmação — Fique de olho",
  robots: { index: false, follow: false, noarchive: true },
};

export default function SimulacaoConfirmacaoFiqueDeOlho() {
  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="bg-black text-white">
        <div className="mx-auto flex min-h-[58px] max-w-[760px] items-center justify-between gap-5 px-6 py-2">
          <Link href="/" aria-label="Fora da Pauta — página inicial">
            <Image src="/marca/fp-header-transparente.png" alt="Fora da Pauta" width={36} height={36} className="h-9 w-9 object-contain" />
          </Link>
          <p className="text-right text-[15px] font-semibold leading-tight tracking-[-0.02em]">há mais para entender.</p>
        </div>
      </header>
      <main className="mx-auto max-w-[760px] px-6 pb-14 pt-8">
        <p className="mb-7 text-center text-xs font-medium text-black/50">Prévia visual — nenhuma inscrição será alterada</p>
        <div className="flex flex-col items-center gap-4 text-center">
          <svg viewBox="0 0 24 24" className="h-12 w-12 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="m8 12 2.5 2.5L16 9" />
          </svg>
          <h1 className="text-3xl font-bold leading-tight">Pronto! Você já está de olho.</h1>
        </div>
        <p className="mt-5 text-center leading-7">Quando houver uma nova edição, você receberá um aviso pelo Telegram.</p>
        <section className="mt-8 border-t border-black/10 pt-7">
          <h2 className="text-xl font-bold">Quer acompanhar alguém na política?</h2>
          <p className="mt-3 leading-7 text-black/75">
            Você também pode escolher pessoas para acompanhar suas atuações, decisões e posicionamentos.
          </p>
          <div className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-black px-5 py-3 text-center font-semibold text-white/95" aria-label="Exemplo visual: Escolher pessoas para acompanhar">
            Escolher pessoas para acompanhar <span aria-hidden="true" className="ml-2">⌄</span>
          </div>
          <p className="mt-4 text-center text-sm leading-6 text-black/60">Não precisa escolher ninguém agora. Você continuará recebendo os avisos das novas edições.</p>
          <p className="mt-2 text-center text-xs text-black/50">Botão ilustrativo nesta simulação</p>
        </section>
        <section className="mt-8 rounded-2xl bg-black p-6 text-white">
          <h2 className="text-base font-semibold">Convide alguém a conhecer</h2>
          <p className="mt-3 text-sm leading-6">Convide alguém a conhecer o que está por trás das notícias.</p>
          <p className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[#FFC400] px-4 text-sm font-semibold text-black">Enviar pelo WhatsApp</p>
          <p className="mt-2 text-xs text-white/60">Compartilhamento ilustrativo nesta simulação</p>
        </section>
      </main>
    </div>
  );
}

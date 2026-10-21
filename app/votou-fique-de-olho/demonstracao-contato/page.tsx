import Link from "next/link";
import type { Metadata } from "next";
import { FaleComRepresentante } from "@/components/FaleComRepresentante";

export const metadata: Metadata = {
  title: "Fale com seu representante — demonstração",
  description: "Demonstração da participação cidadã no Fique de Olho.",
  robots: { index: false, follow: false },
};

export default function DemonstracaoParticipacao() {
  return (
    <main className="min-h-screen bg-[#f2f2ee] pb-20 text-[#151515]">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 sm:px-8">
          <Link href="/votou-fique-de-olho" className="text-sm font-semibold text-[#FFC400]">
            ← Fique de Olho
          </Link>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-[#FFC400]">
            Segunda etapa · Demonstração
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            Fale com seu representante
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
            Veja como o cidadão poderá se manifestar abaixo de uma matéria do Fique de Olho.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 pt-8 sm:px-8">
        <div className="mb-6 border-l-4 border-[#FFC400] bg-[#fff7d6] px-5 py-4 text-sm leading-6">
          <p className="font-bold">Esta página é apenas uma demonstração.</p>
          <p className="mt-1">
            Não apresenta uma votação real nem altera seus representantes acompanhados.
            As opções abaixo funcionam para escrever e copiar uma mensagem.
            WhatsApp e e-mail ficam indisponíveis até que existam contatos oficiais verificados na matéria.
          </p>
        </div>
        <FaleComRepresentante assunto="Decisão comentada na matéria" />
        <p className="mt-7 text-center text-sm text-black/55">
          A busca de eleitos e a inscrição no Telegram permanecem como estavam.
        </p>
      </div>
    </main>
  );
}

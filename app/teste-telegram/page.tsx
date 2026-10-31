import type { Metadata } from "next";
import Link from "next/link";
import { CompartilharArtigoTeste } from "@/components/CompartilharArtigoTeste";

export const metadata: Metadata = {
  title: "Artigo demonstrativo — Teste de navegação",
  robots: { index: false, follow: false },
};

export default function TesteTelegram() {
  return (
    <main className="min-h-screen bg-white text-[#161616]">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
        <div className="border-l-4 border-[#E5B600] bg-[#fff8d8] px-4 py-3 text-sm font-semibold">
          TESTE DE NAVEGAÇÃO — NÃO É UMA EDIÇÃO PUBLICADA
        </div>
        <p className="mt-10 text-xs font-bold uppercase tracking-widest text-neutral-500">Fora da Pauta · Artigo demonstrativo</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Há mais para entender.</h1>
        <p className="mt-5 text-lg leading-8">Como uma informação compartilhada pode levar uma pessoa ao artigo e, depois, ao acompanhamento pelo Telegram?</p>
        <section className="mt-10 border-t border-neutral-200 pt-7">
          <h2 className="text-2xl font-semibold">Um artigo pode ser a porta de entrada.</h2>
          <p className="mt-4 leading-8">Quem recebe o link por um aplicativo pode ler o conteúdo livremente. Se gostar, acompanha as próximas edições pelo Telegram. Na própria conversa, encontra as opções de acompanhamento, fichas e outras edições.</p>
          <p className="mt-4 leading-8">Ao voltar ao artigo, continua tendo um acesso simples ao Telegram e pode abrir o menu novamente. Este texto é apenas uma simulação, não uma reportagem publicada.</p>
        </section>
        <section className="mt-12 space-y-4 border-t border-neutral-200 pt-7" aria-label="Opções após leitura">
          <h2 className="text-2xl font-semibold">Continue de olho</h2>
          <p className="text-sm leading-6 text-neutral-600">Para receber novidades ou acessar suas opções, abra o Fora da Pauta no Telegram.</p>
          <a href="https://t.me/ForaDaPautaAcompanhaBot?start=artigo_teste" className="flex min-h-12 w-full items-center justify-center bg-[#FFD700] px-5 py-3 text-center font-semibold text-black">
            Fora da Pauta no Telegram
          </a>
          <CompartilharArtigoTeste />
        </section>
        <p className="mt-8 text-xs text-neutral-500">Ambiente de demonstração · <Link href="/" className="underline">Página inicial</Link></p>
      </div>
    </main>
  );
}

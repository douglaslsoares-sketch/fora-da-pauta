import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apoio | Fora da Pauta",
  description: "Conheça formas de apoiar a continuidade do Fora da Pauta.",
};

export default function Page(){
  return <main className="mx-auto max-w-xl px-5 pt-5 pb-8">
    <header className="relative flex items-center justify-center pb-6">
      <Link href="/editoriais" aria-label="Voltar para Editoriais" className="absolute left-0 top-0 inline-flex min-h-11 min-w-11 items-center text-2xl">←</Link>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#F4C64D" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path strokeLinecap="round" d="M19.5 12.57 12 20l-7.5-7.43C-3 5.3 7.8-1.8 12 5.8c4.2-7.6 15-0.5 7.5 6.77Z"/><path strokeLinecap="round" d="m12 5.8-4.1 4.1a1.8 1.8 0 0 0 2.55 2.55l2.2-2.2 5.3 5.3M7 15l2-2m1 4 2-2m1 4 2-2"/></svg>
        <h1 className="text-5xl font-extrabold tracking-tight">Apoio</h1>
      </div>
    </header>
    <section className="mx-auto max-w-md space-y-5 border-t border-slate-600 pt-6 text-center text-base leading-7 text-slate-200">
      <h2 className="text-xl font-bold text-white">Apoie o Fora da Pauta</h2>
      <p>Queremos manter nossas publicações abertas e gratuitas para todos, preservando a independência do projeto.</p>
      <p>Uma forma de contribuir com a continuidade do Fora da Pauta é adquirir produtos com a nossa marca.</p>
      <Link href="/loja/catalogo" className="block rounded-xl bg-[#F4C64D] px-5 py-4 font-bold text-[#0C192B]">Conhecer os produtos</Link>
      <p className="text-sm leading-6 text-slate-300">Nossa loja está em preparação.</p>
      <Link href="/editoriais" className="inline-flex min-h-12 items-center font-semibold text-[#F4C64D]">← Voltar</Link>
    </section>
  </main>;
}

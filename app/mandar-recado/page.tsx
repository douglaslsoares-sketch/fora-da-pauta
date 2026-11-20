import Link from "next/link";
import { CabecalhoInterno } from "@/components/CabecalhoInterno";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mandar um recado | Fora da Pauta" };

export default function MandarRecado() {
  const card = "relative block rounded-xl border border-[#344760] bg-[#24334b] py-5 pl-5 pr-12 text-left text-white transition-colors hover:border-[#f4c542] focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400";
  return <main className="min-h-screen bg-[#141c2b] pb-20 text-white">
    <section className="mx-auto w-full max-w-xl px-5 pt-3">
      <CabecalhoInterno titulo="Mandar um recado" />
      <p className="mb-7 mt-2 text-center text-slate-300">Com quem você quer conversar?</p>
      <nav aria-label="Escolher destinatário" className="space-y-3">
        <Link href="/mandar-recado/politico" className={card}>
          <span className="block text-lg font-bold">Com um político</span>
          <span className="mt-1 block text-sm text-slate-300">Busque qualquer político pelo nome. Não precisa acompanhá-lo.</span>
          <span aria-hidden="true" className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-semibold text-white">›</span>
        </Link>
        <Link href="/mandar-recado/fora-da-pauta" className={card}>
          <span className="block text-lg font-bold">Com o Fora da Pauta</span>
          <span className="mt-1 block text-sm text-slate-300">Dúvidas, sugestões e comentários.</span>
          <span aria-hidden="true" className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-semibold text-white">›</span>
        </Link>
        <Link href="/mandar-recado/comunidade" className={card}>
          <span className="block text-lg font-bold">Com a comunidade</span>
          <span className="mt-1 block text-sm text-slate-300">Perguntas e reflexões para compartilhar.</span>
          <span aria-hidden="true" className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-semibold text-white">›</span>
        </Link>
      </nav>
      <div className="mt-8 text-center"><Link href="/central" className="inline-block rounded-lg bg-red-600 px-9 py-3 font-bold text-white"><span aria-hidden="true" className="mr-2 text-sm font-normal">x</span>Fechar</Link></div>
    </section>
  </main>;
}

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mandar um recado | Fora da Pauta" };

export default function MandarRecado() {
  const card = "block rounded-xl border border-[#344760] bg-[#24334b] p-5 text-left text-white";
  return <main className="min-h-screen bg-[#141c2b] pb-20 text-white">
    <section className="mx-auto w-full max-w-xl px-5 pt-3">
      <h1 className="text-center text-2xl font-extrabold">Mandar um recado</h1>
      <p className="mb-7 mt-2 text-center text-slate-300">Com quem você quer conversar?</p>
      <nav aria-label="Escolher destinatário" className="space-y-3">
        <Link href="/meus-acompanhamentos" className={card+" hover:border-[#f4c542] focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"}>
          <span className="block text-lg font-bold">Com um político</span>
          <span className="mt-1 block text-sm text-slate-300">Escolha um representante da sua lista de acompanhamentos.</span>
        </Link>
        <div className={card+" opacity-70"} aria-disabled="true">
          <span className="block text-lg font-bold">Com o Fora da Pauta</span>
          <span className="mt-1 block text-sm text-slate-300">Dúvidas, sugestões e comentários. Em preparação.</span>
        </div>
        <div className={card+" opacity-70"} aria-disabled="true">
          <span className="block text-lg font-bold">Com a comunidade</span>
          <span className="mt-1 block text-sm text-slate-300">Perguntas e reflexões para compartilhar. Em preparação.</span>
        </div>
      </nav>
      <div className="mt-8 text-center"><Link href="/central" className="inline-block rounded-lg bg-red-600 px-9 py-3 font-bold text-white">Fechar</Link></div>
    </section>
  </main>;
}

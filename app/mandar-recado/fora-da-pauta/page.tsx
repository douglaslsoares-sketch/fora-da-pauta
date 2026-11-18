import Link from "next/link";
import type { Metadata } from "next";
import { RecadoPoliticoFormulario } from "@/components/RecadoPoliticoFormulario";
export const metadata: Metadata = { title: "Com o Fora da Pauta | Fora da Pauta" };
export default function Page() {
  return <main className="min-h-screen bg-[#141c2b] px-5 pb-20 pt-4 text-white">
    <section className="mx-auto max-w-xl">
      <h1 className="text-center text-2xl font-bold">Com o Fora da Pauta</h1>
      <p className="mt-3 text-center text-slate-300">Envie dúvidas, sugestões ou comentários ao projeto.</p>
      <RecadoPoliticoFormulario destinatario="projeto" />
      <div className="mt-8 text-center"><Link href="/mandar-recado" className="inline-block rounded-lg bg-red-600 px-9 py-3 font-bold text-white"><span aria-hidden="true" className="mr-2 text-sm font-normal">x</span>Fechar</Link></div>
    </section>
  </main>;
}

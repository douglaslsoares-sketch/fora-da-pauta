import Link from "next/link";
import type { Metadata } from "next";
import { RecadoPoliticoFormulario } from "@/components/RecadoPoliticoFormulario";
import { candidaturas } from "@/data/eleicoes/candidaturas";
export const metadata: Metadata = { title: "Recado para político | Fora da Pauta" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pessoa = candidaturas.find(p => p.id === id);
  return <main className="min-h-screen bg-[#141c2b] px-5 pb-24 pt-4 text-white">
    <section className="mx-auto max-w-xl">
      <h1 className="text-center text-2xl font-bold">Mandar um recado</h1>
      <p className="mt-4 text-center text-xl">{pessoa?.nomeUrna || "Político não encontrado"}</p>
      {pessoa ? <RecadoPoliticoFormulario /> : <p className="mt-6 text-center">Não foi possível identificar o destinatário.</p>}
      <div className="mt-6 pb-6 text-center"><Link href="/mandar-recado/politico" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-red-600 px-8 py-3 font-bold"><span aria-hidden="true" className="mr-2 text-sm font-normal">x</span>Fechar</Link></div>
    </section>
  </main>;
}

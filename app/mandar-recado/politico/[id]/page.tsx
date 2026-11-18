import Link from "next/link";
import type { Metadata } from "next";
import { candidaturas } from "@/data/eleicoes/candidaturas";
export const metadata: Metadata = { title: "Recado para político | Fora da Pauta" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pessoa = candidaturas.find(p => p.id === id);
  return <main className="min-h-screen bg-[#141c2b] px-5 pb-16 pt-6 text-white">
    <section className="mx-auto max-w-xl">
      <h1 className="text-center text-2xl font-bold">Mandar um recado</h1>
      <p className="mt-4 text-center text-xl">{pessoa?.nomeUrna || "Político não encontrado"}</p>
      <div className="mt-7 rounded-xl border border-[#344760] bg-[#24334b] p-5">
        <p>O envio direto ficará disponível após a confirmação do mandato em exercício e do endereço oficial de contato.</p>
        <p className="mt-3 text-sm text-slate-300">Nenhuma mensagem foi enviada.</p>
      </div>
      <div className="mt-8 text-center"><Link href="/mandar-recado/politico" className="inline-block rounded-lg bg-red-600 px-8 py-3 font-bold">x Fechar</Link></div>
    </section>
  </main>;
}

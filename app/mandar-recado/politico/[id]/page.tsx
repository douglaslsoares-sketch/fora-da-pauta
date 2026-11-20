import Link from "next/link";
import { CabecalhoInterno } from "@/components/CabecalhoInterno";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import type { Metadata } from "next";
import { RecadoPoliticoFormulario } from "@/components/RecadoPoliticoFormulario";
import { candidaturas } from "@/data/eleicoes/candidaturas";
export const metadata: Metadata = { title: "Recado para político | Fora da Pauta" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pessoa = candidaturas.find(p => p.id === id);
  return <main className="min-h-screen bg-[#141c2b] px-5 pb-24 pt-4 text-white">
    <section className="mx-auto max-w-xl">
      <CabecalhoInterno titulo="Mandar um recado" />
      {pessoa ? (
        <>
          <div className="mx-auto mt-4 flex max-w-md items-center gap-4 rounded-xl border border-[#344760] bg-[#24334b] p-4">
            <CandidatePhoto id={pessoa.id} name={pessoa.nomeUrna} />
            <div className="min-w-0">
              <p className="text-lg font-bold">{pessoa.nomeUrna}</p>
              <p className="mt-1 text-sm text-slate-300">{pessoa.siglaPartido} · {pessoa.uf}</p>
            </div>
          </div>
          <p role="status" className="mx-auto mt-5 max-w-md rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
            O envio de recados a políticos ainda não está disponível. Estamos verificando os contatos oficiais; nenhuma mensagem será encaminhada nesta etapa.
          </p>
          <RecadoPoliticoFormulario />
        </>
      ) : <p className="mt-6 text-center">Não foi possível identificar o destinatário.</p>}
      <div className="mt-6 pb-6 text-center"><Link href="/mandar-recado/politico" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-red-600 px-8 py-3 font-bold"><span aria-hidden="true" className="mr-2 text-sm font-normal">x</span>Fechar</Link></div>
    </section>
  </main>;
}

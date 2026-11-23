import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { RecadoPoliticoFormulario } from "@/components/RecadoPoliticoFormulario";
import { candidaturas } from "@/data/eleicoes/candidaturas";
import { situacaoRecadoPolitico } from "@/lib/eleicoes/situacao-recado";
export const metadata: Metadata = { title: "Recado para um político | Políticos" };
export default async function RecadoParaPolitico({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pessoa = candidaturas.find(c => c.id === id);
  if (!pessoa) notFound();
  const situacao = situacaoRecadoPolitico(pessoa);
  return <PaginaPoliticos titulo="Mandar um recado">
    <div className="flex items-center gap-4 rounded-xl border border-[#344760] bg-[#152d45] p-4">
      <CandidatePhoto id={pessoa.id} name={pessoa.nomeUrna} />
      <div className="min-w-0">
        <p className="font-bold">{pessoa.nomeUrna}</p>
        <p className="text-sm text-slate-300">{pessoa.siglaPartido} · {pessoa.uf}</p>
      </div>
    </div>
    <aside className="mt-5 rounded-xl border border-amber-400/40 bg-amber-400/10 p-5 text-sm leading-7 text-amber-100">
      <h2 className="font-bold">{situacao.titulo}</h2>
      <p className="mt-2">{situacao.detalhe}</p>
      {situacao.fonteUrl && situacao.fonteRotulo ? <a href={situacao.fonteUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold underline underline-offset-4">{situacao.fonteRotulo}</a> : null}
      <p className="mt-4 font-semibold">Contato individual ainda não verificado. Nenhum recado será enviado.</p>
    </aside>
    <RecadoPoliticoFormulario />
    <Link href="/politicos/recados" className="mt-5 inline-block text-sm font-semibold text-[#ffd02a] underline underline-offset-4">← Escolher outro político</Link>
  </PaginaPoliticos>;
}

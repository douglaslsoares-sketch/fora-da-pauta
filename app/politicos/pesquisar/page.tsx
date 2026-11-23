import type { Metadata } from "next";
import { CandidateSelector } from "@/components/CandidateSelector";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
export const metadata: Metadata = { title: "Pesquisar políticos | Políticos" };
export default function PesquisarPoliticos() {
  return <PaginaPoliticos titulo="Pesquisar políticos">
    <p className="mb-5 text-base leading-7 text-slate-200">Pesquise por nome, partido, número, cargo ou estado para consultar fichas documentais. Pesquisar não adiciona ninguém aos seus acompanhamentos.</p>
    <div className="rounded-2xl bg-white p-4 text-slate-900 sm:p-6">
      <CandidateSelector />
    </div>
  </PaginaPoliticos>;
}

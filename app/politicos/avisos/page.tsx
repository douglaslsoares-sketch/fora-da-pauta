import type { Metadata } from "next";
import Link from "next/link";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
export const metadata: Metadata = { title: "Receber avisos | Políticos" };
export default function Avisos() {
  return <PaginaPoliticos titulo="Receber avisos">
    <section className="rounded-2xl border border-[#32465e] bg-[#152d45] p-5 sm:p-7">
      <h2 className="text-xl font-bold text-[#ffd432]">Avisos individuais em preparação</h2>
      <p className="mt-3 leading-7 text-slate-200">Você já pode escolher políticos e consultar suas escolhas. O envio automático de avisos sobre cada político ainda não está disponível.</p>
      <p className="mt-3 leading-7 text-slate-200">Nossa proposta é informar os novos registros documentados sobre os políticos acompanhados, com fontes e histórico, sem filtrar apenas o que alguém considera relevante.</p>
      <p className="mt-3 leading-7 text-slate-200">Enquanto isso, o canal geral do Fora da Pauta no WhatsApp permite receber avisos de novas publicações, mas não substitui os avisos individuais.</p>
    </section>
    <Link href="/politicos/acompanhados" className="mt-5 block rounded-xl bg-[#ffd432] px-5 py-4 text-center font-bold text-[#092235]">Ver meus políticos</Link>
  </PaginaPoliticos>;
}

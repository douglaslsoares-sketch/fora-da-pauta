import type { Metadata } from "next";
import Link from "next/link";
import { PaginaPoliticos } from "@/components/PaginaPoliticos";
export const metadata: Metadata = { title: "Loja | Políticos" };
export default function LojaPoliticos() {
  return <PaginaPoliticos titulo="Loja">
    <p className="mb-5 text-center text-lg leading-7 text-slate-200">Produtos que ajudam a manter o projeto.</p>
    <section className="rounded-xl border border-[#334e65] bg-[#152d45] p-5">
      <h2 className="text-lg font-bold text-[#ffd432]">Produtos do Fora da Pauta</h2>
      <p className="mt-3 leading-7 text-slate-200">A loja reúne modelos em preparação. Ainda não há compras disponíveis diretamente pelo aplicativo Políticos.</p>
      <Link href="/loja" className="mt-5 block rounded-xl bg-[#ffd432] px-5 py-4 text-center font-bold text-[#092235]">Ver os modelos disponíveis no catálogo</Link>
    </section>
  </PaginaPoliticos>;
}

import Link from "next/link";
import type { Metadata } from "next";
import { HistoricoRecados } from "@/components/HistoricoRecados";

export const metadata: Metadata = { title: "Meus recados | Fora da Pauta", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() {
  return <main className="min-h-screen bg-[#141c2b] px-5 pb-16 pt-8 text-white">
    <section className="mx-auto max-w-xl lg:max-w-3xl">
      <h1 className="text-center text-2xl font-extrabold lg:text-3xl">Meus recados</h1>
      <p className="mt-3 text-center text-sm lg:text-base leading-6 text-slate-300">Acompanhe seus recados e consulte as respostas do Fora da Pauta.</p>
      <HistoricoRecados />
      <p className="mt-6 text-xs lg:text-sm leading-6 text-slate-400">O acesso ao histórico fica associado a este navegador. Para consultar em outro aparelho, use a opção de vínculo acima. Se apagar os dados do site, poderá perder o acesso até vincular novamente. Recados anteriores à ativação do histórico não podem ser recuperados automaticamente.</p>
      <div className="mt-8 text-center"><Link href="/central" className="inline-block rounded-lg bg-red-600 px-9 py-3 font-bold text-white"><span aria-hidden="true" className="mr-2">x</span>Fechar</Link></div>
    </section>
  </main>;
}

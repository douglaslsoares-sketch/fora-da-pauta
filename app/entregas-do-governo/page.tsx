import type { Metadata } from "next";
import Link from "next/link";
import { versaoEntregas } from "@/lib/novidades-publicacoes";
import { RegistrarNovidadeVista } from "@/components/RegistrarNovidadeVista";
export const metadata: Metadata = { title: "Entregas do governo", description: "Acompanhe o que o governo federal efetivamente realizou, com fontes verificáveis." };
export default function EntregasDoGoverno() {
  return <main className="min-h-screen bg-white px-5 pb-16 pt-10 text-black sm:px-8">
    <RegistrarNovidadeVista secao="entregas" versao={versaoEntregas} />
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Entregas do governo</h1>
      <p className="mt-4 text-lg leading-7 text-black/80">O que o governo federal está fazendo e o que já entregou à população.</p>
      <p className="mt-4 leading-7 text-black/75">Aqui vamos apresentar obras, serviços e programas, com datas, locais, beneficiários e fontes para conferência.</p>
      <p className="mt-4 leading-7 text-black/75">Vamos diferenciar anúncios, ações em andamento e entregas concluídas. A seção acompanha qualquer governo federal, independentemente de quem ocupe a Presidência.</p>
      <div className="mt-8 rounded-xl border border-black/15 bg-black/5 p-5">
        <h2 className="text-lg font-bold">Em preparação</h2>
        <p className="mt-2 leading-7 text-black/70">Ainda não há entregas verificadas publicadas. Os primeiros registros serão incluídos após conferência das fontes.</p>
      </div>
      <Link href="/#opcoes" className="mx-auto mt-8 flex min-h-14 w-full items-center justify-center rounded-2xl bg-black px-5 py-3 text-center font-semibold text-white"><span aria-hidden="true" className="mr-2">←</span>Voltar</Link>
    </section>
  </main>;
}
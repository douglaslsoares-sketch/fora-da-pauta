import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O que disse o presidente?",
  description: "Acompanhe declarações e transmissões da Presidência, com acesso às fontes originais e contexto.",
};

export default function OQueDisseOPresidente() {
  return (
    <main className="min-h-screen bg-white px-5 pb-16 pt-10 text-black sm:px-8">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">O que disse o presidente?</h1>
        <p className="mt-4 text-base leading-7 text-black/75">
          Quer saber o que o presidente falou? Aqui você poderá encontrar transmissões,
          entrevistas e declarações, com data, assunto e acesso à fala original.
        </p>
        <p className="mt-4 text-base leading-7 text-black/75">
          Quando necessário, o Fora da Pauta acrescentará explicações e contexto,
          distinguindo o que foi dito do que já foi confirmado.
          Esta seção acompanha quem estiver na Presidência, independentemente de quem seja.
        </p>
        <div className="mt-8 rounded-xl border border-black/15 bg-black/5 p-5">
          <h2 className="text-lg font-bold">Em preparação</h2>
          <p className="mt-2 leading-7 text-black/70">
            Ainda não há transmissões selecionadas nesta seção. Publicaremos conteúdos
            com links para as fontes originais assim que forem conferidos.
          </p>
        </div>
        <Link href="/#opcoes" className="mx-auto mt-8 flex min-h-14 w-full items-center justify-center rounded-2xl bg-black px-5 py-3 text-center font-semibold text-white">
          <span aria-hidden="true" className="mr-2">→</span>Ir para o início
        </Link>
      </section>
    </main>
  );
}

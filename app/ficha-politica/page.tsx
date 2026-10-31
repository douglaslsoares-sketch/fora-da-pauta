import type { Metadata } from "next";
import Link from "next/link";
import { CandidateSelector } from "@/components/CandidateSelector";

export const metadata: Metadata = {
  title: "Ficha política | Fora da Pauta",
  description: "Pesquise pessoas públicas e consulte suas fichas políticas.",
  robots: { index: false, follow: false },
};

export default function FichaPoliticaBusca() {
  return (
    <main className="min-h-screen bg-white px-5 pb-16 pt-10 text-black sm:px-8">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ficha política</h1>
        <p className="mb-7 mt-3 max-w-xl text-base leading-7 text-black/65">
          Encontre uma pessoa pelo nome e consulte sua ficha política.
        </p>
        <CandidateSelector />
        <Link href="/#opcoes" className="mt-10 inline-flex min-h-12 items-center rounded-lg bg-black px-5 py-3 font-semibold text-white">
          Voltar às opções
        </Link>
      </section>
    </main>
  );
}

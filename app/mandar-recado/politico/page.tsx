import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoInterno } from "@/components/CabecalhoInterno";
import { CandidateSelector } from "@/components/CandidateSelector";
export const metadata: Metadata = { title: "Escolher político | Fora da Pauta" };
export default function Page() {
  return <main className="min-h-screen bg-[#141c2b] px-5 pb-16 pt-5 text-white">
    <section className="mx-auto max-w-3xl">
      <CabecalhoInterno titulo="Para qual político?" />
      <CandidateSelector mode="recado" />
      <div className="mt-8 text-center"><Link href="/mandar-recado" className="inline-block rounded-lg bg-red-600 px-8 py-3 font-bold text-white"><span className="mr-2 text-sm font-normal">x</span>Fechar</Link></div>
    </section>
  </main>;
}

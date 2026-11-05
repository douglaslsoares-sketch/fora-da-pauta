import Link from "next/link";
import type { Metadata } from "next";
import { FecharPaginaLink } from "@/components/FecharPaginaLink";

export const metadata: Metadata = {
  title: "O dia do presidente — Fora da Pauta",
  description: "Consulte o histórico documentado das atividades públicas da Presidência.",
};

export default function DiaDoPresidente() {
  return <main className="min-h-screen bg-white px-5 py-10 text-black sm:px-8">
    <section className="mx-auto max-w-3xl">
      <div className="flex justify-end"><FecharPaginaLink /></div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">O dia do presidente</h1>
      <p className="mt-4 text-lg leading-7 text-black/80">O que o presidente fez, falou e participou em cada dia.</p>
      <p className="mt-4 leading-7 text-black/70">
        Aqui reuniremos compromissos públicos, eventos, discursos, publicações e outras atividades verificáveis,
        com datas e fontes. O registro deve incluir também dias sem agenda pública divulgada,
        sem transformar ausência de registros em afirmação de inatividade.
      </p>
      <section className="mt-8 rounded-xl border border-black/15 bg-black/5 p-5" aria-label="Histórico diário">
        <h2 className="text-xl font-bold">Histórico por dia</h2>
        <p className="mt-3 leading-7 text-black/70">
          Ainda não há registros diários verificados publicados nesta seção.
          Quando disponíveis, aparecerão aqui do mais recente para o mais antigo.
        </p>
      </section>
      <Link href="/entregas-do-governo"
        className="mt-6 flex min-h-12 items-center justify-center rounded-xl border border-black/20 bg-white p-3 text-center font-semibold">
        Consultar entregas do governo →
      </Link>
    </section>
  </main>;
}

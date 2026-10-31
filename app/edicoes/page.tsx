import Link from "next/link";
import type { Metadata } from "next";
import { campaigns } from "@/data/campanhas";

export const metadata: Metadata = {
  title: "Edições já publicadas",
  description: "Confira as edições publicadas do Fora da Pauta.",
};

export default function EdicoesPublicadas() {
  const edicoes = campaigns.filter((item) => Boolean(item.publishedAt))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  return (
    <main className="min-h-[calc(100svh-58px)] bg-white px-6 py-10 text-black">
      <section className="mx-auto max-w-[720px]">
        <h1 className="text-3xl font-bold tracking-tight">Edições já publicadas</h1>
        <p className="mt-3 text-base text-black/65">Escolha uma edição para ler ou ouvir.</p>
        {edicoes.length > 0 ? (
          <ul className="mt-8 flex flex-col gap-4">
            {edicoes.map((item) => (
              <li key={item.slug}>
                <Link href={`/campanhas/${item.slug}`} className="block rounded-xl border border-black/15 px-5 py-5 hover:border-[#b28d00] focus-visible:outline-2 focus-visible:outline-[#b28d00]">
                  <span className="block text-lg font-bold">{item.title} <span aria-hidden="true">→</span></span>
                  <span className="mt-2 block text-sm leading-6 text-black/65">{item.statement}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="mt-8 rounded-xl bg-black/5 p-5">Ainda não há edições publicadas.</p>}
        <Link href="/telegram/acoes" className="mt-10 inline-block text-sm font-semibold underline underline-offset-4">Voltar às opções</Link>
      </section>
    </main>
  );
}

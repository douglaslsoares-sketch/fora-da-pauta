import type { Metadata } from "next";
import Link from "next/link";

import { formatEditionDate, getPublishedEditions } from "@/data/edicoes-publicadas";

export const metadata: Metadata = {
  title: "Todas as edições | Fora da Pauta",
  description:
    "Consulte as edições publicadas do Fora da Pauta, da mais recente para a mais antiga.",
  alternates: { canonical: "https://www.foradapauta.org/edicoes" },
};

export default function EdicoesPage() {
  const edicoes = getPublishedEditions();

  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <section className="bg-black px-5 pb-14 pt-16 text-white sm:px-8 sm:pt-20 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffc400]">
            Fora da Pauta
          </p>
          <h1 className="mt-5 text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[1.05] tracking-[-0.05em]">
            Todas as edições
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            Conheça os temas que já publicamos. Entenda como o jogo é jogado.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10" aria-label="Edições publicadas">
        <div className="mx-auto w-full max-w-5xl">
          {edicoes.length === 0 ? (
            <p className="max-w-2xl border-t border-black/15 pt-6 text-base leading-8 text-black/65">
              Ainda não há edições liberadas para esta lista. Quando uma
              edição for publicada, ela aparecerá aqui.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {edicoes.map((edicao) => (
                <article key={edicao.slug} className="flex flex-col border border-black/15 bg-white p-6 sm:p-8">
                  <time
                    dateTime={edicao.publishedAt}
                    className="text-xs font-semibold text-black/50"
                  >
                    {formatEditionDate(edicao.publishedAt!)}
                  </time>
                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">
                    <Link href={`/campanhas/${edicao.slug}`} className="hover:underline">
                      {edicao.title}
                    </Link>
                  </h2>
                  <p className="mt-4 flex-1 text-base leading-7 text-black/65">
                    {edicao.statement}
                  </p>
                  <Link
                    href={`/campanhas/${edicao.slug}`}
                    aria-label={`Ler edição: ${edicao.title}`}
                    className="mt-6 inline-flex min-h-11 items-center gap-3 font-semibold text-black underline decoration-[#d2a500] decoration-2 underline-offset-4 hover:decoration-black"
                  >
                    Ler edição <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          )}
          <Link
            href="/"
            className="mt-10 inline-flex min-h-11 items-center gap-3 text-sm font-semibold underline underline-offset-4"
          >
            <span aria-hidden="true">←</span> Voltar à página inicial
          </Link>
        </div>
      </section>
    </main>
  );
}

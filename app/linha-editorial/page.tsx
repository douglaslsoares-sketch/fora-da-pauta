import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { MarkdownDocument } from "@/components/MarkdownDocument";

export const metadata: Metadata = {
  title: "Linha Editorial",
  description:
    "Conheça os princípios de informação, documentação, participação cidadã, acompanhamento do poder público, sustentabilidade e acesso que orientam o Fora da Pauta.",
};

export default async function LinhaEditorialPage() {
  const caminho = path.join(process.cwd(), "docs", "linha-editorial.md");
  const markdown = await readFile(caminho, "utf8");

  return (
    <main className="min-h-screen bg-[#eeeee9] text-black">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75 transition hover:text-white"
          >
            ← Fora da Pauta
          </Link>

          <p className="mt-12 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFC400]">
            Como trabalhamos
          </p>

          <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl">
            Linha Editorial
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
            Os princípios que orientam pesquisa, documentação, participação
            cidadã, acompanhamento do poder público, sustentabilidade,
            acesso e apresentação das informações no Fora da Pauta.
          </p>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <MarkdownDocument markdown={markdown} />
      </article>
    </main>
  );
}

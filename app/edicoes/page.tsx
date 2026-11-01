import Link from "next/link";
import type { Metadata } from "next";
import { campaigns } from "@/data/campanhas";

export const metadata: Metadata = {
  title: "Edições já publicadas",
  description: "Comece pelo artigo de apresentação e confira as edições publicadas do Fora da Pauta.",
};

const artigoFixo = "quem-decide-o-que-chega-ate-voce";

export default function EdicoesPublicadas() {
  // O artigo de apresentação aparece sempre primeiro, independentemente da data.
  // As demais edições públicas são exibidas da mais recente para a mais antiga.
  const apresentacao = campaigns.find((item) => item.slug === artigoFixo && Boolean(item.publishedAt));
  // A pauta "O que você faria se fosse presidente?" fica preservada no sistema,
  // mas não deve constar na listagem pública de edições.
  const slugsOcultosNaListagem = new Set(["seus-interesses"]);
  const edicoes = campaigns
    .filter((item) => item.slug !== artigoFixo && !slugsOcultosNaListagem.has(item.slug) && Boolean(item.publishedAt))
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  return (
    <main className="min-h-[calc(100svh-58px)] bg-white px-6 py-10 text-black">
      <section className="mx-auto max-w-[720px]">
        <h1 className="text-3xl font-bold tracking-tight">Edições já publicadas</h1>
        <p className="mt-3 text-base text-black/65">Comece conhecendo o projeto. Depois, escolha uma edição para ler ou ouvir.</p>

        {apresentacao ? (
          <Link
            href={`/campanhas/${apresentacao.slug}`}
            className="mt-8 block rounded-xl border-2 border-[#b28d00] bg-[#fffdf4] px-5 py-6 hover:bg-[#fff8df] focus-visible:outline-2 focus-visible:outline-[#b28d00]"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#755900]">
              <span aria-hidden="true">◆</span> Comece por aqui · Artigo fixo
            </span>
            <span className="mt-3 block text-xl font-bold">{apresentacao.title} <span aria-hidden="true">→</span></span>
            <span className="mt-2 block text-sm leading-6 text-black/70">{apresentacao.statement}</span>
          </Link>
        ) : null}

        {edicoes.length > 0 ? (
          <ul className={`${apresentacao ? "mt-5" : "mt-8"} flex flex-col gap-4`}>
            {edicoes.map((item) => (
              <li key={item.slug}>
                <Link href={`/campanhas/${item.slug}`} className="block rounded-xl border border-black/15 px-5 py-5 hover:border-[#b28d00] focus-visible:outline-2 focus-visible:outline-[#b28d00]">
                  <span className="block text-lg font-bold">{item.title} <span aria-hidden="true">→</span></span>
                  <span className="mt-2 block text-sm leading-6 text-black/65">{item.statement}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : !apresentacao ? (
          <p className="mt-8 rounded-xl bg-black/5 p-5">Ainda não há edições publicadas.</p>
        ) : null}
        <Link href="/#opcoes" className="mx-auto mt-8 flex min-h-14 w-full items-center justify-center rounded-2xl bg-black px-5 py-3 text-center text-base font-semibold text-white">Voltar às opções</Link>
      </section>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { campaigns } from "@/data/campanhas";

const TEST_SLUG = "fim-escala-6x1";

export const metadata: Metadata = {
  title: "Teste de publicação | Fora da Pauta",
  robots: { index: false, follow: false },
};

export default async function CampaignRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== TEST_SLUG) notFound();
  const article = campaigns.find(item => item.slug === TEST_SLUG);
  if (!article) notFound();
  return (
    <main className="min-h-screen bg-white px-5 py-10 text-black">
      <article className="mx-auto max-w-3xl">
        <p className="border-l-4 border-yellow-500 bg-yellow-50 p-4 text-sm font-semibold leading-6">
          PUBLICAÇÃO TEMPORÁRIA DE TESTE — Texto do acervo anterior, ainda não revisado para a data atual. Não é uma nova edição editorial.
        </p>
        <h1 className="mt-7 text-3xl font-bold leading-tight">{article.title}</h1>
        <p className="mt-4 text-lg leading-8 text-black/70">{article.statement}</p>
        {article.comparison && (
          <section className="mt-7 rounded-lg border border-black/15 bg-neutral-50 p-5">
            <h2 className="text-lg font-bold">{article.comparison.title}</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div><h3 className="font-bold">{article.comparison.left.label}</h3>{article.comparison.left.lines.map((line,i)=><p key={i} className="mt-2 text-sm">{line}</p>)}</div>
              <div><h3 className="font-bold">{article.comparison.right.label}</h3>{article.comparison.right.lines.map((line,i)=><p key={i} className="mt-2 text-sm">{line}</p>)}</div>
            </div>
            {article.comparison.summary && <p className="mt-4 text-sm leading-6">{article.comparison.summary}</p>}
          </section>
        )}
        {article.sections.map((section, index) => (
          <section key={index} className="mt-9 border-t border-black/10 pt-6">
            {section.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-black/50">{section.eyebrow}</p>}
            <h2 className="mt-2 text-xl font-bold">{section.title}</h2>
            {section.paragraphs.map((paragraph, i) => <p key={i} className="mt-4 whitespace-pre-line leading-8">{paragraph}</p>)}
            {section.references && section.references.length > 0 && (
              <div className="mt-5"><h3 className="font-semibold">Fontes do texto arquivado</h3><ul className="mt-2 space-y-2">{section.references.map((reference,i)=><li key={i}><a className="break-words text-blue-700 underline" href={reference.url} target="_blank" rel="noopener noreferrer">{reference.label}</a></li>)}</ul></div>
            )}
          </section>
        ))}
        <div className="mt-10 flex justify-center"><Link href="/edicoes" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </article>
    </main>
  );
}

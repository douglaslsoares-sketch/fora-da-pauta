import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { campaigns } from "@/data/campanhas";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

function formatarNegrito(texto: string) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((trecho, indice) =>
    trecho.startsWith("**") && trecho.endsWith("**")
      ? <strong key={indice}>{trecho.slice(2, -2)}</strong>
      : trecho
  );
}

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prévia editorial | Fora da Pauta", robots: { index: false, follow: false } };

export default async function PreviaArtigo({ params }: { params: Promise<{ slug: string }> }) {
  const cookieStore = await cookies();
  if (!verifyQuestionsAdminSessionToken(cookieStore.get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin/perguntas");
  const { slug } = await params;
  const artigo = campaigns.find((item) => item.slug === slug);
  if (!artigo) notFound();
  return (
    <main className="min-h-screen bg-white px-5 py-10 text-black">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-black/50">Consulta administrativa — acervo anterior</p>
        <h1 className="mt-4 text-3xl font-bold leading-tight">{artigo.title}</h1>
        <p className="mt-4 text-lg leading-8 text-black/70">{artigo.statement}</p>
        {artigo.comparison && <section className="mt-9 rounded-lg border border-black/15 bg-[#f5f5f0] p-6">
          {artigo.comparison.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-black/50">{artigo.comparison.eyebrow}</p>}
          <h2 className="mt-2 text-xl font-bold">{artigo.comparison.title}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-4"><h3 className="font-bold">{artigo.comparison.left.label}</h3>{artigo.comparison.left.lines.map((line, i) => <p key={i} className="mt-2">{line}</p>)}</div>
            <div className="rounded-lg bg-white p-4"><h3 className="font-bold">{artigo.comparison.right.label}</h3>{artigo.comparison.right.lines.map((line, i) => <p key={i} className="mt-2">{line}</p>)}{artigo.comparison.right.emphasis && <p className="mt-3 font-semibold">{artigo.comparison.right.emphasis}</p>}</div>
          </div>
          <p className="mt-4 text-center text-sm font-bold uppercase tracking-wide">{artigo.comparison.connector}</p>
          {artigo.comparison.summary && <p className="mt-5 leading-7">{formatarNegrito(artigo.comparison.summary)}</p>}
        </section>}
        {artigo.sections.map((section, index) => (
          <section key={index} className="mt-9 border-t border-black/10 pt-6">
            {section.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-black/50">{section.eyebrow}</p>}
            <h2 className="mt-2 text-xl font-bold">{section.title}</h2>
            {section.paragraphs.map((paragraph, i) => <p key={i} className="mt-4 whitespace-pre-line leading-8">{formatarNegrito(paragraph)}</p>)}
            {section.references && section.references.length > 0 && <div className="mt-5"><h3 className="font-semibold">Fontes</h3><ul className="mt-2 space-y-2">{section.references.map((reference, i) => <li key={i}><a className="break-words text-blue-700 underline" href={reference.url} target="_blank" rel="noopener noreferrer">{reference.label}</a></li>)}</ul></div>}
          </section>
        ))}
        <div className="mt-10 flex justify-center"><Link href="/admin/artigos" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </article>
    </main>
  );
}

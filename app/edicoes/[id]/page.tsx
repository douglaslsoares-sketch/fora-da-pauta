import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sql } from "@/lib/interesses/db";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Artigo | Fora da Pauta" };
type Article = { titulo: string; resumo: string; conteudo: string; fontes: string };
export default async function PublicArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) notFound();
  let artigo: Article | undefined;
  try {
    const rows = await sql<Article[]>`
      SELECT titulo, resumo, conteudo, fontes FROM public.admin_artigos
      WHERE id = ${id}::uuid AND status = 'publicado' LIMIT 1
    `;
    artigo = rows[0];
  } catch {
    return <main className="mx-auto max-w-3xl p-8">Não foi possível abrir o artigo agora.</main>;
  }
  if (!artigo) notFound();
  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[#171717]">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-widest">Fora da Pauta</p>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{artigo.titulo}</h1>
        {artigo.resumo && <p className="mt-5 text-lg leading-8 text-black/70">{artigo.resumo}</p>}
        <div className="mt-10 space-y-6 leading-8">{artigo.conteudo.split(/\n\s*\n/).filter(Boolean).map((p,i) => <p key={i} className="whitespace-pre-line">{p}</p>)}</div>
        <section className="mt-12 border-t border-black/20 pt-7">
          <h2 className="text-xl font-bold">Fontes e referências</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6">{artigo.fontes.split("\n").map(s=>s.trim()).filter(Boolean).map((s,i)=><li key={i} className="break-words">{s}</li>)}</ul>
        </section>
        <div className="mt-12 flex justify-center"><Link href="/edicoes" className="rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </article>
    </main>
  );
}

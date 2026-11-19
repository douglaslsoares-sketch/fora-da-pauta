import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sql } from "@/lib/interesses/db";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Artigo | Fora da Pauta" };
type Article = { titulo: string; resumo: string; conteudo: string; fontes: string; audio_url: string };
export default async function PublicArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) notFound();
  let artigo: Article | undefined;
  try {
    const rows = await sql<Article[]>`
      SELECT titulo, resumo, conteudo, fontes, audio_url FROM public.admin_artigos
      WHERE id = ${id}::uuid AND status = 'publicado' LIMIT 1
    `;
    artigo = rows[0];
  } catch {
    return <main className="mx-auto max-w-3xl p-8">Não foi possível abrir o artigo agora.</main>;
  }
  if (!artigo) notFound();
  const paragrafos = artigo.conteudo.split(/\\n\\s*\\n/).filter(Boolean);
  const fontes = artigo.fontes.split("\\n").map(s => s.trim()).filter(Boolean);
  return (
    <main className="min-h-screen bg-[#f7f7f3] px-5 py-10 text-[#171717] sm:py-14">
      <article className="mx-auto max-w-3xl rounded-xl bg-white px-5 py-8 sm:px-10 sm:py-12">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#183352]">Fora da Pauta</p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{artigo.titulo}</h1>
        {artigo.resumo && <p className="mt-5 text-lg leading-8 text-black/70">{artigo.resumo}</p>}
        {artigo.audio_url && <section className="mt-8 rounded-xl border border-[#d5dce4] bg-[#f3f6f9] p-5">
          <h2 className="text-base font-bold text-[#183352]">Ouvir este artigo</h2>
          <p className="mt-1 text-sm text-black/65">Áudio completo, com controles para pausar e retomar.</p>
          <audio controls preload="none" src={artigo.audio_url} className="mt-4 w-full" aria-label="Ouvir o artigo completo">
            Seu navegador não oferece reprodução de áudio.
          </audio>
        </section>}
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

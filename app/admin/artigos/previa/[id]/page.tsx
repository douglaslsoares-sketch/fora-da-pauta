import Link from "next/link";
import PrivateVoiceTest from "@/components/PrivateVoiceTest";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prévia editorial | Fora da Pauta", robots: { index: false, follow: false } };

type Article = { titulo: string; resumo: string; conteudo: string; fontes: string; audio_url: string; status: string };
export default async function PreviewArticle({ params }: { params: Promise<{ id: string }> }) {
  const store = await cookies();
  if (!verifyQuestionsAdminSessionToken(store.get(QUESTIONS_ADMIN_COOKIE)?.value)) redirect("/admin/perguntas");
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) notFound();
  let article: Article | undefined;
  try {
    const rows = await sql<Article[]>`
      SELECT titulo, resumo, conteudo, fontes, audio_url, status FROM public.admin_artigos WHERE id = ${id}::uuid LIMIT 1
    `;
    article = rows[0];
  } catch {
    return <main className="mx-auto max-w-3xl p-8"><p>Não foi possível carregar a prévia neste momento.</p><Link href="/admin/artigos" className="underline">Voltar aos artigos</Link></main>;
  }
  if (!article) notFound();
  const paragraphs = article.conteudo.split(/\n\s*\n/).filter(Boolean);
  const sources = article.fontes.split("\n").map(s => s.trim()).filter(Boolean);
  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[#171717]">
      <article className="mx-auto max-w-3xl">
        <div className="rounded-lg border-2 border-yellow-500 bg-yellow-50 p-4 text-sm font-semibold">PRÉVIA PRIVADA — NÃO PUBLICADO · Situação: {article.status}</div>
        <p className="mt-9 text-sm font-bold uppercase tracking-widest">Fora da Pauta</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{article.titulo}</h1>
        {article.resumo && <p className="mt-5 text-lg leading-8 text-black/70">{article.resumo}</p>}
        <PrivateVoiceTest articleId={id} />
        {article.audio_url && <section className="mt-8 rounded-xl border border-[#d5dce4] bg-[#f3f6f9] p-5">
          <h2 className="text-base font-bold text-[#183352]">Ouvir gravação — teste privado</h2>
          <p className="mt-1 text-sm text-black/65">A reprodução nesta prévia não publica o áudio nem o artigo.</p>
          <audio controls preload="none" src={article.audio_url} className="mt-4 w-full" aria-label="Testar áudio do artigo">
            Seu navegador não oferece reprodução de áudio.
          </audio>
        </section>}
        <div className="mt-10 space-y-6 text-base leading-8">
          {paragraphs.map((paragraph, i) => <p key={i} className="whitespace-pre-line">{paragraph}</p>)}
        </div>
        <section className="mt-12 border-t border-black/20 pt-7">
          <h2 className="text-xl font-bold">Fontes e referências</h2>
          {sources.length ? <ul className="mt-4 list-disc space-y-3 pl-6">{sources.map((source, i) => <li key={i} className="break-words">{source}</li>)}</ul> : <p className="mt-4 text-black/60">Nenhuma fonte informada.</p>}
        </section>
        <div className="mt-12 flex justify-center"><Link href="/admin/artigos" className="rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar prévia</Link></div>
      </article>
    </main>
  );
}

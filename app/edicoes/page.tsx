import Link from "next/link";
import type { Metadata } from "next";
import { sql } from "@/lib/interesses/db";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edições | Fora da Pauta", description: "Análises e artigos publicados pelo Fora da Pauta." };
type Article = { id: string; titulo: string; resumo: string; updated_at: string };
export default async function EdicoesPublicadas() {
  let artigos: Article[] = [];
  let error = false;
  try {
    artigos = await sql<Article[]>`SELECT id::text, titulo, resumo, updated_at::text FROM public.admin_artigos WHERE status = 'publicado' ORDER BY updated_at DESC LIMIT 100`;
  } catch (e) {
    // A tabela ainda pode não existir antes do primeiro acesso ao editor.
    error = true;
  }
  return (
    <main className="min-h-[calc(100svh-58px)] bg-white px-6 py-10 text-black">
      <section className="mx-auto max-w-[720px]">
        <h1 className="text-2xl font-bold">Edições publicadas</h1>
        {error ? <p className="mt-5 leading-7">Não foi possível consultar as edições agora. Tente novamente mais tarde.</p> : artigos.length === 0 ? <p className="mt-5 leading-7">Novas análises em preparação. O Fora da Pauta investiga acontecimentos, apresenta fontes e explica seus impactos na vida das pessoas.</p> : (
          <div className="mt-7 space-y-4">{artigos.map(artigo => (
            <article key={artigo.id} className="rounded-lg border border-black/15 p-5">
              <h2 className="text-xl font-bold">{artigo.titulo}</h2>
              {artigo.resumo && <p className="mt-2 leading-7">{artigo.resumo}</p>}
              <Link className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-black px-5 py-2 font-semibold text-white" href={`/edicoes/${artigo.id}`}>Ler artigo</Link>
            </article>
          ))}</div>
        )}
        <div className="mt-8 flex justify-center"><Link href="/central" className="inline-flex min-h-12 items-center rounded-lg bg-red-600 px-7 py-3 font-semibold text-white">× Fechar</Link></div>
      </section>
    </main>
  );
}

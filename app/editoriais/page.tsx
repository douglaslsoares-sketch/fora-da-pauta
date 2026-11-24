import Link from "next/link";
import { listarPublicacoes, type Publicacao } from "@/lib/editoriais/publicacoes";
export const dynamic = "force-dynamic";
export default async function Editoriais() {
 let artigos: Publicacao[] | null = null;
 try { artigos = await listarPublicacoes(); } catch { /* Não confundir falha com acervo vazio. */ }
 return <main className="mx-auto max-w-3xl px-5 py-8">
 <header className="mb-8 text-center">
 <img src="/editoriais/icone.svg" alt="" width={84} height={84} className="mx-auto"/>
 <h1 className="text-4xl font-extrabold">Editoriais</h1>
 <p className="mt-2 text-xs tracking-widest">ANÁLISES <span className="text-red-500">●</span> CONTEXTO <span className="text-red-500">●</span> BASTIDORES</p>
 </header>
 {artigos === null ? <p>Não foi possível consultar as publicações agora.</p> : artigos.length === 0 ? <p className="text-center text-slate-300">Em breve, nossas primeiras publicações.</p> : <>
 <article className="rounded-2xl border border-[#f5ce42] p-6">
 <p className="text-xs font-bold text-[#f5ce42]">ÚLTIMA PUBLICAÇÃO</p>
 <h2 className="my-3 text-3xl font-bold">{artigos[0].titulo}</h2><p>{artigos[0].resumo}</p>
 <Link className="mt-5 inline-block rounded-lg bg-[#f5ce42] px-6 py-3 font-bold text-[#0b1c2d]" href={"/editoriais/"+artigos[0].id}>Ler</Link>
 </article>
 {artigos.length > 1 && <section className="mt-8"><h2 className="text-xl font-bold">Publicações anteriores</h2>{artigos.slice(1).map(a=><article key={a.id} className="border-b border-slate-600 py-5"><Link href={"/editoriais/"+a.id} className="text-lg font-bold">{a.titulo}</Link><p className="mt-2 text-slate-300">{a.resumo}</p></article>)}</section>}
 </>}
 </main>;
}

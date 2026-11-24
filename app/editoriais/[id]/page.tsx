import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarPublicacao } from "@/lib/editoriais/publicacoes";
export const dynamic = "force-dynamic";
export default async function Artigo({params}:{params:Promise<{id:string}>}) {
 const {id}=await params;
 const artigo=await buscarPublicacao(id);
 if(!artigo) notFound();
 return <main className="mx-auto max-w-3xl px-5 py-8">
 <Link href="/editoriais" className="text-[#f5ce42]">Editoriais</Link>
 <article className="mt-6"><h1 className="text-3xl font-bold">{artigo.titulo}</h1><p className="mt-4 text-lg text-slate-300">{artigo.resumo}</p>
 <div className="mt-8 whitespace-pre-wrap leading-8">{artigo.conteudo}</div>
 {artigo.fontes && <section className="mt-8 border-t border-slate-600 pt-5"><h2 className="text-xl font-bold">Fontes e referências</h2><p className="mt-3 whitespace-pre-wrap break-words">{artigo.fontes}</p></section>}
 </article><Link href="/editoriais" className="mt-8 inline-block rounded-lg bg-red-700 px-6 py-3 font-bold text-white">× Fechar</Link>
 </main>;
}

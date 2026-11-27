import EditorialLeitura from "@/components/EditorialLeitura";
import EditorialTexto from "@/components/EditorialTexto";
import EditorialComentarios from "@/components/EditorialComentarios";
import Link from "next/link";
import {notFound} from "next/navigation";
import {buscarPublicado} from "../acervo";
export const dynamic = 'force-dynamic';
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const a=await buscarPublicado(slug);if(!a)notFound();
 const minutos=Math.max(1,Math.ceil(a.texto.join(" ").trim().split(/\s+/).length/200));
 return <main className="mx-auto max-w-xl p-5">
 <header className="relative mb-5 border-b border-slate-600 pb-4"><Link href="/editoriais" aria-label="Voltar para Editoriais" className="absolute left-0 top-2 text-2xl">←</Link><h1 className="text-center text-5xl font-extrabold tracking-tight">Editorial</h1></header>
 <img src={a.capa} referrerPolicy="no-referrer" alt={a.titulo} className="w-full rounded-xl"/><h2 className="mt-5 text-3xl font-bold leading-tight">{a.titulo}</h2>
 {a.resumo&&<p className="mt-3 text-slate-300">{a.resumo}</p>}<EditorialLeitura audio={a.audio}>
 <p className="mb-4 border-b border-slate-600 pb-4 text-sm text-slate-300"><time dateTime={a.publicadoEm}>{new Date(a.publicadoEm.slice(0,10)+"T12:00:00Z").toLocaleDateString("pt-BR",{dateStyle:"long",timeZone:"America/Sao_Paulo"})}</time> · Leitura: {minutos} min</p>
 </EditorialLeitura>
 <article id="texto" className="scroll-mt-4 text-lg leading-relaxed"><EditorialTexto texto={a.texto.join("\n\n")}/></article>
 {a.fontes.length>0&&<section className="mt-8 border-t border-slate-600 pt-5"><h2 className="font-bold">Fontes e referências</h2><ul className="mt-3 space-y-2">{a.fontes.map((s,i)=><li key={i} className="break-words">{s}</li>)}</ul></section>}<EditorialComentarios slug={a.id}/><Link href="/editoriais" className="mt-8 block text-center text-[#F4C64D]">← Voltar</Link></main>
}
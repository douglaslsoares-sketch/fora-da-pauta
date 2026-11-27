import EditorialComentarios from "@/components/EditorialComentarios";
import Link from "next/link";
import {notFound} from "next/navigation";
import {buscarPublicado} from "../acervo";
export const dynamic = 'force-dynamic';
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const a=await buscarPublicado(slug);if(!a)notFound();
 const minutos=Math.max(1,Math.ceil(a.texto.join(" ").trim().split(/\s+/).length/200));
 return <main className="mx-auto max-w-xl p-5">
 <header className="relative mb-5 border-b border-slate-600 pb-4"><Link href="/editoriais" aria-label="Voltar para Editoriais" className="absolute left-0 top-2 text-2xl">←</Link><img src="/marca/editoriais-gabarito.png" alt="Editoriais" className="mx-auto w-4/5 max-w-[300px]"/></header>
 <img src={a.capa} referrerPolicy="no-referrer" alt={a.titulo} className="w-full rounded-xl"/><h1 className="mt-5 text-3xl font-bold leading-tight">{a.titulo}</h1>
 {a.resumo&&<p className="mt-3 text-slate-300">{a.resumo}</p>}<nav className="my-5 flex flex-wrap gap-3">{a.audio&&<a href="#audio" className="flex-1 rounded-xl bg-[#F4C64D] p-3 text-center font-bold text-[#0C192B]">▶ Ouvir o editorial</a>}<a href="#texto" className="flex-1 rounded-xl border border-slate-400 p-3 text-center font-semibold">Ler no texto</a></nav>
 <p className="mb-4 border-b border-slate-600 pb-4 text-sm text-slate-300"><time dateTime={a.publicadoEm}>{new Date(a.publicadoEm.slice(0,10)+"T12:00:00Z").toLocaleDateString("pt-BR",{dateStyle:"long",timeZone:"America/Sao_Paulo"})}</time> · Leitura: {minutos} min</p>
 {a.audio&&<audio id="audio" controls preload="none" src={a.audio} className="w-full"/>}
 <article id="texto" className="scroll-mt-4 text-lg leading-relaxed">{a.texto.map((p,i)=><p key={i} className="my-5">{p}</p>)}</article>
 {a.fontes.length>0&&<section className="mt-8 border-t border-slate-600 pt-5"><h2 className="font-bold">Fontes e referências</h2><ul className="mt-3 space-y-2">{a.fontes.map((s,i)=><li key={i} className="break-words">{s}</li>)}</ul></section>}<EditorialComentarios slug={a.id}/><Link href="/editoriais" className="mt-8 block text-center text-[#F4C64D]">← Voltar</Link></main>
}
import EditorialLeitura from "@/components/EditorialLeitura";
import EditorialTexto from "@/components/EditorialTexto";
import EditorialComentarios from "@/components/EditorialComentarios";
import Link from "next/link";
import type {Metadata} from "next";
import {cache} from "react";
import {notFound} from "next/navigation";
import {buscarPublicado} from "../acervo";
export const dynamic = 'force-dynamic';
const carregarEditorial=cache(buscarPublicado);
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const artigo=await carregarEditorial(slug);
 if(!artigo)return {title:"Editorial não encontrado",robots:{index:false,follow:false}};
 const url="https://foradapauta.org/editoriais/"+encodeURIComponent(artigo.slug);
 const description=artigo.resumo.trim();
 return {
   title:{absolute:artigo.titulo+" | ForaDaPauta.org"},
   description,
   alternates:{canonical:url},
   openGraph:{
     type:"article",title:artigo.titulo,description,url,
     siteName:"Fora da Pauta",locale:"pt_BR",
     publishedTime:new Date(artigo.publicadoEm).toISOString(),
     images:[{url:artigo.capa,alt:artigo.titulo}]
   },
   twitter:{card:"summary_large_image",title:artigo.titulo,description,images:[artigo.capa]}
 };
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const a=await carregarEditorial(slug);if(!a)notFound();
 const minutos=Math.max(1,Math.ceil(a.texto.join(" ").trim().split(/\s+/).length/200));
 return <main className="mx-auto max-w-xl p-5">
 <header className="mb-3 flex items-center"><Link href="/editoriais" aria-label="Voltar para Editoriais" className="inline-flex min-h-11 min-w-11 items-center text-2xl">←</Link><h1 className="sr-only">{a.titulo}</h1></header>
 <img src={a.capa} referrerPolicy="no-referrer" alt={a.titulo} className="w-full rounded-xl"/>
 {a.resumo&&<p className="mt-3 text-slate-300">{a.resumo}</p>}<EditorialLeitura audio={a.audio}>
 <p className="mb-4 border-b border-slate-600 pb-4 text-sm text-slate-300"><time dateTime={a.publicadoEm}>{new Date(a.publicadoEm.slice(0,10)+"T12:00:00Z").toLocaleDateString("pt-BR",{dateStyle:"long",timeZone:"America/Sao_Paulo"})}</time> · Leitura: {minutos} min</p>
 </EditorialLeitura>
 <article id="texto" className="scroll-mt-4 text-lg leading-relaxed"><EditorialTexto texto={a.texto.join("\n\n")}/></article>
 {a.fontes.length>0&&<section className="mt-8 border-t border-slate-600 pt-5"><h2 className="font-bold">Fontes e referências</h2><ul className="mt-3 space-y-2">{a.fontes.map((s,i)=><li key={i} className="break-words">{s}</li>)}</ul></section>}<EditorialComentarios slug={a.id}/><Link href="/editoriais" className="mt-8 block text-center text-[#F4C64D]">← Voltar</Link></main>
}
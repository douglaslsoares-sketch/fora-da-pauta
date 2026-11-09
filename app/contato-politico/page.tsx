"use client";
import Link from "next/link";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { useEffect, useState } from "react";

// Endereços publicados pela Assembleia Legislativa de Santa Catarina.
// Nunca deduzir e-mail a partir do nome ou de dados fornecidos na URL.
const contatos: Record<string, {email:string; fonte:string}> = {};
function normalizar(v:string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim().replace(/\s+/g," ");}
const oficiais:Record<string,{email:string;fonte:string}>=Object.fromEntries(Object.entries(contatos).map(([nome,valor])=>[normalizar(nome),valor]));
export default function ContatoPolitico() {
  const [dados,setDados]=useState({id:"",nome:"",cargo:"",uf:"",partido:""});
  const [mensagem,setMensagem]=useState("");
  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    setDados({id:(p.get("id")||"").slice(0,60),nome:(p.get("nome")||"").slice(0,120),cargo:(p.get("cargo")||"").slice(0,100),uf:(p.get("uf")||"").slice(0,2),partido:(p.get("partido")||"").slice(0,30)});
  },[]);
  const contato=dados.uf.toUpperCase()==="SC" && /deputad/i.test(dados.cargo) ? oficiais[normalizar(dados.nome)] : undefined;
  const busca=[dados.nome,dados.cargo,dados.uf,"contato gabinete site oficial"].filter(Boolean).join(" ");
  const assunto="Mensagem de cidadão para "+dados.nome;
  const email=contato ? "mailto:"+contato.email+"?subject="+encodeURIComponent(assunto)+"&body="+encodeURIComponent(mensagem) : "";
  return <main className="min-h-screen bg-white px-5 py-10 text-black"><section className="mx-auto max-w-2xl">
    <h1 className="text-3xl font-extrabold">Entrar em contato</h1>
    {dados.nome?<div className="mt-6 flex items-start gap-4">{dados.id?<CandidatePhoto id={dados.id} name={dados.nome}/>:null}<div className="min-w-0"><h2 className="text-2xl font-bold">{dados.nome}</h2><p className="mt-2 text-black/70">{[dados.cargo,dados.uf,dados.partido].filter(Boolean).join(" · ")}</p></div></div>:null}
    <label htmlFor="mensagem-politico" className="mt-8 block text-xl font-bold">O que você gostaria de dizer a este político?</label>
    <textarea id="mensagem-politico" value={mensagem} onChange={e=>setMensagem(e.target.value)} maxLength={5000} rows={7} placeholder="Escreva aqui sua pergunta, sugestão ou cobrança..." className="mt-4 w-full rounded-xl border border-black/30 p-4 text-lg"/>
    {contato ? <>
      <p className="mt-4 text-base">Contato publicado no site oficial: <strong className="break-all">{contato.email}</strong></p>
      <a href={contato.fonte} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block underline">Conferir fonte oficial</a>
      <a href={mensagem.trim()?email:undefined} aria-disabled={!mensagem.trim()} onClick={e=>{if(!mensagem.trim())e.preventDefault();}} className={"mt-6 flex min-h-14 items-center justify-center rounded-lg px-5 py-3 text-center font-bold "+(mensagem.trim()?"bg-[#ffd700] text-black":"bg-black/10 text-black/40")}>Preparar e-mail para enviar</a>
      <p className="mt-3 text-sm text-black/60">Seu aplicativo de e-mail será aberto com a mensagem preenchida. Confira o destinatário e toque em Enviar no aplicativo. O Fora da Pauta não envia a mensagem automaticamente.</p>
    </> : <>
      <div className="mt-5 rounded-xl border border-black/15 bg-black/[0.04] p-4"><p className="font-bold">Contato oficial ainda não verificado</p><p className="mt-2 text-sm">Você pode escrever sua mensagem aqui, mas o envio não está disponível enquanto não confirmarmos o canal institucional. Copie seu texto antes de sair desta página.</p></div>
      <button type="button" disabled={!mensagem.trim()} onClick={()=>navigator.clipboard?.writeText(mensagem)} className="mt-4 flex min-h-14 w-full items-center justify-center rounded-lg border border-black/20 px-5 font-bold disabled:opacity-40">Copiar minha mensagem</button>
      {dados.nome?<a href={"https://www.google.com/search?q="+encodeURIComponent(busca)} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-14 items-center justify-center rounded-lg bg-[#ffd700] px-5 py-3 text-center font-bold">Procurar contato oficial</a>:null}
      <p className="mt-3 text-sm text-black/60">A pesquisa externa não garante que os resultados sejam oficiais.</p>
    </>}
    <div className="mt-10 flex justify-center"><Link href="/minhas-escolhas" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#c62828] px-8 py-3 text-lg font-bold text-white">✕ Fechar</Link></div>
  </section></main>;
}

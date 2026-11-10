"use client";
import Link from "next/link";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { useEffect, useState } from "react";

// Contatos e exercício do mandato conferidos na relação da legislatura atual da ALESC.
// Adicionar outros parlamentares somente após verificar exercício atual e endereço institucional.
const fonteAlesc = "https://www.alesc.sc.gov.br/deputados/";
const contatosSC: Record<string,string> = {};
function normalizar(v:string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim().replace(/\s+/g," ");}
export default function ContatoPolitico() {
  const [dados,setDados]=useState({id:"",nome:"",cargo:"",uf:"",partido:""});
  const [mensagem,setMensagem]=useState("");
  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    setDados({id:(p.get("id")||"").slice(0,60),nome:(p.get("nome")||"").slice(0,120),cargo:(p.get("cargo")||"").slice(0,100),uf:(p.get("uf")||"").slice(0,2),partido:(p.get("partido")||"").slice(0,30)});
  },[]);
  const nomeNormalizado=normalizar(dados.nome);
  const semMandato=nomeNormalizado==="AANDERSON BATATA" && dados.uf.toUpperCase()==="SC";
  const emailOficial=dados.uf.toUpperCase()==="SC" && /deputad/i.test(dados.cargo) && !semMandato ? contatosSC[nomeNormalizado] : undefined;
  const assunto="Mensagem de cidadão para "+dados.nome;
  const email=emailOficial ? "mailto:"+emailOficial+"?subject="+encodeURIComponent(assunto)+"&body="+encodeURIComponent(mensagem) : "";
  return <main className="min-h-screen bg-white px-5 py-10 text-black"><section className="mx-auto max-w-2xl">
    <h1 className="text-3xl font-extrabold">Entrar em contato</h1>
    {dados.nome?<div className="mt-6 flex items-start gap-4">{dados.id?<CandidatePhoto id={dados.id} name={dados.nome}/>:null}<div className="min-w-0"><h2 className="text-2xl font-bold">{dados.nome}</h2><p className="mt-2 text-black/70">{[dados.cargo,dados.uf,dados.partido].filter(Boolean).join(" · ")}</p></div></div>:null}
    {emailOficial ? <>
      <label htmlFor="mensagem-politico" className="mt-8 block text-xl font-bold">O que você gostaria de dizer a este político?</label>
      <textarea id="mensagem-politico" value={mensagem} onChange={e=>setMensagem(e.target.value)} maxLength={5000} rows={7} placeholder="Escreva aqui sua pergunta, sugestão ou cobrança..." className="mt-4 w-full rounded-xl border border-black/30 p-4 text-lg"/>
      <p className="mt-4 text-base">E-mail de contato divulgado pelo órgão público: <strong className="break-all">{emailOficial}</strong></p>
      <p className="mt-2 text-sm text-black/60">Fonte: <a className="underline" href={fonteAlesc} target="_blank" rel="noopener noreferrer">Assembleia Legislativa de Santa Catarina</a></p>
      <a href={mensagem.trim()?email:undefined} aria-disabled={!mensagem.trim()} onClick={e=>{if(!mensagem.trim())e.preventDefault();}} className={"mt-6 flex min-h-14 items-center justify-center rounded-lg px-5 py-3 text-center font-bold "+(mensagem.trim()?"bg-[#ffd700] text-black":"bg-black/10 text-black/40")}>Preparar e-mail para enviar</a>
      <p className="mt-3 text-sm text-black/60">Seu aplicativo de e-mail será aberto com o destinatário e a mensagem preenchidos. Confira e toque em Enviar no aplicativo. O Fora da Pauta não envia automaticamente.</p>
    </> : <div className="mt-8 rounded-xl border border-black/15 bg-black/[0.04] p-5">
      <h3 className="text-xl font-bold">Contato indisponível</h3>
      <p className="mt-3 leading-7">{semMandato?"Este político não exerce mandato atualmente. Por isso, o Fora da Pauta não disponibiliza um canal de contato institucional.":"Ainda não foi possível confirmar o exercício de mandato e um e-mail institucional para este político. O contato ficará indisponível até a verificação."}</p>
    </div>}
    <div className="mt-10 flex justify-center"><Link href="/minhas-escolhas" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#c62828] px-8 py-3 text-lg font-bold text-white">✕ Fechar</Link></div>
  </section></main>;
}

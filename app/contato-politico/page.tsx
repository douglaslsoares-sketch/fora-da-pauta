"use client";
import Link from "next/link";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { GravadorRecado } from "@/components/GravadorRecado";
import { useEffect, useState } from "react";
type Resultado={nome:string;cargo:string;uf:string;partido:string;situacao:"mandato_atual"|"eleito_aguardando_posse"|"nao_eleito"|"nao_confirmado";contato:{email:string;cargo:string;fonte:string}|null};
export default function ContatoPolitico(){
  const [id,setId]=useState("");
  const [dados,setDados]=useState<Resultado|null>(null);
  const [carregando,setCarregando]=useState(true);
  const [mensagem,setMensagem]=useState("");
  useEffect(()=>{
    const idAtual=new URLSearchParams(window.location.search).get("id")||"";
    setId(idAtual);
    if(!/^\d{8,20}$/.test(idAtual)){setCarregando(false);return;}
    const controller=new AbortController();
    fetch("/api/contato-politico?id="+encodeURIComponent(idAtual),{signal:controller.signal,cache:"no-store"})
      .then(r=>{if(!r.ok)throw Error("Falha na consulta");return r.json();})
      .then((d:Resultado)=>setDados(d))
      .catch(()=>setDados(null))
      .finally(()=>setCarregando(false));
    return ()=>controller.abort();
  },[]);
  const aviso=dados?.situacao==="nao_eleito"?"Este candidato não foi eleito nas eleições de 2026. Se não exerce outro mandato, não há contato institucional a disponibilizar.":dados?.situacao==="eleito_aguardando_posse"?"Este político foi eleito, mas ainda não tomou posse no novo cargo. Não encontramos um contato institucional verificado de mandato atualmente exercido.":dados?.situacao==="nao_confirmado"?"O resultado eleitoral ou o exercício de mandato atual ainda não foi confirmado. O contato institucional ficará indisponível até a verificação.":"Não foi possível consultar os dados deste político agora.";
  const contato=dados?.contato;
  const email=contato?"mailto:"+contato.email+"?subject="+encodeURIComponent("Mensagem de cidadão para "+dados?.nome)+"&body="+encodeURIComponent(mensagem):"";
  return <main className="min-h-screen bg-white px-5 pb-10 pt-24 text-black"><section className="mx-auto max-w-2xl">
    <h1 className="text-3xl font-extrabold">Mandar um recado</h1>
    {dados?<div className="mt-6 flex items-start gap-4">{id?<CandidatePhoto id={id} name={dados.nome}/>:null}<div className="min-w-0"><h2 className="text-2xl font-bold">{dados.nome}</h2><p className="mt-2 text-black/70">{[dados.cargo,dados.uf,dados.partido].filter(Boolean).join(" · ")}</p></div></div>:null}
    {carregando?<p className="mt-8" role="status">Verificando resultado eleitoral e mandato...</p>:contato?<>
      <div className="mt-7 rounded-xl border border-black/15 bg-black/[0.04] p-4"><p className="font-bold">Mandato atual: {contato.cargo}.</p><p className="mt-2">O contato abaixo corresponde ao mandato atualmente exercido, não necessariamente ao cargo disputado em 2026.</p></div>
      <GravadorRecado nome={dados?.nome || "este político"} email={contato.email} />
      <details className="mt-6"><summary className="cursor-pointer font-semibold underline">Prefiro escrever</summary>
      <label htmlFor="mensagem-politico" className="mt-8 block text-xl font-bold">O que você gostaria de dizer a este político?</label>
      <textarea id="mensagem-politico" value={mensagem} onChange={e=>setMensagem(e.target.value)} maxLength={5000} rows={7} placeholder="Escreva aqui sua pergunta, sugestão ou cobrança..." className="mt-4 w-full rounded-xl border border-black/30 p-4 text-lg"/>
      <p className="mt-4">E-mail institucional: <strong className="break-all">{contato.email}</strong></p>
      <a href={contato.fonte} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block underline">Fonte institucional</a>
      <a href={mensagem.trim()?email:undefined} aria-disabled={!mensagem.trim()} onClick={e=>{if(!mensagem.trim())e.preventDefault();}} className={"mt-6 flex min-h-14 items-center justify-center rounded-lg px-5 py-3 text-center font-bold "+(mensagem.trim()?"bg-[#ffd700] text-black":"bg-black/10 text-black/40")}>Preparar e-mail para enviar</a>
      <p className="mt-3 text-sm text-black/60">Seu aplicativo de e-mail abrirá com a mensagem preenchida. Confira e confirme o envio.</p></details>
    </>:<div className="mt-8 rounded-xl border border-black/15 bg-black/[0.04] p-5"><h3 className="text-xl font-bold">Contato indisponível</h3><p className="mt-3 leading-7">{aviso}</p></div>}
    <div className="mt-10 flex justify-center"><Link href="/minhas-escolhas" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#c62828] px-8 py-3 text-lg font-bold text-white">✕ Fechar</Link></div>
  </section></main>;
}

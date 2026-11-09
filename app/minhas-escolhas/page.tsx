"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CandidatePhoto } from "@/components/CandidatePhoto";

type Pessoa = { id: string; nomeUrna: string; cargoLabel?: string; uf?: string; siglaPartido?: string };
export default function Page(){
  const [pessoas,setPessoas]=useState<Pessoa[]>([]);
  const [status,setStatus]=useState("Consultando suas escolhas...");
  const [removendo,setRemovendo]=useState<string[]>([]);
  const [erro,setErro]=useState("");
  const [semVinculo,setSemVinculo]=useState(false);
  const [vinculando,setVinculando]=useState(false);
  const carregar=useCallback(async()=>{
    try{
      const resposta=await fetch("/api/telegram/sessao",{cache:"no-store",credentials:"same-origin"});
      if(!resposta.ok)throw Error("Não foi possível consultar suas escolhas.");
      const dados=await resposta.json();
      if(dados.ativo!==true){
        setSemVinculo(true);
        setPessoas([]);
        setStatus("Não foi possível consultar sua lista neste navegador.");
        return;
      }
      setSemVinculo(false);
      setVinculando(false);
      setPessoas(Array.isArray(dados.pessoas)?dados.pessoas:[]);
      setStatus("");
    }catch{setStatus("Não foi possível consultar suas escolhas agora.");}
  },[]);
  useEffect(()=>{void carregar();const aoVoltar=()=>void carregar();window.addEventListener("focus",aoVoltar);const intervalo=window.setInterval(()=>{if(document.visibilityState==="visible")void carregar();},5000);return ()=>{window.removeEventListener("focus",aoVoltar);window.clearInterval(intervalo);};},[carregar]);
  async function reconectar(){
    if(vinculando)return;
    setVinculando(true);setErro("");
    try{
      const r=await fetch("/api/telegram/sessao",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:[]})});
      const d=await r.json().catch(()=>null);
      if(!r.ok||typeof d?.url!=="string")throw Error(d?.erro||"Não foi possível iniciar o vínculo.");
      const url=new URL(d.url);
      if(url.origin!=="https://t.me"||url.pathname!=="/ForaDaPautaAcompanhaBot"||!/^\?start=s_[A-Za-z0-9_-]{32}$/.test(url.search))throw Error("Endereço do Telegram inválido.");
      window.location.assign(url.toString());
    }catch(e){setErro(e instanceof Error?e.message:"Não foi possível abrir o Telegram.");setVinculando(false);}
  }
  async function remover(pessoa:Pessoa){
    if(removendo.includes(pessoa.id))return;
    setErro("");
    setRemovendo(a=>[...a,pessoa.id]);
    try{
      const resposta=await fetch("/api/telegram/sessao",{
        method:"DELETE",credentials:"same-origin",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:pessoa.id})
      });
      const dados=await resposta.json().catch(()=>null);
      if(!resposta.ok||dados?.removido!==true)throw Error(dados?.erro||"Não foi possível remover.");
      setPessoas(a=>a.filter(p=>p.id!==pessoa.id));
    }catch(e){setErro(e instanceof Error?e.message:"Não foi possível remover.");}
    finally{setRemovendo(a=>a.filter(id=>id!==pessoa.id));}
  }
  return <main className="min-h-screen bg-white px-5 py-10 text-black"><div className="mx-auto max-w-2xl">
    <h1 className="text-3xl font-extrabold">Políticos que eu acompanho</h1>
    {status?<p role="status" className="mt-6">{status}</p>:pessoas.length?
      <ul className="mt-6 grid gap-3">{pessoas.map(p=>
        <li key={p.id} className="flex flex-col gap-4 rounded-xl border border-black/20 bg-white p-4">
          <div className="flex min-w-0 items-start gap-3"><CandidatePhoto id={p.id} name={p.nomeUrna}/><div className="min-w-0"><p className="font-bold">{p.nomeUrna}</p>
            {p.cargoLabel?<p className="mt-1 text-sm text-black/65">{p.cargoLabel}{p.uf?` · ${p.uf}`:""}{p.siglaPartido?` · ${p.siglaPartido}`:""}</p>:null}</div>
          </div>
          <div className="flex w-full flex-col gap-2"><Link href={`/fazer-uma-pergunta?politico=${encodeURIComponent(p.nomeUrna)}`} className="rounded-lg bg-[#ffd700] px-3 py-3 text-center text-sm font-bold text-black">Perguntar sobre este político</Link><button type="button" disabled={removendo.includes(p.id)} onClick={()=>void remover(p)}
            className="min-h-12 shrink-0 rounded-lg border border-[#c62828] px-3 text-sm font-bold text-[#c62828] disabled:opacity-50 sm:px-4 sm:text-base">
            {removendo.includes(p.id)?"Removendo...":"Remover"}
          </button></div>
        </li>)}</ul>:
      <p className="mt-6">Você ainda não acompanha nenhum político.</p>}
    {semVinculo?<div className="mt-6 rounded-lg border border-black/20 p-4"><p>Suas escolhas ficam vinculadas à sua conta do Telegram. Para recuperá-las nesta prévia, confirme sua conta no bot que você já utiliza. Isso não exige escolher os políticos novamente.</p><button type="button" disabled={vinculando} onClick={()=>void reconectar()} className="mt-4 min-h-12 w-full rounded-lg bg-[#229ed9] px-4 font-bold text-white disabled:opacity-50">{vinculando?"Abrindo Telegram...":"Reconectar meu Telegram"}</button><p className="mt-3 text-sm">Depois da confirmação no bot, não toque no botão “foradapauta.org”. Volte à mesma aba do Chrome: esta página reconhecerá o vínculo e mostrará sua lista automaticamente.</p></div>:null}
    {erro?<p role="alert" className="mt-4 rounded-lg bg-[#fff2e8] p-4">{erro}</p>:null}
    <div className="mt-10 flex justify-center"><Link href="/ha-mais-para-entender" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#c62828] px-8 py-3 text-lg font-bold text-white">✕ Fechar</Link></div>
  </div></main>;
}

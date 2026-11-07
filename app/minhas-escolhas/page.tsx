"use client";
import { useCallback, useEffect, useState } from "react";

type Pessoa = { id: string; nomeUrna: string; cargoLabel?: string; uf?: string; siglaPartido?: string };
export default function Page(){
  const [pessoas,setPessoas]=useState<Pessoa[]>([]);
  const [status,setStatus]=useState("Consultando suas escolhas...");
  const [removendo,setRemovendo]=useState<string[]>([]);
  const [erro,setErro]=useState("");
  const carregar=useCallback(async()=>{
    try{
      const resposta=await fetch("/api/telegram/sessao",{cache:"no-store",credentials:"same-origin"});
      if(!resposta.ok)throw Error("Não foi possível consultar suas escolhas.");
      const dados=await resposta.json();
      if(dados.ativo!==true){
        setPessoas([]);
        setStatus("Não foi possível consultar sua lista neste navegador.");
        return;
      }
      setPessoas(Array.isArray(dados.pessoas)?dados.pessoas:[]);
      setStatus("");
    }catch{setStatus("Não foi possível consultar suas escolhas agora.");}
  },[]);
  useEffect(()=>{void carregar();},[carregar]);
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
    <h1 className="text-3xl font-extrabold">Minhas escolhas</h1>
    {status?<p role="status" className="mt-6">{status}</p>:pessoas.length?
      <ul className="mt-6 grid gap-3">{pessoas.map(p=>
        <li key={p.id} className="flex items-center justify-between gap-4 rounded-xl border border-black/20 bg-white p-4">
          <div className="min-w-0"><p className="font-bold">{p.nomeUrna}</p>
            {p.cargoLabel?<p className="mt-1 text-sm text-black/65">{p.cargoLabel}{p.uf?` · ${p.uf}`:""}{p.siglaPartido?` · ${p.siglaPartido}`:""}</p>:null}
          </div>
          <button type="button" disabled={removendo.includes(p.id)} onClick={()=>void remover(p)}
            className="min-h-12 shrink-0 rounded-lg border border-[#c62828] px-4 font-bold text-[#c62828] disabled:opacity-50">
            {removendo.includes(p.id)?"Removendo...":"Remover"}
          </button>
        </li>)}</ul>:
      <p className="mt-6">Você ainda não acompanha nenhum político.</p>}
    {erro?<p role="alert" className="mt-4 rounded-lg bg-[#fff2e8] p-4">{erro}</p>:null}
  </div></main>;
}

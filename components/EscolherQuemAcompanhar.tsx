"use client";
import { useEffect, useState } from "react";
import { CandidateSelector } from "@/components/CandidateSelector";
import { BotaoFecharRodape } from "@/components/BotaoFecharRodape";
type Pessoa = { id: string; nomeUrna: string };
export function EscolherQuemAcompanhar() {
  const [inscrito,setInscrito]=useState(false);
  const [vinculoUrl,setVinculoUrl]=useState("");
  const [ids,setIds]=useState<string[]>([]);
  const [salvando,setSalvando]=useState<string[]>([]);
  const [mensagem,setMensagem]=useState("");
  const [periodicidade,setPeriodicidade]=useState("semanal");
  useEffect(()=>{
    // Ao abrir a página, não herdar a posição de rolagem da home.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    try { const salva=localStorage.getItem("fdp-periodicidade-previa"); if(["diaria","semanal","quinzenal"].includes(salva??"")) setPeriodicidade(salva!); } catch {}
    let ativo=true;
    fetch("/api/telegram/sessao",{cache:"no-store",credentials:"same-origin"}).then(r=>r.ok?r.json():null).then(d=>{if(!ativo)return;setInscrito(d?.ativo===true);setIds(Array.isArray(d?.ids)?d.ids:[]);}).catch(()=>{if(ativo)setMensagem("Não foi possível verificar a inscrição no Telegram.");});
    const atualizar=()=>{fetch("/api/telegram/sessao",{cache:"no-store",credentials:"same-origin"}).then(r=>r.ok?r.json():null).then(d=>{if(!ativo)return;if(d?.ativo===true){setInscrito(true);setIds(Array.isArray(d.ids)?d.ids:[]);setVinculoUrl("");setMensagem("");}}).catch(()=>{});};
    window.addEventListener("focus",atualizar);
    document.addEventListener("visibilitychange",atualizar);
    return ()=>{ativo=false;window.removeEventListener("focus",atualizar);document.removeEventListener("visibilitychange",atualizar);};
  },[]);
  async function selecionar(pessoa:Pessoa) {
    if(!inscrito){
      setSalvando(a=>[...a,pessoa.id]);
      try {
        const resposta=await fetch("/api/telegram/sessao",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({ids:[pessoa.id]})});
        if(!resposta.ok)throw Error();
        const dados=await resposta.json();
        setVinculoUrl(dados.url);
        setMensagem("Sua escolha está reservada. Confirme no Telegram para concluir.");
      } catch {setMensagem("Não foi possível iniciar a confirmação. Tente novamente.");}
      finally {setSalvando(a=>a.filter(id=>id!==pessoa.id));}
      return;
    }
    if(ids.includes(pessoa.id)||salvando.includes(pessoa.id))return;
    setSalvando(a=>[...a,pessoa.id]);
    setMensagem("");
    try {
      const resposta=await fetch("/api/telegram/sessao",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:[pessoa.id]})});
      if(!resposta.ok)throw Error();
      setIds(a=>a.includes(pessoa.id)?a:[...a,pessoa.id]);
    } catch {setMensagem("Não foi possível salvar sua escolha. Tente novamente.");}
    finally {setSalvando(a=>a.filter(id=>id!==pessoa.id));}
  }
  return <main className="min-h-screen scroll-mt-20 bg-white px-5 pt-10 pb-9 text-black"><div className="mx-auto max-w-2xl">
    <h1 className="mb-6 scroll-mt-24 text-3xl font-extrabold">Quem você quer acompanhar?</h1>
    <CandidateSelector mode="follow" selectedIds={ids} savingIds={salvando} onSelect={selecionar}/>
    {mensagem?<div role="status" className="mt-4 rounded-lg bg-black/5 p-4"><p>{mensagem}</p>{vinculoUrl?<a className="mt-3 inline-block rounded-lg bg-[#229ed9] px-4 py-3 font-semibold text-white" href={vinculoUrl}>Confirmar no Telegram →</a>:null}</div>:null}
    <div className="mt-8 rounded-xl border border-black/15 bg-black/[0.03] p-5">
      <label htmlFor="frequencia" className="mb-3 block text-lg font-bold">Com que frequência você quer receber os avisos sobre os políticos que acompanha?</label>
      <select id="frequencia" value={periodicidade} onChange={e=>{setPeriodicidade(e.target.value);try{localStorage.setItem("fdp-periodicidade-previa",e.target.value)}catch{}}} className="min-h-14 w-full rounded-lg border border-black/25 bg-white p-3">
        <option value="diaria">Diariamente</option><option value="semanal">Semanalmente</option><option value="quinzenal">Quinzenalmente</option>
      </select>
      <p className="mt-3 text-sm text-black/60">Esta opção está em teste e ainda não altera o envio real das notificações.</p>
    </div>
    <BotaoFecharRodape/>
  </div></main>;
}

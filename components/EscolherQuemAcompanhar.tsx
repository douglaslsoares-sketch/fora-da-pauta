"use client";
import { useEffect, useState } from "react";
import { CandidateSelector } from "@/components/CandidateSelector";
import { BotaoFecharRodape } from "@/components/BotaoFecharRodape";
type Pessoa = { id: string; nomeUrna: string };
export function EscolherQuemAcompanhar() {
  const [inscrito,setInscrito]=useState(false);
  const [ids,setIds]=useState<string[]>([]);
  const [busca,setBusca]=useState(0);
  const [mensagem,setMensagem]=useState("");
  const [periodicidade,setPeriodicidade]=useState("semanal");
  useEffect(()=>{
    // Ao abrir a página, não herdar a posição de rolagem da home.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    try { const salva=localStorage.getItem("fdp-periodicidade-previa"); if(["diaria","semanal","quinzenal"].includes(salva??"")) setPeriodicidade(salva!); } catch {}
    let ativo=true;
    fetch("/api/telegram/sessao",{cache:"no-store",credentials:"same-origin"}).then(r=>r.ok?r.json():null).then(d=>{if(!ativo)return;setInscrito(d?.ativo===true);setIds(Array.isArray(d?.ids)?d.ids:[]);}).catch(()=>{if(ativo)setMensagem("Não foi possível verificar a inscrição no Telegram.");});
    return ()=>{ativo=false};
  },[]);
  async function selecionar(pessoa:Pessoa) {
    if(!inscrito){setMensagem("Para acompanhar esta pessoa, confirme sua inscrição pelo bot do Telegram.");return;}
    try {
      const resposta=await fetch("/api/telegram/sessao",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:[pessoa.id]})});
      if(!resposta.ok)throw Error();
      setIds(a=>a.includes(pessoa.id)?a:[...a,pessoa.id]);setBusca(a=>a+1);setMensagem("Pronto! Você já acompanha "+pessoa.nomeUrna+".");
    } catch {setMensagem("Não foi possível salvar sua escolha. Tente novamente.");}
  }
  return <main className="min-h-screen scroll-mt-20 bg-white px-5 pt-10 pb-9 text-black"><div className="mx-auto max-w-2xl">
    <h1 className="mb-6 scroll-mt-24 text-3xl font-extrabold">Quem você quer acompanhar?</h1>
    {mensagem?<p role="status" className="mb-4 rounded-lg bg-black/5 p-4">{mensagem}</p>:null}
    <CandidateSelector key={busca} mode="follow" selectedIds={ids} onSelect={selecionar}/>
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

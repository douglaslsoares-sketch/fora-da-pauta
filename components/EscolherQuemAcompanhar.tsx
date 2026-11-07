"use client";
import { useEffect, useRef, useState } from "react";
import { CandidateSelector } from "@/components/CandidateSelector";
type Pessoa = { id: string; nomeUrna: string };
export function EscolherQuemAcompanhar() {
  const [inscrito,setInscrito]=useState(false);
  const [verificando,setVerificando]=useState(true);
  const salvamentosPendentes = useRef(new Set<string>());
  const [ids,setIds]=useState<string[]>([]);
  const [salvando,setSalvando]=useState<string[]>([]);
  const [mensagem,setMensagem]=useState("");
  const [periodicidade,setPeriodicidade]=useState("semanal");

  useEffect(()=>{
    // Ao abrir a página, não herdar a posição de rolagem da home.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    try { const salva=localStorage.getItem("fdp-periodicidade-previa"); if(["diaria","semanal","quinzenal"].includes(salva??"")) setPeriodicidade(salva!); } catch {}
    let ativo=true;
    fetch("/api/telegram/sessao",{cache:"no-store",credentials:"same-origin"}).then(r=>r.ok?r.json():null).then(d=>{if(!ativo)return;setInscrito(d?.ativo===true);setVerificando(false);setIds(anteriores=>[...new Set([...anteriores,...(Array.isArray(d?.ids)?d.ids:[])])]);}).catch(()=>{if(ativo){setVerificando(false);setMensagem("Não foi possível verificar o vínculo deste navegador.");}});
    const atualizar=()=>{fetch("/api/telegram/sessao",{cache:"no-store",credentials:"same-origin"}).then(r=>r.ok?r.json():null).then(d=>{if(!ativo)return;if(d?.ativo===true){setInscrito(true);setIds(anteriores=>[...new Set([...anteriores,...(Array.isArray(d.ids)?d.ids:[])])]);setMensagem("");}}).catch(()=>{});};
    const intervalo=window.setInterval(atualizar,3000);
    window.addEventListener("focus",atualizar);
    document.addEventListener("visibilitychange",atualizar);
    return ()=>{ativo=false;window.clearInterval(intervalo);window.removeEventListener("focus",atualizar);document.removeEventListener("visibilitychange",atualizar);};
  },[]);
  async function selecionar(pessoa:Pessoa) {
    if(!inscrito){
      setMensagem("Este endereço ainda não reconhece o vínculo. Abra o site pelo botão de retorno enviado no Telegram.");
      window.scrollTo({top:0,behavior:"smooth"});
      return;
    }
    if(ids.includes(pessoa.id)||salvamentosPendentes.current.has(pessoa.id))return;
    salvamentosPendentes.current.add(pessoa.id);
    setSalvando(a=>[...a,pessoa.id]);
    setMensagem("");
    try {
      const resposta=await fetch("/api/telegram/sessao",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:[pessoa.id]})});
      if(!resposta.ok) { const dados=await resposta.json().catch(()=>null);throw Error(dados?.erro||"Não foi possível salvar sua escolha."); }
      const dados=await resposta.json();
      if(dados?.salvo!==true)throw Error("O servidor não confirmou o salvamento.");
      setIds(a=>a.includes(pessoa.id)?a:[...a,pessoa.id]);
      setMensagem(`${pessoa.nomeUrna} foi adicionado à sua lista de acompanhados.`);
    } catch (erro) {setMensagem(`A escolha não foi salva: ${erro instanceof Error?erro.message:"erro de conexão. Tente novamente."}`); window.scrollTo({top:0,behavior:"smooth"});}
    finally {salvamentosPendentes.current.delete(pessoa.id);setSalvando(a=>a.filter(id=>id!==pessoa.id));}
  }
  return <main className="min-h-screen scroll-mt-20 bg-white px-5 pt-10 pb-9 text-black"><div className="mx-auto max-w-2xl">
    <h1 className="mb-6 scroll-mt-24 text-3xl font-extrabold">Qual político você quer acompanhar?</h1>
    {verificando?<p className="mb-4">Verificando sua inscrição...</p>:null}
    {mensagem?<div role="alert" aria-live="assertive" className="mb-4 rounded-lg border border-black/15 bg-[#fff6d5] p-4"><p>{mensagem}</p></div>:null}
    <CandidateSelector mode="follow" selectedIds={ids} savingIds={salvando} onSelect={selecionar}/>
    <div className="mt-8 rounded-xl border border-black/15 bg-black/[0.03] p-5">
      <label htmlFor="frequencia" className="mb-3 block text-lg font-bold">Com que frequência você quer receber os avisos sobre os políticos que acompanha?</label>
      <select id="frequencia" value={periodicidade} onChange={e=>{setPeriodicidade(e.target.value);try{localStorage.setItem("fdp-periodicidade-previa",e.target.value)}catch{}}} className="min-h-14 w-full rounded-lg border border-black/25 bg-white p-3">
        <option value="diaria">Diariamente</option><option value="semanal">Semanalmente</option><option value="quinzenal">Quinzenalmente</option>
      </select>
      <p className="mt-3 text-sm text-black/60">Esta opção está em teste e ainda não altera o envio real das notificações.</p>
    </div>
  </div></main>;
}

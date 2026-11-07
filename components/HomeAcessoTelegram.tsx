"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function HomeAcessoTelegram({ versaoEdicoes: _edicoes, versaoEntregas: _entregas }: { versaoEdicoes: string | null; versaoEntregas: string | null }) {
  const router=useRouter();
  const [estado,setEstado]=useState<"carregando"|"inscrito"|"visitante">("carregando");
  const [abrindo,setAbrindo]=useState(false);
  const [erro,setErro]=useState("");
  useEffect(()=>{
    let ativo=true;
    fetch("/api/telegram/sessao",{credentials:"same-origin",cache:"no-store"})
      .then(r=>r.ok?r.json():null).then(d=>{if(!ativo)return;if(d?.ativo===true){setEstado("inscrito");router.replace("/ha-mais-para-entender");}else{setEstado("visitante");}})
      .catch(()=>{if(ativo)setEstado("visitante");});
    return ()=>{ativo=false;};
  },[router]);
  async function inscrever(){
    if(abrindo)return;
    setAbrindo(true);setErro("");
    try {
      const resposta=await fetch("/api/telegram/sessao",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:[]})});
      if(!resposta.ok){const detalhe=await resposta.json().catch(()=>({}));throw new Error(typeof detalhe?.erro==="string"?detalhe.erro:"Não foi possível iniciar a inscrição.");}
      const dados=await resposta.json() as {url?:string};
      const destino=new URL(dados.url??"");
      if(destino.origin!=="https://t.me"||destino.pathname!=="/ForaDaPautaAcompanhaBot"||!/^\?start=s_[A-Za-z0-9_-]{32}$/.test(destino.search))throw Error();
      window.location.assign(destino.toString());
    }catch(e){setErro(e instanceof Error?e.message:"Não foi possível abrir o Telegram. Tente novamente.");setAbrindo(false);}
  }
  if(estado==="carregando"||estado==="inscrito")return <main className="min-h-[100svh] bg-[#050505] text-white flex items-center justify-center p-6"><p>Verificando sua inscrição...</p></main>;
  return <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#050505] px-6 py-9 text-white sm:px-12">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/marca/fora-da-pauta-olho-dourado.svg')] bg-[length:125%_auto] bg-[position:80%_65%] bg-no-repeat opacity-[.13]"/>
    <div className="relative mx-auto w-full max-w-4xl">
      <Image src="/marca/fora-da-pauta-horizontal-branco.svg" alt="Fora da Pauta" width={580} height={94} priority className="h-auto w-full max-w-[460px]"/>
      <p className="mt-3 text-center font-bold text-[#ffd700] sm:text-left">Decisões que afetam a sua vida.</p>
    </div>
    <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-12">
      <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-6xl">Acompanhe o dia a dia dos políticos.</h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed">Todos os dias, o Fora da Pauta reúne informações sobre o jogo político e avalia seu impacto na vida da sociedade.</p>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed">Receba as novidades pelo Telegram. <button type="button" onClick={()=>void inscrever()} disabled={abrindo} className="font-semibold text-[#58c7ff] underline underline-offset-4 disabled:opacity-60">Clique aqui</button> para se inscrever no nosso canal.</p>
      <button onClick={()=>void inscrever()} disabled={abrindo} className="mt-8 min-h-14 w-full max-w-md rounded-lg bg-[#229ed9] px-5 font-bold text-white disabled:opacity-60">{abrindo?"Abrindo Telegram...":"Inscrever no Telegram →"}</button>
      {erro&&<p role="alert" className="mt-4">{erro}</p>}
    </div>
    <p className="relative mx-auto w-full max-w-4xl text-center text-xs font-bold tracking-widest text-white/70">FORA DA PAUTA / HÁ MAIS PARA ENTENDER.</p>
  </section>;
}

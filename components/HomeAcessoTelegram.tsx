"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export function HomeAcessoTelegram({ versaoEdicoes: _edicoes, versaoEntregas: _entregas }: { versaoEdicoes: string | null; versaoEntregas: string | null }) {
  const [estado,setEstado]=useState<"carregando"|"inscrito"|"visitante">("visitante");
  const [abrindo,setAbrindo]=useState(false);
  const [erro,setErro]=useState("");
  const [mostrarOpcoes,setMostrarOpcoes]=useState(false);
  const [linkTelegram,setLinkTelegram]=useState("");
  const [instalando,setInstalando]=useState(false);
  useEffect(()=>{
    let ativo=true;
    let verificando=false;
    async function verificar(){
      if(verificando || !ativo || document.visibilityState==="hidden")return;
      verificando=true;
      try{
        const resposta=await fetch("/api/telegram/sessao",{credentials:"same-origin",cache:"no-store",signal:AbortSignal.timeout(5000)});
        const dados=resposta.ok?await resposta.json():null;
        if(!ativo)return;
        if(dados?.ativo===true){
          setEstado("inscrito");
          const primeira=sessionStorage.getItem("fdp_primeira_inscricao")==="1";
          if(primeira){
            sessionStorage.removeItem("fdp_primeira_inscricao");
            window.location.replace("/ha-mais-para-entender");
            return;
          }
          // Apenas o aplicativo instalado abre diretamente o menu nos acessos seguintes.
          // QR Code e compartilhamentos continuam mostrando a apresentação.
          const instalado=window.matchMedia("(display-mode: standalone)").matches ||
            (navigator as Navigator & {standalone?:boolean}).standalone===true;
          if(instalado)window.location.replace("/ha-mais-para-entender");
        }else{
          setEstado("visitante");
        }
      }catch{if(ativo)setEstado("visitante");}
      finally{verificando=false;}
    }
    void verificar();
    const intervalo=window.setInterval(()=>{
      if(sessionStorage.getItem("fdp_primeira_inscricao")==="1")void verificar();
    },3000);
    const aoRetornar=()=>void verificar();
    window.addEventListener("focus",aoRetornar);
    document.addEventListener("visibilitychange",aoRetornar);
    return ()=>{ativo=false;window.clearInterval(intervalo);window.removeEventListener("focus",aoRetornar);document.removeEventListener("visibilitychange",aoRetornar);};
  },[]);
  function inscrever(){setMostrarOpcoes(true);}
  function instalarTelegram(){setInstalando(true);setErro("");}
  async function abrirTelegram(){
    if(abrindo)return;
    if(estado==="inscrito"){setErro("Você já está inscrito no Telegram.");return;}
    setAbrindo(true);setErro("");
    try {
      const resposta=await fetch("/api/telegram/sessao",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:[]})});
      if(!resposta.ok){const detalhe=await resposta.json().catch(()=>({}));throw new Error(typeof detalhe?.erro==="string"?detalhe.erro:"Não foi possível iniciar a inscrição.");}
      const dados=await resposta.json() as {url?:string};
      const destino=new URL(dados.url??"");
      if(destino.origin!=="https://t.me"||destino.pathname!=="/ForaDaPautaAcompanhaBot"||!/^\?start=s_[A-Za-z0-9_-]{32}$/.test(destino.search))throw Error();
      sessionStorage.setItem("fdp_primeira_inscricao", "1");
      setLinkTelegram(destino.toString());
      setAbrindo(false);
      window.location.href="tg://resolve?domain=ForaDaPautaAcompanhaBot&start="+encodeURIComponent(destino.searchParams.get("start")||"");
    }catch(e){setErro(e instanceof Error?e.message:"Não foi possível abrir o Telegram. Tente novamente.");setAbrindo(false);}
  }
  if(instalando)return <main className="flex min-h-[100svh] flex-col justify-center bg-[#050505] px-6 py-10 text-white"><div className="mx-auto w-full max-w-md"><h1 className="text-3xl font-extrabold">Vamos instalar o Telegram</h1><p className="mt-5 text-lg">É gratuito. Vamos orientar você, um passo por vez.</p><p className="mt-6 text-lg"><strong>1.</strong> Toque em “Instalar Telegram”. Na loja, toque em Instalar e espere terminar.</p><a href="https://play.google.com/store/apps/details?id=org.telegram.messenger" target="_blank" rel="noopener noreferrer" className="mt-5 flex min-h-14 items-center justify-center rounded-lg bg-[#229ed9] px-4 text-center font-bold">Instalar Telegram</a><p className="mt-8 text-lg"><strong>2.</strong> Quando terminar, volte a esta tela e toque no botão abaixo. Vamos abrir a inscrição diretamente no aplicativo.</p><button type="button" disabled={abrindo} onClick={()=>void abrirTelegram()} className="mt-5 min-h-14 w-full rounded-lg bg-[#ffd700] px-4 font-bold text-black disabled:opacity-50">{abrindo?"Preparando inscrição...":"Já instalei — continuar inscrição"}</button>{linkTelegram?<a href={linkTelegram} className="mt-4 block text-center text-[#58c7ff] underline">Não abriu? Abrir inscrição pelo navegador</a>:null}{erro?<p role="alert" className="mt-4">{erro}</p>:null}<button type="button" onClick={()=>setInstalando(false)} className="mt-8 w-full py-2 underline">Voltar</button></div></main>;
  return <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#050505] px-6 py-9 text-white sm:px-12">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/marca/fora-da-pauta-olho-dourado.svg')] bg-[length:125%_auto] bg-[position:80%_65%] bg-no-repeat opacity-[.13]"/>
    <div className="relative mx-auto w-full max-w-4xl">
      <Image src="/marca/fora-da-pauta-horizontal-branco.svg" alt="Fora da Pauta" width={580} height={94} priority className="h-auto w-full max-w-[460px]"/>
      <p className="mt-3 text-center font-bold text-[#ffd700] sm:text-left">Decisões que afetam a sua vida.</p>
    </div>
    <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-12">
      <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-6xl">Saiba o que os políticos estão fazendo.</h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed">Receba notícias e explicações simples sobre o que acontece na política e como isso afeta a sua vida.</p>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed">É gratuito. Para começar, toque no botão abaixo.</p>
      <button onClick={()=>void inscrever()} disabled={abrindo} className="mt-8 min-h-14 w-full max-w-md rounded-lg bg-[#229ed9] px-5 font-bold text-white disabled:opacity-60">{mostrarOpcoes?"Escolha uma opção abaixo":"Quero receber as notícias"}</button>
      {mostrarOpcoes?<div className="mt-5 w-full max-w-md rounded-xl border border-white/30 bg-black/80 p-5">
        <h2 className="text-xl font-bold">Vamos receber as notícias?</h2>
        <p className="mt-2 text-sm text-white/80">Para receber as notícias, vamos usar um aplicativo gratuito chamado Telegram. Você já tem esse aplicativo no celular?</p>
        <button type="button" disabled={abrindo} onClick={()=>void abrirTelegram()} className="mt-5 min-h-14 w-full rounded-lg bg-[#229ed9] px-4 py-3 font-bold disabled:opacity-50">{abrindo?"Preparando inscrição...":"Sim, já tenho."}</button>
        <button type="button" onClick={instalarTelegram} className="mt-3 flex min-h-14 w-full items-center justify-center rounded-lg border border-white/60 px-4 py-3 text-center font-bold">Não tenho.</button>
        <p className="mt-3 text-sm text-white/80">Se não tiver, vamos orientar você na instalação, um passo por vez.</p>
        {linkTelegram?<a href={linkTelegram} className="mt-4 block text-center text-sm font-bold text-[#58c7ff] underline">Não abriu? Tentar pelo navegador</a>:null}
        <button type="button" onClick={()=>setMostrarOpcoes(false)} className="mt-4 w-full py-2 text-sm underline">Voltar</button>
      </div>:null}
      {erro&&<p role="alert" className="mt-4">{erro}</p>}
    </div>
    <p className="relative mx-auto w-full max-w-4xl text-center text-xs font-bold tracking-widest text-white/70">FORA DA PAUTA / HÁ MAIS PARA ENTENDER.</p>
  </section>;
}

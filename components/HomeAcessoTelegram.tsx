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
  if(instalando)return <main className="flex min-h-[100svh] flex-col justify-center bg-[#050505] px-6 py-10 text-white"><div className="mx-auto w-full max-w-md"><h1 className="text-3xl font-extrabold">Vamos instalar o Telegram</h1><p className="mt-5 text-lg">É gratuito. Vamos ajudar você, um passo de cada vez.</p><p className="mt-6 text-lg"><strong>1.</strong> Toque no botão azul abaixo.</p><p className="mt-4 text-lg"><strong>2.</strong> Na tela que vai abrir, toque em <strong>Instalar</strong> e espere terminar.</p><p className="mt-4 text-lg"><strong>3.</strong> Depois que instalar, volte nesta tela e toque no botão amarelo para continuar a inscrição.</p><a href="https://play.google.com/store/apps/details?id=org.telegram.messenger" target="_blank" rel="noopener noreferrer" className="mt-7 flex min-h-14 items-center justify-center rounded-lg bg-[#229ed9] px-4 text-center font-bold">Instalar Telegram</a><button type="button" disabled={abrindo} onClick={()=>void abrirTelegram()} className="mt-3 min-h-14 w-full rounded-lg bg-[#ffd700] px-4 font-bold text-black disabled:opacity-50">{abrindo?"Preparando inscrição...":"Continuar inscrição"}</button>{linkTelegram?<a href={linkTelegram} className="mt-4 block text-center text-[#58c7ff] underline">Não abriu? Abrir inscrição pelo navegador</a>:null}{erro?<p role="alert" className="mt-4">{erro}</p>:null}<button type="button" onClick={()=>setInstalando(false)} className="mt-8 w-full py-2 underline">Voltar</button></div></main>;
  return <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-black px-5 pb-10 pt-7 text-white sm:px-12">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[27%] bg-gradient-to-t from-[#292929] via-[#111] to-transparent opacity-60"/>
    <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-6 text-center">
      <Image src="/marca/olho-aprovado.svg" alt="Olho em preto e branco" width={320} height={320} priority className="-my-12 h-auto w-full max-w-[390px]"/>
      <p className="-mt-2 text-[clamp(2.6rem,9vw,5.5rem)] font-extrabold leading-none tracking-tight">Fique de Olho</p>
      <div className="mt-3 h-[5px] w-3/5 rounded-full bg-[#ffd700]"/>
      <h1 className="mt-8 max-w-2xl text-[clamp(2rem,6.5vw,4rem)] font-extrabold leading-[1.12] tracking-tight">Saiba o que os políticos <span className="text-[#ffd700]">estão fazendo.</span></h1>
      <p className="mt-6 max-w-2xl text-[clamp(1.1rem,3.8vw,1.6rem)] leading-relaxed">Receba notícias e explicações simples sobre o que acontece na política e como isso afeta a sua vida.</p>
      <p className="mt-7 max-w-2xl text-[clamp(1rem,3.5vw,1.4rem)] leading-relaxed"><strong className="text-[#ffd700]">É gratuito.</strong> Para começar, toque no botão abaixo.</p>
      <button onClick={()=>void inscrever()} disabled={abrindo} className="mt-7 min-h-16 w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#1eaff7] to-[#0667e7] px-5 py-4 text-[clamp(1.1rem,4vw,1.65rem)] font-extrabold text-white shadow-lg disabled:opacity-60">{mostrarOpcoes?"Escolha uma opção abaixo":"Quero receber as notícias"}</button>
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
  </section>;
}

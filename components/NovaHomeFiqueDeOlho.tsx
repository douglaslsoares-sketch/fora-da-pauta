"use client";
import Image from "next/image";
import {useEffect,useRef,useState} from "react";

export function NovaHomeFiqueDeOlho(){
 const painelRef=useRef<HTMLDivElement>(null);
 const [passo,setPasso]=useState<"inicio"|"opcoes"|"instalar">("inicio");
 useEffect(()=>{if(passo!=="inicio")requestAnimationFrame(()=>painelRef.current?.scrollIntoView({behavior:"smooth",block:"start"}));},[passo]);
 const [abrindo,setAbrindo]=useState(false);
 const [erro,setErro]=useState("");
 const [link,setLink]=useState("");
 async function abrirTelegram(){
  if(abrindo)return;
  setAbrindo(true);setErro("");
  try{
   const resposta=await fetch("/api/telegram/sessao",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:[]})});
   if(!resposta.ok)throw new Error("Não foi possível iniciar a inscrição.");
   const dados=await resposta.json() as {url?:string};
   const destino=new URL(dados.url??"");
   if(destino.origin!=="https://t.me"||destino.pathname!=="/ForaDaPautaAcompanhaBot")throw new Error("Link de inscrição inválido.");
   const inicio=destino.searchParams.get("start");
   if(!inicio||!/^s_[A-Za-z0-9_-]{32}$/.test(inicio))throw new Error("Link de inscrição inválido.");
   sessionStorage.setItem("fdp_primeira_inscricao","1");
   setLink(destino.toString());
   window.location.href="tg://resolve?domain=ForaDaPautaAcompanhaBot&start="+encodeURIComponent(inicio);
  }catch(e){setErro(e instanceof Error?e.message:"Não foi possível abrir o Telegram.");}
  finally{setAbrindo(false);}
 }
 return <section translate="no" className="fdp-home-designed notranslate relative isolate flex min-h-[100svh] flex-col overflow-x-hidden bg-black text-white">
  <div className="fdp-hero-layout relative z-10 mx-auto flex w-full max-w-[680px] flex-1 flex-col items-center px-[7%] text-center">
   <div className="fdp-hero-brand flex w-full flex-col items-center">
    <Image src="/marca/1000215822(2).png" alt="Olho humano em preto e branco" width={240} height={240} priority unoptimized className="fdp-hero-eye w-[min(84vw,380px)] shrink-0 object-contain"/>
    <p style={{textTransform:"none"}} className="notranslate normal-case whitespace-nowrap text-[clamp(2.35rem,9vw,4rem)] font-black leading-[1.08] tracking-[-.045em]"><span className="inline-block" style={{textTransform:"uppercase"}}>F</span>ique de Olho</p>
    <svg aria-hidden="true" viewBox="0 0 480 35" preserveAspectRatio="none" className="mx-auto mt-2 h-[23px] w-[84%]"><path d="M8 31 Q240 -10 472 31 Q240 7 8 31" fill="#ffdf00"/></svg>
   </div>
   <div className="fdp-hero-message w-full">
    <h1 className="max-w-[620px] text-[clamp(1.85rem,7vw,3.1rem)] font-black leading-[1.1] tracking-[-.035em]">Decisões políticas <span className="text-[#ffdf00]">afetam a sua vida.</span></h1>
    <p className="fdp-hero-description mx-auto max-w-[580px] text-[clamp(1rem,3.8vw,1.4rem)] leading-[1.4]">Receba notícias e explicações simples sobre o que os políticos estão fazendo.</p>
   </div>
   <div className="fdp-hero-action w-full">
    <p className="mx-auto max-w-[580px] text-[clamp(1rem,3.6vw,1.35rem)] leading-[1.4]"><strong className="font-extrabold text-[#ffdf00]">É gratuito.</strong> Para começar, toque no botão abaixo.</p>
    <button type="button" onClick={()=>setPasso("opcoes")} className="notranslate fdp-hero-cta mx-auto flex min-h-[66px] w-full max-w-[620px] items-center justify-center rounded-full border border-[#65d6ff] bg-gradient-to-b from-[#22baff] via-[#0a95ff] to-[#0560e1] px-3 py-4 text-center text-[clamp(1.05rem,4.25vw,1.8rem)] font-extrabold leading-tight shadow-[0_12px_24px_rgba(0,0,0,.5)]"><span className="block whitespace-normal break-normal">Quero receber as notícias</span></button>
   </div>
   {passo!=="inicio"&&<div ref={painelRef} className="mt-5 mb-12 w-full max-w-xl scroll-mt-5 rounded-xl border border-white/40 bg-[#111] p-5 text-center">
    {passo==="opcoes"?<><h2 className="text-xl font-bold">Vamos receber as notícias?</h2><p className="mt-3">Para receber as notícias, vamos usar o Telegram. Você já tem o aplicativo no celular?</p><button onClick={()=>void abrirTelegram()} disabled={abrindo} className="mt-5 min-h-14 w-full rounded-lg bg-[#229ed9] px-4 font-bold">{abrindo?"Preparando inscrição...":"Sim, já tenho"}</button><button onClick={()=>setPasso("instalar")} className="mt-3 min-h-14 w-full rounded-lg border border-white/70 px-4 font-bold">Não tenho</button></>:<><h2 className="text-xl font-bold">Vamos instalar o Telegram</h2><p className="mt-3">Instale o aplicativo gratuito, volte aqui e continue a inscrição.</p><a className="mt-5 flex min-h-14 items-center justify-center rounded-lg bg-[#229ed9] px-4 font-bold" href="https://play.google.com/store/apps/details?id=org.telegram.messenger" target="_blank" rel="noopener noreferrer">Instalar Telegram</a><button onClick={()=>void abrirTelegram()} className="mt-3 min-h-14 w-full rounded-lg bg-[#ffdf00] px-4 font-bold text-black">Continuar inscrição</button></>}
    {link&&<a href={link} className="mt-4 block underline">Não abriu? Tentar pelo navegador</a>}
    {erro&&<p role="alert" className="mt-3">{erro}</p>}
    <button onClick={()=>setPasso("inicio")} className="mt-5 underline">Voltar</button>
   </div>}
  </div>
 </section>;
}

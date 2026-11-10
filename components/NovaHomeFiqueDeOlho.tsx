"use client";
import Image from "next/image";
import {useState} from "react";

export function NovaHomeFiqueDeOlho(){
 const [passo,setPasso]=useState<"inicio"|"opcoes"|"instalar">("inicio");
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
 return <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-black text-white">
  <div className="relative z-10 mx-auto flex w-full max-w-[850px] flex-1 flex-col items-center px-[5.5%] pb-[140px] pt-[12px] text-center sm:pb-[165px]">
   <Image src="/marca/olho-aprovado.svg" alt="Olho humano em preto e branco" width={320} height={320} priority unoptimized className="-mb-[45px] -mt-[54px] w-[min(83vw,530px)] object-contain"/>
   <div className="relative z-10 w-full">
    <p className="whitespace-nowrap text-[clamp(2.5rem,9vw,5.9rem)] font-black leading-[1.08] tracking-[-.045em]">Fique de Olho</p>
    <svg aria-hidden="true" viewBox="0 0 480 35" preserveAspectRatio="none" className="mx-auto mt-1 h-[28px] w-[76%]"><path d="M8 31 Q240 -10 472 31 Q240 7 8 31" fill="#ffdf00"/></svg>
   </div>
   <h1 className="mt-[20px] max-w-[760px] text-[clamp(2.1rem,7.1vw,4.25rem)] font-black leading-[1.08] tracking-[-.035em]">Saiba o que os políticos <span className="text-[#ffdf00]">estão fazendo.</span></h1>
   <p className="mt-[26px] max-w-[750px] text-[clamp(1.1rem,3.85vw,1.85rem)] leading-[1.28]">Receba notícias e explicações simples sobre o que acontece na política e como isso afeta a sua vida.</p>
   <p className="mt-[29px] max-w-[750px] text-[clamp(1.08rem,3.65vw,1.7rem)] leading-[1.35]"><strong className="text-[#ffdf00]">É gratuito.</strong> Para começar, toque no botão abaixo.</p>
   <button type="button" onClick={()=>setPasso("opcoes")} className="mt-[30px] flex min-h-[76px] w-full max-w-[760px] items-center justify-center rounded-[24px] border border-[#65d6ff] bg-gradient-to-b from-[#22baff] via-[#0a95ff] to-[#0560e1] px-3 py-4 text-center text-[clamp(1.08rem,4.35vw,2.3rem)] font-extrabold leading-tight shadow-[0_12px_24px_rgba(0,0,0,.5)]">Quero receber as notícias</button>
   {passo!=="inicio"&&<div className="mt-5 w-full max-w-xl rounded-xl border border-white/40 bg-[#111] p-5 text-center">
    {passo==="opcoes"?<><h2 className="text-xl font-bold">Vamos receber as notícias?</h2><p className="mt-3">Para receber as notícias, vamos usar o Telegram. Você já tem o aplicativo no celular?</p><button onClick={()=>void abrirTelegram()} disabled={abrindo} className="mt-5 min-h-14 w-full rounded-lg bg-[#229ed9] px-4 font-bold">{abrindo?"Preparando inscrição...":"Sim, já tenho"}</button><button onClick={()=>setPasso("instalar")} className="mt-3 min-h-14 w-full rounded-lg border border-white/70 px-4 font-bold">Não tenho</button></>:<><h2 className="text-xl font-bold">Vamos instalar o Telegram</h2><p className="mt-3">Instale o aplicativo gratuito, volte aqui e continue a inscrição.</p><a className="mt-5 flex min-h-14 items-center justify-center rounded-lg bg-[#229ed9] px-4 font-bold" href="https://play.google.com/store/apps/details?id=org.telegram.messenger" target="_blank" rel="noopener noreferrer">Instalar Telegram</a><button onClick={()=>void abrirTelegram()} className="mt-3 min-h-14 w-full rounded-lg bg-[#ffdf00] px-4 font-bold text-black">Continuar inscrição</button></>}
    {link&&<a href={link} className="mt-4 block underline">Não abriu? Tentar pelo navegador</a>}
    {erro&&<p role="alert" className="mt-3">{erro}</p>}
    <button onClick={()=>setPasso("inicio")} className="mt-5 underline">Voltar</button>
   </div>}
  </div>
  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[185px] bg-gradient-to-t from-[#050505] via-[#272727] to-transparent"/>
  <svg aria-hidden="true" viewBox="0 0 900 185" preserveAspectRatio="xMidYMax slice" className="pointer-events-none absolute inset-x-0 bottom-0 h-[170px] w-full">
   <defs><linearGradient id="sil" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#252525"/><stop offset="1" stopColor="#030303"/></linearGradient></defs>
   {Array.from({length:26},(_,i)=>{const x=i*38-10,y=58+(i*29%55),r=11+(i*7%11);return <g key={i} fill="url(#sil)"><ellipse cx={x+20} cy={y} rx={r} ry={r*1.25}/><path d={`M${x+20-r*1.9} 185 V${y+r*1.6} Q${x+20} ${y+r*.45} ${x+20+r*1.9} ${y+r*1.6} V185Z`}/></g>})}
  </svg>
 </section>;
}

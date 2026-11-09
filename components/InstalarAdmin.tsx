"use client";
import { useEffect, useState } from "react";
type InstallEvent = Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed"}>};
export function InstalarAdmin(){
 const [evento,setEvento]=useState<InstallEvent|null>(null);
 const [instalado,setInstalado]=useState(false);
 const [orientacao,setOrientacao]=useState(false);
 useEffect(()=>{
   if("serviceWorker" in navigator)void navigator.serviceWorker.register("/sw.js").catch(()=>{});
   const standalone=window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & {standalone?:boolean}).standalone===true;
   setInstalado(standalone);
   const disponivel=(e:Event)=>{e.preventDefault();setEvento(e as InstallEvent);};
   const concluiu=()=>{setInstalado(true);setEvento(null);};
   window.addEventListener("beforeinstallprompt",disponivel);
   window.addEventListener("appinstalled",concluiu);
   return ()=>{window.removeEventListener("beforeinstallprompt",disponivel);window.removeEventListener("appinstalled",concluiu);};
 },[]);
 async function instalar(){
   if(!evento){setOrientacao(true);return;}
   await evento.prompt();
   const resultado=await evento.userChoice;
   setEvento(null);
   if(resultado.outcome!=="accepted")setOrientacao(true);
 }
 if(instalado)return null;
 return <div className="mt-7 mb-7 border border-black/15 bg-white p-4">
  <p className="mb-3 text-sm text-black/70">Acesso rápido ao painel administrativo, separado do aplicativo principal.</p>
  <button type="button" onClick={()=>void instalar()} className="min-h-14 w-full bg-black px-4 py-3 font-bold text-white">Instalar ícone Admin</button>
  {orientacao?<p role="status" className="mt-3 text-sm leading-6">A instalação automática não está disponível neste navegador neste momento. O Android só permite instalar pelo botão quando o Chrome oferece essa opção. Se não aparecer, não foi instalado; não é necessário repetir o procedimento que já falhou.</p>:null}
 </div>;
}

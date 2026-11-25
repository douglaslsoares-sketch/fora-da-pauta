"use client";
import { useEffect, useRef, useState } from "react";
type Reconhecimento = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: {results: ArrayLike<ArrayLike<{transcript:string}>>})=>void)|null; onerror: (()=>void)|null; onend: (()=>void)|null; start():void; abort():void };
export function PesquisaPorVoz({onTexto}:{onTexto:(texto:string)=>void}) {
  const ref=useRef<Reconhecimento|null>(null);
  const [ouvindo,setOuvindo]=useState(false);
  const [aviso,setAviso]=useState("");
  useEffect(()=>()=>{if(ref.current){ref.current.onend=null;ref.current.onerror=null;ref.current.onresult=null;ref.current.abort();}},[]);
  function iniciar(){
    if(ouvindo){ref.current?.abort();return;}
    const w=window as unknown as {SpeechRecognition?:new()=>Reconhecimento;webkitSpeechRecognition?:new()=>Reconhecimento};
    const Classe=w.SpeechRecognition||w.webkitSpeechRecognition;
    if(!Classe){setAviso("Pesquisa por voz indisponível neste navegador. Use a digitação abaixo.");return;}
    setAviso("");
    try {
      const r=new Classe();ref.current=r;r.lang="pt-BR";r.continuous=false;r.interimResults=false;
      r.onresult=e=>{const texto=e.results[0]?.[0]?.transcript?.trim();if(texto)onTexto(texto);};
      r.onerror=()=>{setOuvindo(false);setAviso("Não foi possível reconhecer a voz. Tente novamente ou digite abaixo.");};
      r.onend=()=>{setOuvindo(false);ref.current=null;};
      setOuvindo(true);r.start();
    }catch{setOuvindo(false);setAviso("Não foi possível acessar o microfone. Use a digitação abaixo.");}
  }
  return <div className="mb-3"><button type="button" onClick={iniciar} aria-pressed={ouvindo} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#F4C64D] px-4 py-3 font-bold text-[#0C192B]"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>{ouvindo?"Ouvindo… Toque para cancelar":"Pesquisar por voz"}</button>{aviso&&<p role="status" className="mt-2 text-sm text-white">{aviso}</p>}<p className="my-2 text-center text-sm text-slate-300">ou digite</p></div>;
}

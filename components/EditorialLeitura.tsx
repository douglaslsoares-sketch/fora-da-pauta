"use client";
import {useRef,useState,type ReactNode} from "react";

export default function EditorialLeitura({audio,children}:{audio:string;children:ReactNode}){
 const player=useRef<HTMLAudioElement>(null);
 const [aberto,setAberto]=useState(false);
 const [erro,setErro]=useState("");
 function ouvir(){
   setAberto(true);setErro("");
   const el=player.current;
   if(el)void el.play().catch(()=>setErro("Toque no botão de reprodução do áudio para iniciar."));
 }
 function ler(){player.current?.pause();setAberto(false);setErro("");}
 return <>
 <nav className="my-5 flex gap-3">
 {audio&&<button type="button" onClick={ouvir} className="flex-1 rounded-xl bg-[#F4C64D] p-3 text-center font-bold text-[#0C192B]">▶ Ouvir o editorial</button>}
 <a href="#texto" onClick={ler} className="flex-1 rounded-xl border border-slate-400 p-3 text-center font-semibold">Ler o editorial</a>
 </nav>
 {children}
 {audio&&<div hidden={!aberto} className="mb-5">
 <audio ref={player} controls preload="none" src={audio} className="w-full" onError={()=>setErro("Não foi possível carregar o áudio.")}/>
 {erro&&<p role="status" className="mt-2 text-sm text-slate-300">{erro}</p>}
 </div>}
 </>;
}

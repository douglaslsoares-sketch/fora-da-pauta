"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
type Aviso={id:string;editorial_slug:string;titulo:string};
export default function EditorialAvisos(){
 const pathname=usePathname();
 const [avisos,setAvisos]=useState<Aviso[]>([]),[aberto,setAberto]=useState(false);
 const ativo=!pathname.startsWith("/admin");
 useEffect(()=>{if(!ativo)return;let live=true;async function load(){if(document.visibilityState!=="visible")return;try{const r=await fetch("/api/editoriais/avisos",{cache:"no-store"});if(r.ok){const d=await r.json();if(live)setAvisos(d.avisos||[])}}catch{}}void load();const timer=window.setInterval(load,60000);document.addEventListener("visibilitychange",load);window.addEventListener("fdp-comentario-enviado",load);return()=>{live=false;window.clearInterval(timer);document.removeEventListener("visibilitychange",load);window.removeEventListener("fdp-comentario-enviado",load)}},[ativo,pathname]);
 async function abrir(a:Aviso){try{const r=await fetch("/api/editoriais/avisos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:a.id})});if(r.ok)setAvisos(v=>v.filter(x=>x.id!==a.id))}catch{}window.location.assign("/editoriais/"+a.editorial_slug+"#comentario-"+a.id)}
 if(!ativo||!avisos.length)return null;
 return <aside className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] text-white"><button aria-expanded={aberto} onClick={()=>setAberto(!aberto)} className="rounded-xl border border-slate-500 bg-[#0E1A29] px-4 py-3 shadow-lg">🔔 {avisos.length} {avisos.length===1?"novo comentário":"novos comentários"}</button>{aberto&&<div className="mt-2 max-h-[50vh] w-80 max-w-full overflow-y-auto rounded-xl border border-slate-500 bg-[#0E1A29] p-3">{avisos.map(a=><button key={a.id} onClick={()=>abrir(a)} className="block w-full border-b border-slate-600 p-3 text-left last:border-0"><strong>Novo comentário</strong><span className="block text-sm">{a.titulo}</span></button>)}</div>}</aside>
}

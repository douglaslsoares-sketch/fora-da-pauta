"use client";
import {useEffect,useState} from "react";
const url="/api/editoriais/push";
type Estado={participante:boolean;ativo:boolean;publica?:string};
export default function EditorialPushAvisos(){
 const [estado,setEstado]=useState<Estado|null>(null),[busy,setBusy]=useState(false),[mensagem,setMensagem]=useState("");
 useEffect(()=>{
  let live=true;
  async function load(){try{const r=await fetch(url,{cache:"no-store"});if(r.ok){const d=await r.json();if(live)setEstado(d)}}catch{}}
  void load();window.addEventListener("fdp-comentario-enviado",load);
  return()=>{live=false;window.removeEventListener("fdp-comentario-enviado",load)};
 },[]);
 async function alterar(){
  if(busy||!estado)return;
  setBusy(true);setMensagem("");
  try{
   if(estado.ativo){
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({acao:"desativar"})});
    if(!r.ok)throw Error("Não foi possível desativar os avisos.");
    setEstado({...estado,ativo:false});setMensagem("Avisos externos desativados.");return;
   }
   if(!("Notification" in window)||!("serviceWorker" in navigator)||!("PushManager" in window))throw Error("Este navegador não oferece avisos externos. No iPhone, instale o aplicativo na tela inicial e abra por lá.");
   if(await Notification.requestPermission()!=="granted")throw Error("A autorização de notificações não foi concedida.");
   if(!estado.publica)throw Error("Chave de notificações indisponível.");
   const reg=await navigator.serviceWorker.register("/sw.js");
   const ready=await navigator.serviceWorker.ready;
   const b64=estado.publica.replace(/-/g,"+").replace(/_/g,"/");
   const key=Uint8Array.from(atob(b64.padEnd(Math.ceil(b64.length/4)*4,"=")),c=>c.charCodeAt(0));
   const manager=ready.pushManager;
   let sub=await manager.getSubscription();
   if(!sub)sub=await manager.subscribe({userVisibleOnly:true,applicationServerKey:key});
   const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({acao:"ativar",endpoint:sub.endpoint})});
   const d=await r.json();if(!r.ok)throw Error(d.erro||"Não foi possível ativar.");
   setEstado({...estado,ativo:true});setMensagem("Avisos externos ativados neste navegador.");
  }catch(e){setMensagem(e instanceof Error?e.message:"Não foi possível alterar os avisos.")}
  finally{setBusy(false)}
 }
 if(!estado?.participante)return null;
 return <div className="mt-5 rounded-lg border border-slate-600 p-4"><p className="text-sm">Receba avisos de novos comentários nos editoriais em que você participou, mesmo fora do site.</p><button type="button" disabled={busy} onClick={alterar} className="mt-3 rounded-lg border border-[#F4C64D] px-4 py-2 text-sm font-semibold text-[#F4C64D] disabled:opacity-50">{busy?"Processando…":estado.ativo?"Desativar avisos externos":"Ativar avisos externos"}</button>{mensagem&&<p role="status" className="mt-2 text-sm">{mensagem}</p>}</div>
}

"use client";
import {useEffect,useRef,useState} from "react";
import EditorialPushAvisos from "@/components/EditorialPushAvisos";
type Comentario={id:string;texto:string;criado_em:string;oficial:boolean};
export default function EditorialComentarios({slug}:{slug:string}){
 const [items,setItems]=useState<Comentario[]>([]),[texto,setTexto]=useState(""),[aviso,setAviso]=useState(""),[busy,setBusy]=useState(false);
 const [gravacao,setGravacao]=useState<"livre"|"iniciando"|"gravando"|"transcrevendo">("livre");
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;if(timer.current)clearTimeout(timer.current);if(recorder.current){recorder.current.onstop=null;if(recorder.current.state==="recording")recorder.current.stop()}stream.current?.getTracks().forEach(t=>t.stop())}},[]);
 async function iniciar(){
  if(gravacao!=="livre"||busy)return;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){setAviso("Seu navegador não permite gravar áudio. Você pode digitar.");return}
  setGravacao("iniciando");setAviso("");
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:true});
   if(!mounted.current){media.getTracks().forEach(t=>t.stop());return}
   stream.current=media;const rec=new MediaRecorder(media);recorder.current=rec;const chunks:Blob[]=[];
   rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   rec.onstop=async()=>{
    if(timer.current)clearTimeout(timer.current);
    media.getTracks().forEach(t=>t.stop());stream.current=null;
    if(!mounted.current)return;
    setGravacao("transcrevendo");
    try{
     const blob=new Blob(chunks,{type:rec.mimeType||"audio/webm"});
     if(!blob.size||blob.size>3*1024*1024)throw Error("Áudio vazio ou muito longo. Grave novamente.");
     const tipo=blob.type.split(";")[0];const ext=tipo.includes("mp4")?"mp4":tipo.includes("ogg")?"ogg":"webm";
     const form=new FormData();form.append("audio",blob,"comentario."+ext);
     const res=await fetch("/api/audio/transcrever",{method:"POST",body:form});
     const d=await res.json() as {text?:string;error?:string};
     if(!res.ok||!d.text?.trim())throw Error(d.error||"Não foi possível transcrever.");
     const combinado=[texto.trim(),d.text.trim()].filter(Boolean).join("\n");
     if(combinado.length>2000)throw Error("O texto excederia 2.000 caracteres. Grave um trecho menor.");
     if(mounted.current){setTexto(combinado);setAviso("Áudio transcrito. Confira e edite o texto antes de enviar.")}
    }catch(e){if(mounted.current)setAviso(e instanceof Error?e.message:"Falha na transcrição. Tente novamente.")}
    finally{if(mounted.current)setGravacao("livre")}
   };
   rec.start();setGravacao("gravando");
   timer.current=setTimeout(()=>{if(rec.state==="recording")rec.stop()},60000);
  }catch{stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;if(mounted.current){setGravacao("livre");setAviso("Não foi possível acessar o microfone. Confira a permissão.")}}
 }
 function parar(){if(recorder.current?.state==="recording")recorder.current.stop()}
 const url="/api/editoriais/comentarios?slug="+encodeURIComponent(slug);
 useEffect(()=>{let ativo=true;async function atualizar(){try{const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw Error();const d=await r.json();if(ativo)setItems(d.comentarios||[])}catch{if(ativo)setAviso("Comentários temporariamente indisponíveis.")}}void atualizar();const timer=window.setInterval(()=>{if(document.visibilityState==="visible")void atualizar()},60000);return()=>{ativo=false;window.clearInterval(timer)}},[url]);
 async function enviar(e:React.FormEvent){e.preventDefault();if(busy||gravacao!=="livre")return;setBusy(true);setAviso("");try{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({texto})});const d=await r.json();if(!r.ok)throw Error(d.erro);setTexto("");window.dispatchEvent(new Event("fdp-comentario-enviado"));setAviso("Comentário recebido. Será exibido após moderação.")}catch(e){setAviso(e instanceof Error?e.message:"Não foi possível enviar.")}finally{setBusy(false)}}
 async function denunciar(id:string){try{const r=await fetch(url,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});setAviso(r.ok?"Denúncia recebida.":"Não foi possível denunciar.")}catch{setAviso("Não foi possível denunciar.")}}
 return <section id="comentarios" className="mt-10 border-t border-slate-600 pt-6"><h2 className="text-2xl font-bold">Comentários</h2><p className="mt-2 text-sm">O que você pensa sobre este editorial? Participe. Os comentários são públicos e anônimos. Respeite as opiniões diferentes e não inclua dados pessoais.</p>{items.map(c=><article id={"comentario-"+c.id} key={c.id} className="mt-3 rounded-lg border border-slate-600 p-4"><div className="flex flex-wrap items-center gap-2"><strong>{c.oficial?"Fora da Pauta":"Anônimo"}</strong>{c.oficial&&<span className="rounded bg-[#F4C64D] px-2 py-1 text-xs font-bold text-[#0E1A29]">Equipe oficial</span>}<time className="text-xs text-slate-400" dateTime={c.criado_em}>{new Date(c.criado_em).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"})}</time></div><p className="mt-2 whitespace-pre-wrap break-words">{c.texto}</p><button className="mt-2 text-xs text-slate-400" onClick={()=>denunciar(c.id)}>Denunciar</button></article>)}<form onSubmit={enviar} className="mt-5 space-y-3"><label className="block">Seu comentário<textarea required disabled={gravacao!=="livre"||busy} maxLength={2000} rows={4} value={texto} onChange={e=>setTexto(e.target.value)} className="mt-1 block w-full rounded border border-slate-500 bg-[#18283A] p-3"/></label><div className="flex flex-wrap gap-3 items-center"><button type="button" disabled={busy||gravacao==="iniciando"||gravacao==="transcrevendo"} onClick={gravacao==="gravando"?parar:iniciar} className="rounded-lg border border-slate-400 px-4 py-3 font-semibold disabled:opacity-50">{gravacao==="gravando"?"Parar gravação":gravacao==="iniciando"?"Abrindo microfone...":gravacao==="transcrevendo"?"Transcrevendo o áudio...":"🎙 Gravar comentário"}</button><span className="text-xs text-slate-300">{texto.length}/2000</span></div><p className="text-xs text-slate-300">Até 60 segundos por gravação. O áudio é enviado ao serviço de transcrição; somente o texto revisado será publicado.</p><button disabled={busy||gravacao!=="livre"||!texto.trim()} className="rounded-lg bg-[#F4C64D] px-5 py-3 font-bold text-[#0E1A29]">{busy?"Enviando…":"Enviar comentário"}</button></form><EditorialPushAvisos/>{aviso&&<p role="status" className="mt-3">{aviso}</p>}</section>
}

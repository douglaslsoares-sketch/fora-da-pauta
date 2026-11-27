"use client";
import {useEffect,useRef,useState} from "react";
import EditorialPushAvisos from "@/components/EditorialPushAvisos";
type Comentario={id:string;texto:string;criado_em:string;oficial:boolean};
export default function EditorialComentarios({slug}:{slug:string}){
 const [items,setItems]=useState<Comentario[]>([]),[texto,setTexto]=useState(""),[aviso,setAviso]=useState(""),[busy,setBusy]=useState(false);
 const [mostrarOpinioes,setMostrarOpinioes]=useState(false),[carregandoOpinioes,setCarregandoOpinioes]=useState(true),[erroOpinioes,setErroOpinioes]=useState(false);
 const [gravacao,setGravacao]=useState<"livre"|"iniciando"|"gravando"|"transcrevendo">("livre");
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),mounted=useRef(true);
 const fase=useRef<"livre"|"iniciando"|"gravando"|"transcrevendo">("livre");
 const gesto=useRef<{id:number;ativo:boolean;cancelado:boolean}|null>(null);
 function estado(v:typeof fase.current){fase.current=v;if(mounted.current)setGravacao(v)}
 function soltar(id?:number,cancelar=false){
  const g=gesto.current;if(!g||!g.ativo||(id!==undefined&&id!==g.id))return;
  g.ativo=false;g.cancelado=cancelar;
  if(recorder.current?.state==="recording"){estado("transcrevendo");recorder.current.stop()}
 }
 useEffect(()=>{
  mounted.current=true;
  const cancelar=()=>soltar(undefined,true);
  const ocultar=()=>{if(document.hidden)cancelar()};
  window.addEventListener("blur",cancelar);document.addEventListener("visibilitychange",ocultar);
  return()=>{mounted.current=false;window.removeEventListener("blur",cancelar);document.removeEventListener("visibilitychange",ocultar);if(gesto.current){gesto.current.ativo=false;gesto.current.cancelado=true}if(timer.current)clearTimeout(timer.current);if(recorder.current){recorder.current.onstop=null;if(recorder.current.state==="recording")recorder.current.stop()}stream.current?.getTracks().forEach(t=>t.stop())}
 },[]);
 async function iniciar(id:number){
  if(fase.current!=="livre"||busy)return;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){setAviso("Seu navegador não permite gravar áudio. Você pode digitar.");return}
  const g={id,ativo:true,cancelado:false};gesto.current=g;estado("iniciando");setAviso("");
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:true});
   if(!mounted.current||!g.ativo||document.hidden){
    media.getTracks().forEach(t=>t.stop());if(mounted.current){gesto.current=null;estado("livre");setAviso("Microfone disponível. Segure novamente para falar.")}return
   }
   stream.current=media;const rec=new MediaRecorder(media);recorder.current=rec;const chunks:Blob[]=[];
   rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   rec.onerror=()=>{g.cancelado=true;g.ativo=false;if(rec.state==="recording")rec.stop();else{media.getTracks().forEach(t=>t.stop());stream.current=null;recorder.current=null;gesto.current=null;estado("livre");if(mounted.current)setAviso("Falha na gravação. Tente novamente.")}};
   rec.onstop=async()=>{
    if(timer.current){clearTimeout(timer.current);timer.current=null}
    media.getTracks().forEach(t=>t.stop());stream.current=null;recorder.current=null;g.ativo=false;gesto.current=null;
    if(!mounted.current)return;
    if(g.cancelado){estado("livre");setAviso("Gravação cancelada.");return}
    estado("transcrevendo");
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
     if(mounted.current){setTexto(combinado);setAviso("Confira o texto, corrija se necessário e envie.")}
    }catch(e){if(mounted.current)setAviso(e instanceof Error?e.message:"Falha na transcrição. Tente novamente.")}
    finally{if(mounted.current)estado("livre")}
   };
   rec.start();estado("gravando");
   timer.current=setTimeout(()=>{if(rec.state==="recording"){g.ativo=false;estado("transcrevendo");rec.stop()}},60000);
  }catch{stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;recorder.current=null;gesto.current=null;if(mounted.current){estado("livre");setAviso("Não foi possível acessar o microfone. Confira a permissão.")}}
 }
 const url="/api/editoriais/comentarios?slug="+encodeURIComponent(slug);
 useEffect(()=>{let ativo=true;async function atualizar(){try{const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw Error();const d=await r.json();if(ativo){setItems(d.comentarios||[]);setErroOpinioes(false)}}catch{if(ativo)setErroOpinioes(true)}finally{if(ativo)setCarregandoOpinioes(false)}}void atualizar();const timer=window.setInterval(()=>{if(document.visibilityState==="visible")void atualizar()},60000);return()=>{ativo=false;window.clearInterval(timer)}},[url]);
 async function enviar(e:React.FormEvent){e.preventDefault();if(busy||fase.current!=="livre"||!texto.trim())return;setBusy(true);setAviso("");try{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({texto})});const d=await r.json();if(!r.ok)throw Error(d.erro);setTexto("");window.dispatchEvent(new Event("fdp-comentario-enviado"));setAviso("Comentário recebido. Será exibido após moderação.")}catch(e){setAviso(e instanceof Error?e.message:"Não foi possível enviar.")}finally{setBusy(false)}}
 async function denunciar(id:string){try{const r=await fetch(url,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});setAviso(r.ok?"Denúncia recebida.":"Não foi possível denunciar.")}catch{setAviso("Não foi possível denunciar.")}}
 useEffect(()=>{function abrirPeloLink(){if(window.location.hash.startsWith("#comentario-"))setMostrarOpinioes(true)}abrirPeloLink();window.addEventListener("hashchange",abrirPeloLink);return()=>window.removeEventListener("hashchange",abrirPeloLink)},[slug]);
 useEffect(()=>{if(!mostrarOpinioes||carregandoOpinioes||!window.location.hash.startsWith("#comentario-"))return;document.getElementById(window.location.hash.slice(1))?.scrollIntoView({block:"start"})},[mostrarOpinioes,carregandoOpinioes,slug]);
 return <section id="comentarios" className="mt-10 border-t border-slate-600 pt-6"><h2 className="text-2xl font-bold">Comentários</h2><p className="mt-2 text-sm">O que você pensa sobre este editorial? Participe. Os comentários são públicos e anônimos. Respeite as opiniões diferentes e não inclua dados pessoais.</p><form onSubmit={enviar} className="mt-6 space-y-2"><h3 className="text-lg font-bold">Queremos ouvir você.</h3>
 <div className="flex items-end gap-2">
 <div className="flex min-w-0 flex-1 items-end rounded-3xl border border-slate-500 bg-[#18283A] px-2 py-1 focus-within:border-[#F4C64D]">
 <textarea aria-label="Escreva seu comentário" placeholder="Escreva seu comentário..." disabled={gravacao!=="livre"||busy} maxLength={2000} rows={Math.min(5,Math.max(1,Math.ceil(texto.length/35)))} value={texto} onChange={e=>setTexto(e.target.value)} className="min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-base text-white outline-none placeholder:text-slate-300"/>
 <button type="button" aria-label={gravacao==="gravando"?"Solte para transcrever":"Segure para gravar seu comentário"} aria-describedby="gravacao-ajuda" disabled={busy||gravacao==="transcrevendo"} onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{if(!e.isPrimary||e.button!==0||fase.current!=="livre")return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);void iniciar(e.pointerId)}} onPointerUp={e=>soltar(e.pointerId)} onPointerCancel={e=>soltar(e.pointerId,true)} onLostPointerCapture={e=>soltar(e.pointerId,true)} onKeyDown={e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();if(!e.repeat)void iniciar(-1)}else if(e.key==="Escape")soltar(-1,true)}} onKeyUp={e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();soltar(-1)}}} onBlur={()=>{if(gesto.current?.id===-1)soltar(-1,true)}} onClick={e=>{if(e.detail===0){if(gesto.current?.id===-2)soltar(-2);else if(fase.current==="livre")void iniciar(-2)}}} className={"flex h-12 w-12 shrink-0 touch-none select-none items-center justify-center rounded-full disabled:opacity-40 "+(gravacao==="gravando"?"bg-red-700 text-white":"text-slate-100")}><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6"/></svg></button>
 </div>
 <button type="submit" aria-label="Enviar comentário" disabled={busy||gravacao!=="livre"||!texto.trim()} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F4C64D] text-[#0E1A29] disabled:opacity-40"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/></svg></button>
 </div>
 <p role="status" className={gravacao==="gravando"?"text-sm font-semibold text-red-300":"text-sm text-slate-200"}>{busy?"Enviando…":gravacao==="iniciando"?"Abrindo microfone…":gravacao==="gravando"?"● Gravando… solte para transcrever":gravacao==="transcrevendo"?"Transcrevendo o áudio…":"Segure o microfone para falar."}</p>
 <p id="gravacao-ajuda" className="text-xs text-slate-300">Até 60 segundos. O áudio é enviado ao serviço de transcrição. Confira e edite o texto antes de enviar; somente o comentário escrito será publicado após moderação.</p>
 </form><button type="button" aria-expanded={mostrarOpinioes} aria-controls="outras-opinioes" onClick={()=>setMostrarOpinioes(v=>!v)} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-400 px-4 py-3 font-semibold text-white"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11a8 8 0 0 1-8 8H5l2-4a8 8 0 1 1 14-4Z"/></svg>{mostrarOpinioes?"Ocultar opiniões":"Ver outras opiniões"}{!carregandoOpinioes&&!erroOpinioes&&` (${items.length})`}</button>
 <div id="outras-opinioes" hidden={!mostrarOpinioes} className="mt-4" aria-label="Opiniões dos participantes">{carregandoOpinioes?<p role="status" className="text-sm text-slate-300">Carregando opiniões…</p>:erroOpinioes?<p role="status" className="text-sm text-slate-300">Opiniões temporariamente indisponíveis.</p>:items.length===0?<p className="text-sm text-slate-300">Ainda não há opiniões publicadas.</p>:items.map(c=><article id={"comentario-"+c.id} key={c.id} className="mt-3 rounded-lg border border-slate-600 p-4"><div className="flex flex-wrap items-center gap-2"><strong>{c.oficial?"Fora da Pauta":"Anônimo"}</strong>{c.oficial&&<span className="rounded bg-[#F4C64D] px-2 py-1 text-xs font-bold text-[#0E1A29]">Equipe oficial</span>}<time className="text-xs text-slate-400" dateTime={c.criado_em}>{new Date(c.criado_em).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"})}</time></div><p className="mt-2 whitespace-pre-wrap break-words">{c.texto}</p><button className="mt-2 text-xs text-slate-400" onClick={()=>denunciar(c.id)}>Denunciar</button></article>)}</div><EditorialPushAvisos/>{aviso&&<p role="status" className="mt-3">{aviso}</p>}</section>
}

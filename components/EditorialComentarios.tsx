"use client";
import {useEffect,useRef,useState} from "react";
import EditorialPushAvisos from "@/components/EditorialPushAvisos";
type Comentario={id:string;texto:string;criado_em:string;oficial:boolean};
export default function EditorialComentarios({slug}:{slug:string}){
 const [items,setItems]=useState<Comentario[]>([]),[texto,setTexto]=useState(""),[aviso,setAviso]=useState(""),[busy,setBusy]=useState(false);
 const [mostrarOpinioes,setMostrarOpinioes]=useState(false),[carregandoOpinioes,setCarregandoOpinioes]=useState(true),[erroOpinioes,setErroOpinioes]=useState(false);
 const [gravacao,setGravacao]=useState<"livre"|"iniciando"|"gravando"|"pausado"|"transcrevendo">("livre");
 const [segundos,setSegundos]=useState(0);
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),timer=useRef<ReturnType<typeof setInterval>|null>(null),mounted=useRef(true);
 const fase=useRef<typeof gravacao>("livre");
 const sessao=useRef<{cancelada:boolean;acumulado:number;inicio:number|null}|null>(null);
 function estado(v:typeof fase.current){fase.current=v;if(mounted.current)setGravacao(v)}
 function limparTimer(){if(timer.current!==null){clearInterval(timer.current);timer.current=null}}
 function tempo(){const s=sessao.current;return s?s.acumulado+(s.inicio===null?0:performance.now()-s.inicio):0}
 function concluir(cancelar=false){
  const s=sessao.current;if(!s)return;
  s.cancelada=cancelar;limparTimer();
  const rec=recorder.current;
  if(rec&&(rec.state==="recording"||rec.state==="paused")){estado(cancelar?"livre":"transcrevendo");rec.stop()}
  else if(fase.current==="iniciando"&&cancelar){sessao.current=null;estado("livre")}
 }
 function relogio(){
  limparTimer();timer.current=setInterval(()=>{const ms=tempo();if(mounted.current)setSegundos(Math.min(60,Math.floor(ms/1000)));if(ms>=60000)concluir()},100)
 }
 function pausar(){
  const rec=recorder.current,s=sessao.current;
  if(!rec||!s||fase.current!=="gravando"||rec.state!=="recording")return;
  s.acumulado=tempo();s.inicio=null;limparTimer();rec.pause();estado("pausado");setSegundos(Math.floor(s.acumulado/1000));
 }
 function retomar(){
  const rec=recorder.current,s=sessao.current;
  if(!rec||!s||fase.current!=="pausado"||rec.state!=="paused")return;
  rec.resume();s.inicio=performance.now();estado("gravando");relogio()
 }
 useEffect(()=>{
  mounted.current=true;
  const ocultar=()=>{if(document.hidden){if(fase.current==="gravando")pausar();else if(fase.current==="iniciando")concluir(true)}};
  document.addEventListener("visibilitychange",ocultar);
  return()=>{mounted.current=false;document.removeEventListener("visibilitychange",ocultar);limparTimer();if(sessao.current)sessao.current.cancelada=true;sessao.current=null;if(recorder.current){recorder.current.onstop=null;if(recorder.current.state!=="inactive")recorder.current.stop()}stream.current?.getTracks().forEach(t=>t.stop())}
 },[]);
 async function iniciar(){
  if(fase.current!=="livre"||busy||sessao.current)return;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){setAviso("Seu navegador não permite gravar áudio. Você pode digitar.");return}
  const s={cancelada:false,acumulado:0,inicio:null as number|null};sessao.current=s;estado("iniciando");setSegundos(0);setAviso("");
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:true});
   if(!mounted.current||s.cancelada||sessao.current!==s||document.hidden){
    media.getTracks().forEach(t=>t.stop());if(sessao.current===s){sessao.current=null;estado("livre")}return
   }
   stream.current=media;const rec=new MediaRecorder(media);recorder.current=rec;const chunks:Blob[]=[];
   rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   rec.onerror=()=>{s.cancelada=true;if(rec.state!=="inactive")rec.stop();else{limparTimer();media.getTracks().forEach(t=>t.stop());stream.current=null;recorder.current=null;sessao.current=null;estado("livre");if(mounted.current)setAviso("Falha na gravação. Tente novamente.")}};
   rec.onstop=async()=>{
    limparTimer();media.getTracks().forEach(t=>t.stop());stream.current=null;recorder.current=null;
    if(sessao.current!==s||!mounted.current)return;
    sessao.current=null;
    if(s.cancelada){estado("livre");setAviso("Gravação cancelada.");return}
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
   rec.start();s.inicio=performance.now();estado("gravando");relogio();
  }catch{if(sessao.current===s){limparTimer();stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;recorder.current=null;sessao.current=null;if(mounted.current){estado("livre");setAviso("Não foi possível acessar o microfone. Confira a permissão.")}}}
 }
 const url="/api/editoriais/comentarios?slug="+encodeURIComponent(slug);
 useEffect(()=>{let ativo=true;async function atualizar(){try{const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw Error();const d=await r.json();if(ativo){setItems(d.comentarios||[]);setErroOpinioes(false)}}catch{if(ativo)setErroOpinioes(true)}finally{if(ativo)setCarregandoOpinioes(false)}}void atualizar();const timer=window.setInterval(()=>{if(document.visibilityState==="visible")void atualizar()},60000);return()=>{ativo=false;window.clearInterval(timer)}},[url]);
 async function enviar(e:React.FormEvent){e.preventDefault();if(busy||fase.current!=="livre"||!texto.trim())return;setBusy(true);setAviso("");try{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({texto})});const d=await r.json();if(!r.ok)throw Error(d.erro);setTexto("");window.dispatchEvent(new Event("fdp-comentario-enviado"));setAviso("Comentário recebido. Será exibido após moderação.")}catch(e){setAviso(e instanceof Error?e.message:"Não foi possível enviar.")}finally{setBusy(false)}}
 async function denunciar(id:string){try{const r=await fetch(url,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});setAviso(r.ok?"Denúncia recebida.":"Não foi possível denunciar.")}catch{setAviso("Não foi possível denunciar.")}}
 useEffect(()=>{function abrirPeloLink(){if(window.location.hash.startsWith("#comentario-"))setMostrarOpinioes(true)}abrirPeloLink();window.addEventListener("hashchange",abrirPeloLink);return()=>window.removeEventListener("hashchange",abrirPeloLink)},[slug]);
 useEffect(()=>{if(!mostrarOpinioes||carregandoOpinioes||!window.location.hash.startsWith("#comentario-"))return;document.getElementById(window.location.hash.slice(1))?.scrollIntoView({block:"start"})},[mostrarOpinioes,carregandoOpinioes,slug]);
 return <section id="comentarios" className="mt-10 border-t border-slate-600 pt-6"><h2 className="text-2xl font-bold">Comentários</h2><p className="mt-2 text-sm">O que você pensa sobre este editorial? Participe. Os comentários são públicos e anônimos. Respeite as opiniões diferentes e não inclua dados pessoais.</p><form onSubmit={enviar} className="mt-6 space-y-2"><h3 className="text-lg font-bold">Queremos ouvir você.</h3>
 {(gravacao==="gravando"||gravacao==="pausado")?<div className="flex min-h-16 items-center gap-2 rounded-3xl border border-slate-500 bg-[#18283A] p-2">
 <button type="button" aria-label="Descartar gravação" onClick={()=>concluir(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-200"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg></button>
 <div className="flex min-w-0 flex-1 items-center gap-2"><span aria-hidden="true" className={"h-2.5 w-2.5 shrink-0 rounded-full "+(gravacao==="gravando"?"bg-red-400 motion-safe:animate-pulse":"bg-slate-400")}/><span className="font-mono text-sm tabular-nums">{String(Math.floor(segundos/60)).padStart(2,"0")}:{String(segundos%60).padStart(2,"0")}</span></div>
 <button type="button" aria-label={gravacao==="gravando"?"Pausar gravação":"Retomar gravação"} onClick={gravacao==="gravando"?pausar:retomar} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-400 text-white"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">{gravacao==="gravando"?<><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>:<path d="M8 4v16l13-8Z"/>}</svg></button>
 <button type="button" aria-label="Concluir gravação e transcrever" onClick={()=>concluir()} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F4C64D] text-[#0E1A29]"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6"/></svg></button>
 </div>:<div className="flex items-end gap-2">
 <div className="flex min-w-0 flex-1 items-end rounded-3xl border border-slate-500 bg-[#18283A] px-2 py-1 focus-within:border-[#F4C64D]">
 <textarea aria-label="Escreva seu comentário" placeholder="Escreva seu comentário..." disabled={gravacao!=="livre"||busy} maxLength={2000} rows={Math.min(5,Math.max(1,Math.ceil(texto.length/35)))} value={texto} onChange={e=>setTexto(e.target.value)} className="min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-base text-white outline-none placeholder:text-slate-300"/>
 <button type="button" aria-label="Gravar comentário" aria-describedby="gravacao-ajuda" disabled={busy||gravacao!=="livre"} onClick={()=>void iniciar()} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-slate-100 disabled:opacity-40"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6"/></svg></button>
 </div>
 <button type="submit" aria-label="Enviar comentário" disabled={busy||gravacao!=="livre"||!texto.trim()} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F4C64D] text-[#0E1A29] disabled:opacity-40"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/></svg></button>
 </div>}
 <p role="status" className={gravacao==="gravando"?"text-sm font-semibold text-red-300":"text-sm text-slate-200"}>{busy?"Enviando…":gravacao==="iniciando"?"Abrindo microfone…":gravacao==="gravando"?"Gravando… pause ou conclua":gravacao==="pausado"?"Gravação pausada. Retome ou conclua.":gravacao==="transcrevendo"?"Transcrevendo o áudio…":"Toque no microfone para falar."}</p>
 <p id="gravacao-ajuda" className="text-xs text-slate-300">Até 60 segundos de fala por gravação. O áudio é enviado ao serviço de transcrição ao concluir. Confira e edite o texto antes de enviar; somente o comentário escrito será publicado após moderação.</p>
 </form><button type="button" aria-expanded={mostrarOpinioes} aria-controls="outras-opinioes" onClick={()=>setMostrarOpinioes(v=>!v)} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-400 px-4 py-3 font-semibold text-white"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11a8 8 0 0 1-8 8H5l2-4a8 8 0 1 1 14-4Z"/></svg>{mostrarOpinioes?"Ocultar opiniões":"Ver outras opiniões"}{!carregandoOpinioes&&!erroOpinioes&&` (${items.length})`}</button>
 <div id="outras-opinioes" hidden={!mostrarOpinioes} className="mt-4" aria-label="Opiniões dos participantes">{carregandoOpinioes?<p role="status" className="text-sm text-slate-300">Carregando opiniões…</p>:erroOpinioes?<p role="status" className="text-sm text-slate-300">Opiniões temporariamente indisponíveis.</p>:items.length===0?<p className="text-sm text-slate-300">Ainda não há opiniões publicadas.</p>:items.map(c=><article id={"comentario-"+c.id} key={c.id} className="mt-3 rounded-lg border border-slate-600 p-4"><div className="flex flex-wrap items-center gap-2"><strong>{c.oficial?"Fora da Pauta":"Anônimo"}</strong>{c.oficial&&<span className="rounded bg-[#F4C64D] px-2 py-1 text-xs font-bold text-[#0E1A29]">Equipe oficial</span>}<time className="text-xs text-slate-400" dateTime={c.criado_em}>{new Date(c.criado_em).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Sao_Paulo"})}</time></div><p className="mt-2 whitespace-pre-wrap break-words">{c.texto}</p><button className="mt-2 text-xs text-slate-400" onClick={()=>denunciar(c.id)}>Denunciar</button></article>)}</div><EditorialPushAvisos/>{aviso&&<p role="status" className="mt-3">{aviso}</p>}</section>
}

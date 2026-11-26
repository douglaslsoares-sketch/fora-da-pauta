import {generateKeyPairSync,createPrivateKey,sign} from "node:crypto";
import {sql} from "@/lib/interesses/db";
import {prepararComentarios} from "./comentarios";

export async function prepararPush(){
 await prepararComentarios();
 await sql`CREATE TABLE IF NOT EXISTS public.editoriais_push_chave (id integer PRIMARY KEY CHECK(id=1), publica text NOT NULL, privada text NOT NULL)`;
 await sql`CREATE TABLE IF NOT EXISTS public.editoriais_push_inscricoes (autor_hash text PRIMARY KEY, endpoint text UNIQUE NOT NULL, atualizado_em timestamptz NOT NULL DEFAULT now())`;
}
export async function chavePush(){
 let rows=await sql<{publica:string;privada:string}[]>`SELECT publica,privada FROM public.editoriais_push_chave WHERE id=1`;
 if(!rows.length){
  const {privateKey,publicKey}=generateKeyPairSync("ec",{namedCurve:"prime256v1"});
  const jwk=publicKey.export({format:"jwk"});
  const publica=Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x!,"base64url"),Buffer.from(jwk.y!,"base64url")]).toString("base64url");
  const privada=privateKey.export({format:"pem",type:"pkcs8"}).toString();
  await sql`INSERT INTO public.editoriais_push_chave(id,publica,privada) VALUES(1,${publica},${privada}) ON CONFLICT DO NOTHING`;
  rows=await sql<{publica:string;privada:string}[]>`SELECT publica,privada FROM public.editoriais_push_chave WHERE id=1`;
 }
 return rows[0];
}
// Aceita somente provedores Web Push conhecidos. Não segue redirecionamentos.
export function endpointPush(v:unknown){
 if(typeof v!=="string"||v.length>2048)return null;
 try{
 const u=new URL(v);const h=u.hostname;
 if(u.protocol!=="https:"||u.username||u.password||u.port||u.hash||u.pathname==="/")return null;
 if(h==="fcm.googleapis.com"&&u.pathname.startsWith("/fcm/send/"))return u.href;
 if(h==="updates.push.services.mozilla.com"&&u.pathname.startsWith("/wpush/"))return u.href;
 if((h==="web.push.apple.com"||h.endsWith(".push.apple.com"))&&u.pathname.startsWith("/"))return u.href;
 if(h.endsWith(".notify.windows.com")&&u.pathname.startsWith("/"))return u.href;
 return null;
 }catch{return null}
}
function jwt(aud:string,privada:string){
 const enc=(d:object)=>Buffer.from(JSON.stringify(d)).toString("base64url");
 const base=enc({typ:"JWT",alg:"ES256"})+"."+enc({aud,exp:Math.floor(Date.now()/1000)+3600,sub:"https://foradapauta.org"});
 const sig=sign("sha256",Buffer.from(base),{key:createPrivateKey(privada),dsaEncoding:"ieee-p1363"}).toString("base64url");
 return base+"."+sig;
}
// Mensagem sem conteúdo: o service worker consulta os avisos autorizados no próprio site.
export async function avisarNovoComentario(id:string){
 await prepararPush();
 const alvos=await sql<{autor_hash:string;endpoint:string}[]>`
 SELECT s.autor_hash,s.endpoint FROM public.editoriais_push_inscricoes s
 JOIN public.editoriais_comentarios c ON c.id=${id}::uuid
 JOIN public.admin_artigos a ON a.id::text=c.editorial_slug AND a.status='publicado'
 WHERE c.estado='aprovado' AND s.autor_hash IS DISTINCT FROM c.autor_hash
 AND EXISTS(SELECT 1 FROM public.editoriais_comentarios p WHERE p.editorial_slug=c.editorial_slug AND p.autor_hash=s.autor_hash AND p.criado_em<=COALESCE(c.aprovado_em,c.criado_em))
 `;
 if(!alvos.length)return;
 const chave=await chavePush();
 let falhas=0;
 for(let i=0;i<alvos.length;i+=20){
  await Promise.allSettled(alvos.slice(i,i+20).map(async a=>{
   const url=endpointPush(a.endpoint);if(!url)return;
   try{
    const token=jwt(new URL(url).origin,chave.privada);
    const resp=await fetch(url,{method:"POST",headers:{TTL:"86400",Urgency:"normal",Authorization:"vapid t="+token+", k="+chave.publica,"Content-Length":"0"},redirect:"error",signal:AbortSignal.timeout(5000)});
    if(resp.status===404||resp.status===410)await sql`DELETE FROM public.editoriais_push_inscricoes WHERE autor_hash=${a.autor_hash} AND endpoint=${a.endpoint}`;
    else if(!resp.ok)falhas++;
    await resp.body?.cancel();
   }catch{falhas++}
  }));
 }
 if(falhas)console.error("Web Push: entregas não aceitas pelo provedor",falhas);
}

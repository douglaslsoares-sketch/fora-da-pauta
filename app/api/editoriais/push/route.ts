import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {sql} from "@/lib/interesses/db";
import {COOKIE_COMENTARIOS,hashAutor} from "@/lib/editoriais/comentarios";
import {prepararPush,chavePush,endpointPush} from "@/lib/editoriais/push";
import {consumeRateLimit} from "@/lib/rateLimit";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const reply=(d:unknown,status=200)=>NextResponse.json(d,{status,headers:{"Cache-Control":"private, no-store"}});
async function autor(){return hashAutor((await cookies()).get(COOKIE_COMENTARIOS)?.value)}
export async function GET(){
 const hash=await autor();if(!hash)return reply({participante:false,ativo:false});
 try{
 await prepararPush();
 const p=await sql`SELECT 1 FROM public.editoriais_comentarios WHERE autor_hash=${hash} LIMIT 1`;
 if(!p.length)return reply({participante:false,ativo:false});
 const rows=await sql`SELECT 1 FROM public.editoriais_push_inscricoes WHERE autor_hash=${hash}`;
 const chave=await chavePush();
 return reply({participante:true,ativo:rows.length>0,publica:chave.publica});
 }catch{return reply({erro:"Avisos indisponíveis."},503)}
}
export async function POST(r:Request){
 if(r.headers.get("origin")!==new URL(r.url).origin)return reply({erro:"Origem inválida."},403);
 const hash=await autor();if(!hash)return reply({erro:"Comente antes de ativar os avisos."},401);
 try{
 const l=await consumeRateLimit({request:r,scope:"editoriais:push",limit:10,windowSeconds:600});if(!l.allowed)return reply({erro:"Tente mais tarde."},429);
 const d=await r.json().catch(()=>null);
 await prepararPush();
 if(d?.acao==="desativar"){await sql`DELETE FROM public.editoriais_push_inscricoes WHERE autor_hash=${hash}`;return reply({ok:true})}
 const endpoint=endpointPush(d?.endpoint);
 if(d?.acao!=="ativar"||!endpoint)return reply({erro:"Serviço de notificações não compatível."},400);
 const p=await sql`SELECT 1 FROM public.editoriais_comentarios WHERE autor_hash=${hash} LIMIT 1`;
 if(!p.length)return reply({erro:"Comente antes de ativar os avisos."},403);
 await sql`INSERT INTO public.editoriais_push_inscricoes(autor_hash,endpoint) VALUES(${hash},${endpoint}) ON CONFLICT(autor_hash) DO UPDATE SET endpoint=EXCLUDED.endpoint,atualizado_em=now()`;
 return reply({ok:true});
 }catch{return reply({erro:"Não foi possível alterar os avisos."},503)}
}

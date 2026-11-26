import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {sql} from "@/lib/interesses/db";
import {prepararComentarios,COOKIE_COMENTARIOS,hashAutor} from "@/lib/editoriais/comentarios";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const reply=(d:unknown,status=200)=>NextResponse.json(d,{status,headers:{"Cache-Control":"private, no-store"}});
async function autor(){return hashAutor((await cookies()).get(COOKIE_COMENTARIOS)?.value)}
export async function GET(){
 const hash=await autor();if(!hash)return reply({avisos:[]});
 try{await prepararComentarios();const avisos=await sql`WITH RECURSIVE visiveis AS (
 SELECT c.id,c.editorial_slug,c.resposta_a,c.autor_hash,c.criado_em,1 AS nivel FROM public.editoriais_comentarios c JOIN public.admin_artigos a ON a.id::text=c.editorial_slug AND a.status='publicado' WHERE c.estado='aprovado' AND c.resposta_a IS NULL
 UNION ALL SELECT c.id,c.editorial_slug,c.resposta_a,c.autor_hash,c.criado_em,v.nivel+1 FROM public.editoriais_comentarios c JOIN visiveis v ON c.resposta_a=v.id AND c.editorial_slug=v.editorial_slug WHERE c.estado='aprovado' AND v.nivel<5
 ) SELECT v.id,v.editorial_slug,p.id AS comentario_id,v.criado_em FROM visiveis v JOIN visiveis p ON p.id=v.resposta_a WHERE p.autor_hash=${hash} AND v.autor_hash IS DISTINCT FROM ${hash} AND NOT EXISTS(SELECT 1 FROM public.editoriais_avisos_lidos l WHERE l.autor_hash=${hash} AND l.resposta_id=v.id) ORDER BY v.criado_em DESC LIMIT 100`;return reply({avisos})}catch{return reply({erro:"Avisos indisponíveis."},503)}
}
export async function POST(r:Request){
 if(r.headers.get("origin")!==new URL(r.url).origin)return reply({erro:"Origem inválida."},403);
 const hash=await autor();if(!hash)return reply({erro:"Sessão indisponível."},401);
 const d=await r.json().catch(()=>null);
 if(typeof d?.id!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.id))return reply({erro:"Aviso inválido."},400);
 try{await prepararComentarios();await sql`INSERT INTO public.editoriais_avisos_lidos(autor_hash,resposta_id) SELECT ${hash},r.id FROM public.editoriais_comentarios r JOIN public.editoriais_comentarios p ON p.id=r.resposta_a WHERE r.id=${d.id}::uuid AND p.autor_hash=${hash} ON CONFLICT DO NOTHING`;return reply({ok:true})}catch{return reply({erro:"Falha ao registrar leitura."},503)}
}

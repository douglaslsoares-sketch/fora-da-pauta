import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {sql} from "@/lib/interesses/db";
import {prepararComentarios,listarComentarios} from "@/lib/editoriais/comentarios";
import {QUESTIONS_ADMIN_COOKIE,verifyQuestionsAdminSessionToken} from "@/lib/questionsAdminAuth";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const reply=(d:unknown,status=200)=>NextResponse.json(d,{status,headers:{"Cache-Control":"no-store"}});
async function admin(){return verifyQuestionsAdminSessionToken((await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value)}
export async function GET(){if(!await admin())return reply({erro:"Acesso negado."},401);try{await prepararComentarios();const items=await sql`SELECT c.id,c.editorial_slug,c.texto,c.estado,c.denuncias,c.oficial,c.resposta_a,c.criado_em,a.titulo FROM public.editoriais_comentarios c LEFT JOIN public.admin_artigos a ON a.id::text=c.editorial_slug ORDER BY (c.estado='pendente') DESC,c.denuncias DESC,c.criado_em DESC LIMIT 300`;return reply({items})}catch{return reply({erro:"Comentários indisponíveis."},503)}}
export async function POST(r:Request){
 if(r.headers.get("origin")!==new URL(r.url).origin||!await admin())return reply({erro:"Acesso negado."},403);
 try{
 const d=await r.json().catch(()=>null);
 if(typeof d?.id!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.id))return reply({erro:"Comentário inválido."},400);
 await prepararComentarios();
 const rows=await sql`SELECT editorial_slug,estado FROM public.editoriais_comentarios WHERE id=${d.id}::uuid`;
 const c=rows[0];if(!c)return reply({erro:"Não encontrado."},404);
 if(d.acao==="aprovar"||d.acao==="rejeitar"){
 const estado=d.acao==="aprovar"?"aprovado":"rejeitado";
 await sql`UPDATE public.editoriais_comentarios SET estado=${estado} WHERE id=${d.id}::uuid`;
 }else if(d.acao==="responder"){
 const t=typeof d.texto==="string"?d.texto.trim():"";
 if(!t||t.length>2000||t.includes("\u0000"))return reply({erro:"Resposta inválida."},400);
 const visiveis=await listarComentarios(c.editorial_slug);
 if(!visiveis.some(x=>x.id===d.id&&Number(x.nivel)<5))return reply({erro:"Aprove o comentário e seus antecedentes antes de responder."},409);
 await sql`INSERT INTO public.editoriais_comentarios(id,editorial_slug,nome,texto,resposta_a,estado,oficial) VALUES(${randomUUID()}::uuid,${c.editorial_slug},'Fora da Pauta',${t},${d.id}::uuid,'aprovado',true)`;
 }else return reply({erro:"Ação inválida."},400);
 return reply({ok:true});
 }catch{return reply({erro:"Não foi possível concluir."},503)}
}

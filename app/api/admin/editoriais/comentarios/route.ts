import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {sql} from "@/lib/interesses/db";
import {prepararComentarios} from "@/lib/editoriais/comentarios";
import {listarPublicados} from "@/app/editoriais/acervo";
import {QUESTIONS_ADMIN_COOKIE,verifyQuestionsAdminSessionToken} from "@/lib/questionsAdminAuth";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const reply=(d:unknown,status=200)=>NextResponse.json(d,{status,headers:{"Cache-Control":"private, no-store"}});
const uuid=(v:unknown):v is string=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
async function admin(){return verifyQuestionsAdminSessionToken((await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value)}
export async function GET(){if(!await admin())return reply({erro:"Acesso negado."},401);try{await prepararComentarios();const editoriais=await listarPublicados();const items=await sql`SELECT c.id,c.editorial_slug,c.texto,c.estado,c.denuncias,c.oficial,c.criado_em,a.titulo FROM public.editoriais_comentarios c LEFT JOIN public.admin_artigos a ON a.id::text=c.editorial_slug ORDER BY (c.estado='pendente') DESC,c.denuncias DESC,c.criado_em DESC LIMIT 300`;return reply({items,editoriais:editoriais.map(a=>({slug:a.slug,titulo:a.titulo}))})}catch{return reply({erro:"Comentários indisponíveis."},503)}}
export async function POST(r:Request){
 if(r.headers.get("origin")!==new URL(r.url).origin||!await admin())return reply({erro:"Acesso negado."},403);
 try{
 const d=await r.json().catch(()=>null);
 await prepararComentarios();
 if(d?.acao==="comentar"){
 const t=typeof d.texto==="string"?d.texto.trim():"";
 if(!uuid(d.slug)||!t||t.length>2000||t.includes("\u0000"))return reply({erro:"Selecione um editorial e escreva o comentário."},400);
 const rows=await sql`INSERT INTO public.editoriais_comentarios(id,editorial_slug,nome,texto,estado,oficial,aprovado_em) SELECT ${randomUUID()}::uuid,a.id::text,'Fora da Pauta',${t},'aprovado',true,now() FROM public.admin_artigos a WHERE a.id=${d.slug}::uuid AND a.status='publicado' AND COALESCE(to_jsonb(a)->>'capa_url','') LIKE 'https://%' RETURNING id`;
 if(!rows.length)return reply({erro:"Editorial indisponível."},404);
 }else if(d?.acao==="aprovar"||d?.acao==="rejeitar"){
 if(!uuid(d.id))return reply({erro:"Comentário inválido."},400);
 const estado=d.acao==="aprovar"?"aprovado":"rejeitado";
 const rows=await sql`UPDATE public.editoriais_comentarios SET estado=${estado},aprovado_em=CASE WHEN ${estado}='aprovado' THEN COALESCE(aprovado_em,now()) ELSE aprovado_em END WHERE id=${d.id}::uuid RETURNING id`;
 if(!rows.length)return reply({erro:"Comentário não encontrado."},404);
 }else return reply({erro:"Ação inválida."},400);
 return reply({ok:true});
 }catch{return reply({erro:"Não foi possível concluir."},503)}
}

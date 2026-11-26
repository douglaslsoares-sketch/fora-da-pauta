import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {sql} from "@/lib/interesses/db";
import {prepararComentarios,listarComentarios,COOKIE_COMENTARIOS,hashAutor} from "@/lib/editoriais/comentarios";
import {consumeRateLimit} from "@/lib/rateLimit";
import {buscarPublicado} from "@/app/editoriais/acervo";
import {randomUUID,randomBytes} from "node:crypto";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const json=(d:unknown,status=200)=>NextResponse.json(d,{status,headers:{"Cache-Control":"no-store"}});
const uuid=(v:unknown):v is string=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
async function slug(r:Request){const s=new URL(r.url).searchParams.get("slug");return s && await buscarPublicado(s)?s:null}
export async function GET(r:Request){try{const s=await slug(r);if(!s)return json({erro:"Editorial não encontrado."},404);return json({comentarios:await listarComentarios(s)})}catch{return json({erro:"Comentários indisponíveis."},503)}}
async function validar(r:Request){if(r.headers.get("origin")!==new URL(r.url).origin)return false;const l=await consumeRateLimit({request:r,scope:"editoriais:comentarios",limit:8,windowSeconds:600});return l.allowed}
export async function POST(r:Request){try{
 const s=await slug(r);if(!s)return json({erro:"Editorial não encontrado."},404);
 if(!await validar(r))return json({erro:"Envio não permitido. Tente mais tarde."},429);
 const d=await r.json().catch(()=>null);
 const t=typeof d?.texto==="string"?d.texto.trim():"";
 if(!t||t.length>2000||t.includes("\u0000"))return json({erro:"Confira o comentário."},400);
 await prepararComentarios();
 const store=await cookies();let token=store.get(COOKIE_COMENTARIOS)?.value;
 if(!hashAutor(token))token=randomBytes(32).toString("hex");
 const hash=hashAutor(token)!;
 await sql`INSERT INTO public.editoriais_comentarios(id,editorial_slug,nome,texto,autor_hash) VALUES(${randomUUID()}::uuid,${s},'Anônimo',${t},${hash})`;
 const response=json({salvo:true},201);
 response.cookies.set(COOKIE_COMENTARIOS,token!,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:31536000});
 return response;
 }catch{return json({erro:"Não foi possível salvar."},503)}}
export async function PATCH(r:Request){try{const s=await slug(r);if(!s)return json({erro:"Editorial não encontrado."},404);if(!await validar(r))return json({erro:"Tente mais tarde."},429);const d=await r.json().catch(()=>null);if(!uuid(d?.id))return json({erro:"Comentário inválido."},400);await prepararComentarios();const rows=await sql`UPDATE public.editoriais_comentarios SET denuncias=denuncias+1 WHERE id=${d.id}::uuid AND editorial_slug=${s} AND estado='aprovado' RETURNING id`;return rows.length?json({salvo:true}):json({erro:"Comentário não encontrado."},404)}catch{return json({erro:"Não foi possível denunciar."},503)}}

import {NextResponse} from "next/server";
import {sql} from "@/lib/interesses/db";
import {prepararComentarios,listarComentarios} from "@/lib/editoriais/comentarios";
import {consumeRateLimit} from "@/lib/rateLimit";
import {publicados} from "@/app/editoriais/acervo";
import {randomUUID} from "node:crypto";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const json=(d:unknown,status=200)=>NextResponse.json(d,{status,headers:{"Cache-Control":"no-store"}});
function slug(r:Request){const s=new URL(r.url).searchParams.get("slug");return publicados.some(a=>a.slug===s)?s:null}
export async function GET(r:Request){const s=slug(r);if(!s)return json({erro:"Editorial não encontrado."},404);try{return json({comentarios:await listarComentarios(s)})}catch{return json({erro:"Comentários indisponíveis."},503)}}
async function validar(r:Request){if(r.headers.get("origin")!==new URL(r.url).origin)return false;const l=await consumeRateLimit({request:r,scope:"editoriais:comentarios",limit:8,windowSeconds:600});return l.allowed}
const uuid=(v:unknown):v is string=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export async function POST(r:Request){const s=slug(r);if(!s)return json({erro:"Editorial não encontrado."},404);try{if(!await validar(r))return json({erro:"Envio não permitido. Tente mais tarde."},429);const d=await r.json().catch(()=>null);const n=typeof d?.nome==="string"?d.nome.trim():"";const t=typeof d?.texto==="string"?d.texto.trim():"";const p=d?.resposta_a??null;if(!n||n.length>60||!t||t.length>2000||(p!==null&&!uuid(p)))return json({erro:"Confira os campos."},400);await prepararComentarios();if(p){const a=await sql`SELECT id FROM public.editoriais_comentarios WHERE id=${p}::uuid AND editorial_slug=${s} AND estado='aprovado'`;if(!a.length)return json({erro:"Comentário não encontrado."},400)}await sql`INSERT INTO public.editoriais_comentarios(id,editorial_slug,nome,texto,resposta_a) VALUES(${randomUUID()}::uuid,${s},${n},${t},${p}::uuid)`;return json({salvo:true},201)}catch{return json({erro:"Não foi possível salvar."},503)}}
export async function PATCH(r:Request){const s=slug(r);if(!s)return json({erro:"Editorial não encontrado."},404);try{if(!await validar(r))return json({erro:"Tente mais tarde."},429);const d=await r.json().catch(()=>null);if(!uuid(d?.id))return json({erro:"Comentário inválido."},400);await prepararComentarios();const rows=await sql`UPDATE public.editoriais_comentarios SET denuncias=denuncias+1 WHERE id=${d.id}::uuid AND editorial_slug=${s} AND estado='aprovado' RETURNING id`;return rows.length?json({salvo:true}):json({erro:"Comentário não encontrado."},404)}catch{return json({erro:"Não foi possível denunciar."},503)}}

import { cookies } from "next/headers";
import { sql } from "@/lib/interesses/db";
import { QUESTIONS_ADMIN_COOKIE, verifyQuestionsAdminSessionToken } from "@/lib/questionsAdminAuth";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return new Response(null,{status:404});
 const admin=verifyQuestionsAdminSessionToken((await cookies()).get(QUESTIONS_ADMIN_COOKIE)?.value);
 try{
 const [row]=await sql<{capa_bytes:Buffer|null;capa_tipo:string;status:string}[]>`SELECT capa_bytes,capa_tipo,status FROM public.admin_artigos WHERE id=${id}::uuid LIMIT 1`;
 if(!row?.capa_bytes||(!admin&&row.status!=="publicado")||!["image/jpeg","image/png","image/webp"].includes(row.capa_tipo))return new Response(null,{status:404});
 return new Response(new Uint8Array(row.capa_bytes),{headers:{"Content-Type":row.capa_tipo,"Content-Length":String(row.capa_bytes.length),"Cache-Control":row.status==="publicado"?"public, max-age=86400":"private, no-store","X-Content-Type-Options":"nosniff"}});
 }catch{return new Response(null,{status:404});}
}

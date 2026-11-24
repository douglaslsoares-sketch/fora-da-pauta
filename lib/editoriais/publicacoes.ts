import { sql } from "@/lib/interesses/db";
export type Publicacao = { id:string; titulo:string; resumo:string; conteudo:string; fontes:string; audio_url:string; updated_at:string };
export async function listarPublicacoes() {
 return sql<Publicacao[]>`SELECT id::text,titulo,resumo,conteudo,fontes,audio_url,updated_at::text FROM public.admin_artigos WHERE status='publicado' ORDER BY updated_at DESC,id DESC`;
}
export async function buscarPublicacao(id:string) {
 if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
 const rows = await sql<Publicacao[]>`SELECT id::text,titulo,resumo,conteudo,fontes,audio_url,updated_at::text FROM public.admin_artigos WHERE id=${id}::uuid AND status='publicado'`;
 return rows[0] ?? null;
}

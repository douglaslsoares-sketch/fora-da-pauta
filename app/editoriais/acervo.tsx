import Link from "next/link";
import { sql } from "@/lib/interesses/db";

export type CapaEditorial = {slug:string; titulo:string; capa:string; publicadoEm:string};
export type Editorial = CapaEditorial & {id:string;texto:string[]; fontes:string[]; resumo:string; audio:string};
type Row = {slug:string; titulo:string; capa:string; publicadoEm:string};
type DetailRow = Row & {id:string;conteudo:string; fontes:string; resumo:string};

// Apenas artigos efetivamente publicados e com capa integram a nova seção.
export async function listarPublicados(): Promise<CapaEditorial[]> {
  try {
    return await sql<Row[]>`
      SELECT COALESCE(NULLIF(to_jsonb(a)->>'slug',''),a.id::text) AS slug, a.titulo, to_jsonb(a)->>'capa_url' AS capa,
        a.updated_at::text AS "publicadoEm"
      FROM public.admin_artigos a
      WHERE a.status = 'publicado' AND COALESCE(to_jsonb(a)->>'capa_url','') LIKE 'https://%'
      ORDER BY a.updated_at DESC, a.id DESC
    `;
  } catch (e) {
    if ((e as {code?:string}).code === "42P01") return [];
    throw e;
  }
}
export async function buscarPublicado(slug:string): Promise<Editorial|null> {
  if (slug.length>100||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return null;
  try {
    const rows = await sql<DetailRow[]>`
      SELECT COALESCE(NULLIF(to_jsonb(a)->>'slug',''),a.id::text) AS slug, a.titulo, to_jsonb(a)->>'capa_url' AS capa,
        a.updated_at::text AS "publicadoEm", a.id::text AS id, a.conteudo, a.fontes, a.resumo
      FROM public.admin_artigos a
      WHERE (a.id::text = ${slug} OR to_jsonb(a)->>'slug' = ${slug}) AND a.status = 'publicado'
        AND COALESCE(to_jsonb(a)->>'capa_url','') LIKE 'https://%'
      LIMIT 1
    `;
    const a=rows[0];
    if (!a) return null;
    return {...a, texto:a.conteudo.split(/\n\s*\n/).filter(Boolean),
      fontes:a.fontes.split("\n").map(s=>s.trim()).filter(Boolean),
      audio:"/api/artigos/audio/"+a.id};
  } catch(e) {
    if ((e as {code?:string}).code === "42P01") return null;
    throw e;
  }
}
export function Capa({artigo}:{artigo:CapaEditorial}){
  return <Link href={"/editoriais/"+artigo.slug} aria-label={artigo.titulo} className="block overflow-hidden rounded-xl border border-slate-600"><img src={artigo.capa} alt={artigo.titulo} referrerPolicy="no-referrer" className="block aspect-video w-full object-contain"/></Link>
}

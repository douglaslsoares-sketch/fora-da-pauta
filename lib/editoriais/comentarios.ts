import {createHash} from "node:crypto";
import {sql} from "@/lib/interesses/db";
export async function prepararComentarios(){
 await sql`CREATE TABLE IF NOT EXISTS public.editoriais_comentarios (
 id uuid PRIMARY KEY,
 editorial_slug text NOT NULL,
 nome text NOT NULL CHECK (char_length(nome) BETWEEN 1 AND 60),
 texto text NOT NULL CHECK (char_length(texto) BETWEEN 1 AND 2000),
 criado_em timestamptz NOT NULL DEFAULT now(),
 resposta_a uuid REFERENCES public.editoriais_comentarios(id),
 estado text NOT NULL DEFAULT 'pendente' CHECK (estado IN ('pendente','aprovado','rejeitado')),
 denuncias integer NOT NULL DEFAULT 0
 )`;
 await sql`ALTER TABLE public.editoriais_comentarios ADD COLUMN IF NOT EXISTS oficial boolean NOT NULL DEFAULT false`;
 await sql`ALTER TABLE public.editoriais_comentarios ADD COLUMN IF NOT EXISTS autor_hash text`;
 await sql`CREATE INDEX IF NOT EXISTS editoriais_comentarios_autor_idx ON public.editoriais_comentarios(autor_hash)`;
 await sql`CREATE TABLE IF NOT EXISTS public.editoriais_avisos_lidos (autor_hash text NOT NULL, resposta_id uuid NOT NULL REFERENCES public.editoriais_comentarios(id) ON DELETE CASCADE, PRIMARY KEY(autor_hash,resposta_id))`;
 await sql`CREATE INDEX IF NOT EXISTS editoriais_comentarios_slug_idx ON public.editoriais_comentarios(editorial_slug,estado,criado_em)`;
}
export async function listarComentarios(slug:string){
 await prepararComentarios();
 return sql`WITH RECURSIVE visiveis AS (
 SELECT id,texto,criado_em,resposta_a,oficial,1 AS nivel FROM public.editoriais_comentarios WHERE editorial_slug=${slug} AND estado='aprovado' AND resposta_a IS NULL
 UNION ALL
 SELECT c.id,c.texto,c.criado_em,c.resposta_a,c.oficial,v.nivel+1 FROM public.editoriais_comentarios c JOIN visiveis v ON c.resposta_a=v.id
 WHERE c.editorial_slug=${slug} AND c.estado='aprovado' AND v.nivel<5
 ) SELECT * FROM visiveis ORDER BY criado_em ASC,id ASC LIMIT 500`;
}

export const COOKIE_COMENTARIOS = "fdp_comentarios_anon";
export function hashAutor(token:string|undefined){return token && /^[a-f0-9]{64}$/.test(token)?createHash("sha256").update(token).digest("hex"):null}

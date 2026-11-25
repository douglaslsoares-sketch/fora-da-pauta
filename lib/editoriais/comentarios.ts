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
 await sql`CREATE INDEX IF NOT EXISTS editoriais_comentarios_slug_idx ON public.editoriais_comentarios(editorial_slug,estado,criado_em)`;
}
export async function listarComentarios(slug:string){
 await prepararComentarios();
 return sql`SELECT id,nome,texto,criado_em,resposta_a FROM public.editoriais_comentarios WHERE editorial_slug=${slug} AND estado='aprovado' ORDER BY criado_em ASC LIMIT 200`;
}

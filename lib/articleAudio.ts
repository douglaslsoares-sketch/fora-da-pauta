import { sql } from "@/lib/interesses/db";
import { protegerArtigos } from "@/lib/editoriais/acervoProtegido";

export async function ensureArticleAudioTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS public.admin_artigos_audio (
      artigo_id uuid PRIMARY KEY REFERENCES public.admin_artigos(id) ON DELETE CASCADE,
      audio bytea NOT NULL,
      aprovado boolean NOT NULL DEFAULT false,
      gerado_em timestamptz NOT NULL DEFAULT now(),
      aprovado_em timestamptz
    )
  `;
  await sql`ALTER TABLE public.admin_artigos_audio ADD COLUMN IF NOT EXISTS formato text NOT NULL DEFAULT 'audio/mpeg'`;
  await protegerArtigos();
}

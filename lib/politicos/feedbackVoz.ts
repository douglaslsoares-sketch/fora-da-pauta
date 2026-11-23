import { sql } from "@/lib/interesses/db";

/**
 * Feedbacks de voz do Políticos, isolados das tabelas editoriais e eleitorais.
 * A tabela é preparada sem excluir ou modificar avaliações antigas.
 */
export async function garantirTabelaFeedbackVozPoliticos() {
  await sql`
    CREATE TABLE IF NOT EXISTS public.politicos_feedback_voz (
      id uuid PRIMARY KEY,
      audio bytea NOT NULL CHECK (octet_length(audio) BETWEEN 800 AND 3000000),
      mime_type text NOT NULL CHECK (mime_type IN ('audio/webm', 'audio/mp4', 'audio/ogg')),
      duracao_segundos integer CHECK (duracao_segundos BETWEEN 1 AND 300),
      criado_em timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS politicos_feedback_voz_criado_idx
      ON public.politicos_feedback_voz(criado_em DESC)
  `;
}

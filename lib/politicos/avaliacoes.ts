import { sql } from "@/lib/interesses/db";

/**
 * Estrutura isolada do feedback do Políticos, no banco compartilhado.
 * Não modifica os dados de acompanhamento nem de outros projetos.
 */
export async function garantirTabelaAvaliacoesPoliticos() {
  await sql`
    CREATE TABLE IF NOT EXISTS public.politicos_avaliacoes (
      id uuid PRIMARY KEY,
      nota integer NOT NULL CHECK (nota BETWEEN 1 AND 5),
      comentario text CHECK (comentario IS NULL OR char_length(comentario) <= 1200),
      criado_em timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS politicos_avaliacoes_criado_idx
      ON public.politicos_avaliacoes(criado_em DESC)
  `;
}

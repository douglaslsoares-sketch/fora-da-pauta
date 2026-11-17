// Executar somente em ambiente autorizado com DATABASE_URL configurada.
// Uso: node scripts/aplicar-site-acompanhamentos.mjs
// Nao altera nem remove tabelas do Telegram.
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL ausente. Nenhuma alteracao realizada.");
  process.exitCode = 1;
} else {
  const url = new URL(connectionString);
  url.searchParams.delete("schema");
  const db = postgres(url.toString(), { max: 1 });
  try {
    await db.begin(async tx => {
      await tx`
        CREATE TABLE IF NOT EXISTS public.site_visitantes (
          id uuid PRIMARY KEY,
          sessao_hash text NOT NULL UNIQUE,
          criado_em timestamptz NOT NULL DEFAULT now(),
          atualizado_em timestamptz NOT NULL DEFAULT now()
        )
      `;
      await tx`
        CREATE TABLE IF NOT EXISTS public.site_acompanhamentos (
          visitante_id uuid NOT NULL REFERENCES public.site_visitantes(id) ON DELETE CASCADE,
          candidatura_id text NOT NULL,
          criado_em timestamptz NOT NULL DEFAULT now(),
          PRIMARY KEY (visitante_id, candidatura_id)
        )
      `;
      await tx`
        CREATE INDEX IF NOT EXISTS site_acompanhamentos_candidatura_idx
        ON public.site_acompanhamentos(candidatura_id)
      `;
    });
    console.log("Estrutura de acompanhamento criada ou confirmada.");
  } catch (error) {
    console.error("Migracao nao concluida:", error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

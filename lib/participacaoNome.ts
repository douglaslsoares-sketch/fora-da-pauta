import { sql } from "@/lib/interesses/db";

export type SugestaoNome = {
  id: string;
  nome: string;
  justificativa: string;
  criadaEm: string;
};

export async function prepararParticipacaoNome() {
  await sql`
    CREATE TABLE IF NOT EXISTS public.participacao_nome_config (
      id smallint PRIMARY KEY CHECK (id = 1),
      aberta boolean NOT NULL DEFAULT false,
      atualizada_em timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    INSERT INTO public.participacao_nome_config (id, aberta)
    VALUES (1, false) ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS public.participacao_nome_sugestoes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      nome text NOT NULL CHECK (length(nome) BETWEEN 2 AND 60),
      justificativa text NOT NULL DEFAULT '' CHECK (length(justificativa) <= 400),
      criada_em timestamptz NOT NULL DEFAULT now()
    )
  `;
}

export async function participacaoNomeAberta(): Promise<boolean> {
  try {
    const rows = await sql<{ aberta: boolean }[]>`
      SELECT aberta FROM public.participacao_nome_config WHERE id = 1 LIMIT 1
    `;
    return rows[0]?.aberta === true;
  } catch {
    // Sem configuração ou sem banco, o convite nunca é exibido publicamente.
    return false;
  }
}

export async function listarSugestoesNome(): Promise<SugestaoNome[]> {
  const rows = await sql<{ id: string; nome: string; justificativa: string; criada_em: string }[]>`
    SELECT id::text, nome, justificativa, criada_em::text
    FROM public.participacao_nome_sugestoes
    ORDER BY criada_em DESC LIMIT 200
  `;
  return rows.map(r => ({
    id: r.id, nome: r.nome, justificativa: r.justificativa, criadaEm: r.criada_em,
  }));
}

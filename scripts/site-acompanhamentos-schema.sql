-- Fora da Pauta: estrutura independente de acompanhamento de politicos.
-- Preparacao apenas: este arquivo NAO executa automaticamente a migracao.
-- Nao remover nem modificar tabelas do Telegram nesta etapa.
CREATE TABLE IF NOT EXISTS public.site_visitantes (
  id uuid PRIMARY KEY,
  sessao_hash text NOT NULL UNIQUE,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_acompanhamentos (
  visitante_id uuid NOT NULL REFERENCES public.site_visitantes(id) ON DELETE CASCADE,
  candidatura_id text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (visitante_id, candidatura_id)
);

CREATE INDEX IF NOT EXISTS site_acompanhamentos_candidatura_idx
  ON public.site_acompanhamentos(candidatura_id);

-- Etapa posterior: endpoint autenticado por cookie HttpOnly/SameSite
-- deve gerar o token aleatorio e guardar apenas seu SHA-256.
-- Validar candidatura no servidor antes de inserir.
-- Nao confiar em IDs enviados pelo cliente para identificar visitantes.
-- Importacao de escolhas antigas exige vinculo comprovado com a sessao Telegram;
-- nunca copiar escolhas de outra pessoa por identificador fornecido pelo navegador.

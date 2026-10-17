-- Vincula um navegador a uma conversa Telegram somente apos confirmacao no bot.
-- Executar esta migracao ANTES de publicar os novos endpoints.
-- Sem alteracoes nos dados ou tabelas Telegram existentes.
CREATE TABLE IF NOT EXISTS public.telegram_sessoes_site (
  sessao_hash text PRIMARY KEY CHECK (sessao_hash ~ '^[a-f0-9]{64}$'),
  telegram_chat_id bigint,
  codigo_hash text UNIQUE CHECK (codigo_hash IS NULL OR codigo_hash ~ '^[a-f0-9]{64}$'),
  codigo_expira_at timestamptz,
  candidaturas_pendentes text[] NOT NULL DEFAULT '{}',
  vinculada_at timestamptz,
  expira_at timestamptz NOT NULL,
  criada_at timestamptz NOT NULL DEFAULT now(),
  CHECK (cardinality(candidaturas_pendentes) <= 100),
  CHECK ((codigo_hash IS NULL) = (codigo_expira_at IS NULL))
);

CREATE INDEX IF NOT EXISTS telegram_sessoes_site_expira_idx
  ON public.telegram_sessoes_site (expira_at);

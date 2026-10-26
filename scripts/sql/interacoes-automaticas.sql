-- Preparar e validar em ramificação Neon antes de aplicar à produção.
-- NÃO altera inscrições, fichas, nem tabelas existentes do Telegram.
CREATE TABLE IF NOT EXISTS public.interacoes_contatos_institucionais (
  candidatura_id text PRIMARY KEY CHECK (candidatura_id ~ '^[0-9]{8,20}$'),
  nome_publico text NOT NULL,
  endereco_email text NOT NULL,
  fonte_url text NOT NULL,
  origem text NOT NULL CHECK (origem IN ('camara_api','senado_api','orgao_oficial')),
  atualizado_at timestamptz NOT NULL DEFAULT now(),
  expira_at timestamptz NOT NULL,
  habilitado boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS interacoes_contatos_expiracao_idx
  ON public.interacoes_contatos_institucionais (expira_at)
  WHERE habilitado = true;

CREATE TABLE IF NOT EXISTS public.interacoes_remessas (
  interacao_id uuid PRIMARY KEY REFERENCES public.interacoes_politicas(id),
  candidatura_id text NOT NULL,
  endereco_destino text NOT NULL,
  origem_contato text NOT NULL,
  protocolo_externo text UNIQUE,
  status text NOT NULL CHECK (status IN (
    'processando','aceita_pelo_provedor','entregue','falhou','incerto'
  )),
  tentativas integer NOT NULL DEFAULT 1,
  criada_at timestamptz NOT NULL DEFAULT now(),
  aceita_at timestamptz,
  entregue_at timestamptz,
  atualizada_at timestamptz NOT NULL DEFAULT now(),
  falha_codigo text
);
CREATE INDEX IF NOT EXISTS interacoes_remessas_destinatario_idx
  ON public.interacoes_remessas (endereco_destino, criada_at DESC);
CREATE INDEX IF NOT EXISTS interacoes_remessas_status_idx
  ON public.interacoes_remessas (status, atualizada_at);

CREATE TABLE IF NOT EXISTS public.interacoes_webhooks_email (
  evento_id text PRIMARY KEY,
  evento_tipo text NOT NULL,
  registrado_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS interacoes_respostas_protocolo_unico_idx
  ON public.interacoes_politicas (id)
  WHERE resposta_confirmada_at IS NOT NULL;

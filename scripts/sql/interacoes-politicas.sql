-- Criar somente apos aprovacao da implantacao e backup do banco.
-- Manifestações privadas do cidadão, com vínculo exclusivo ao bot Telegram.
CREATE TABLE IF NOT EXISTS public.interacoes_politicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_chat_id bigint NOT NULL,
  candidatura_id text NOT NULL CHECK (candidatura_id ~ '^[0-9]{8,20}$'),
  categoria text NOT NULL CHECK (categoria IN (
    'pergunta','discordancia','elogio','sugestao','cobranca'
  )),
  mensagem text NOT NULL CHECK (char_length(mensagem) BETWEEN 15 AND 2000),
  contexto text NOT NULL CHECK (contexto IN ('ficha','materia')),
  origem_caminho text,
  autorizacao_encaminhamento_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'recebida' CHECK (status IN (
    'recebida','em_analise','encaminhada','respondida',
    'sem_resposta','nao_encaminhada'
  )),
  destino_oficial text,
  destino_fonte_url text,
  encaminhada_at timestamptz,
  resposta_texto text CHECK (resposta_texto IS NULL OR char_length(resposta_texto) BETWEEN 1 AND 2400),
  resposta_autoria text CHECK (resposta_autoria IS NULL OR resposta_autoria IN ('titular','assessoria','orgao')),
  resposta_origem_verificada text,
  resposta_confirmada_at timestamptz,
  notificacao_status text NOT NULL DEFAULT 'nao_aplicavel' CHECK (
    notificacao_status IN ('nao_aplicavel','pendente','processando','enviado','erro','incerto')
  ),
  notificacao_tentativas integer NOT NULL DEFAULT 0,
  notificacao_iniciada_at timestamptz,
  notificacao_enviada_at timestamptz,
  telegram_message_id bigint,
  ultimo_erro_codigo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT resposta_obrigatoria_quando_respondida CHECK (
    status <> 'respondida' OR
    (resposta_texto IS NOT NULL AND resposta_autoria IS NOT NULL
      AND resposta_origem_verificada IS NOT NULL AND resposta_confirmada_at IS NOT NULL)
  )
);
CREATE TABLE IF NOT EXISTS public.interacoes_politicas_historico (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  interacao_id uuid NOT NULL REFERENCES public.interacoes_politicas(id),
  evento text NOT NULL CHECK (evento IN (
    'recebida','em_analise','encaminhada','respondida','sem_resposta','nao_encaminhada'
  )),
  observacao text,
  registrado_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS interacoes_politicas_historico_idx
  ON public.interacoes_politicas_historico (interacao_id, registrado_at);

CREATE INDEX IF NOT EXISTS interacoes_politicas_cidadao_idx
  ON public.interacoes_politicas (telegram_chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS interacoes_politicas_fila_idx
  ON public.interacoes_politicas (created_at)
  WHERE notificacao_status IN ('pendente','erro','processando');
-- Não divulgar telegram_chat_id, corpo da manifestação ou respostas em endpoints públicos.

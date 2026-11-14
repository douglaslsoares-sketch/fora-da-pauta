import "server-only";
import { sql } from "@/lib/interesses/db";

// Estrutura descartável do ambiente de testes. Não copiar dados da produção.
// Apenas a rota autenticada e restrita à ramificação de revisão executa esta função.
const statements: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
    scope text NOT NULL CHECK (length(trim(scope)) BETWEEN 1 AND 80),
    subject_hash text NOT NULL CHECK (subject_hash ~ '^[0-9a-f]{64}$'),
    window_start timestamptz NOT NULL,
    window_seconds integer NOT NULL CHECK (window_seconds BETWEEN 60 AND 604800),
    hit_count integer NOT NULL DEFAULT 1 CHECK (hit_count BETWEEN 1 AND 1000000),
    expires_at timestamptz NOT NULL,
    PRIMARY KEY (scope, subject_hash, window_start, window_seconds),
    CHECK (expires_at > window_start)
  )`,
  `CREATE INDEX IF NOT EXISTS rate_limit_buckets_expires_idx ON public.rate_limit_buckets (expires_at)`,
  `CREATE TABLE IF NOT EXISTS public.admin_artigos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    resumo text NOT NULL DEFAULT '',
    conteudo text NOT NULL DEFAULT '',
    fontes text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'rascunho'
      CHECK (status IN ('rascunho', 'revisao', 'publicado', 'arquivado')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS public.admin_artigos_historico (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    artigo_id uuid NOT NULL REFERENCES public.admin_artigos(id),
    acao text NOT NULL,
    registrado_em timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS admin_artigos_historico_artigo_idx ON public.admin_artigos_historico (artigo_id, registrado_em DESC)`,
  `CREATE TABLE IF NOT EXISTS public.public_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_token_hash text NOT NULL UNIQUE,
    input_type text NOT NULL CHECK (input_type IN ('voice', 'text')),
    raw_transcript text CHECK (raw_transcript IS NULL OR length(raw_transcript) <= 5000),
    confirmed_text text NOT NULL CHECK (length(trim(confirmed_text)) BETWEEN 1 AND 2000),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'hidden')),
    response_text text CHECK (response_text IS NULL OR length(trim(response_text)) BETWEEN 1 AND 10000),
    is_public boolean NOT NULL DEFAULT false,
    response_published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT public_questions_public_answer_check CHECK (
      NOT is_public OR
      (status = 'answered' AND response_text IS NOT NULL AND response_published_at IS NOT NULL)
    )
  )`,
  `CREATE INDEX IF NOT EXISTS public_questions_created_idx ON public.public_questions (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS public_questions_public_idx ON public.public_questions (response_published_at DESC)
      WHERE is_public IS TRUE AND status = 'answered'`,
  `CREATE TABLE IF NOT EXISTS public.public_question_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid NOT NULL REFERENCES public.public_questions(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS public_question_events_question_idx ON public.public_question_events (question_id, created_at)`,
  `CREATE OR REPLACE FUNCTION public.set_public_question_updated_at() RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN NEW.updated_at = now(); RETURN NEW; END;
  $fn$`,
  `CREATE OR REPLACE FUNCTION public.protect_public_question_submission() RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      IF NEW.tracking_token_hash IS DISTINCT FROM OLD.tracking_token_hash
         OR NEW.input_type IS DISTINCT FROM OLD.input_type
         OR NEW.raw_transcript IS DISTINCT FROM OLD.raw_transcript
         OR NEW.confirmed_text IS DISTINCT FROM OLD.confirmed_text
         OR NEW.created_at IS DISTINCT FROM OLD.created_at
      THEN RAISE EXCEPTION 'A pergunta confirmada não pode ser alterada.'; END IF;
      RETURN NEW;
    END;
  $fn$`,
  `CREATE OR REPLACE FUNCTION public.protect_public_question_event_append_only() RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN RAISE EXCEPTION 'O histórico das perguntas não pode ser alterado.'; RETURN OLD; END;
  $fn$`,
  `DO $do$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_public_question_updated_at'
      AND tgrelid = 'public.public_questions'::regclass) THEN
      CREATE TRIGGER trg_public_question_updated_at BEFORE UPDATE ON public.public_questions
        FOR EACH ROW EXECUTE FUNCTION public.set_public_question_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_public_question_submission_immutable'
      AND tgrelid = 'public.public_questions'::regclass) THEN
      CREATE TRIGGER trg_public_question_submission_immutable BEFORE UPDATE ON public.public_questions
        FOR EACH ROW EXECUTE FUNCTION public.protect_public_question_submission();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_public_question_events_append_only'
      AND tgrelid = 'public.public_question_events'::regclass) THEN
      CREATE TRIGGER trg_public_question_events_append_only BEFORE UPDATE OR DELETE ON public.public_question_events
        FOR EACH ROW EXECUTE FUNCTION public.protect_public_question_event_append_only();
    END IF;
  END $do$`,
  `CREATE TABLE IF NOT EXISTS public.telegram_preferencias (
    telegram_chat_id bigint NOT NULL,
    tipo text NOT NULL,
    referencia text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'ativo',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    cancelled_at timestamptz,
    PRIMARY KEY (telegram_chat_id, tipo, referencia)
  )`,
  `CREATE TABLE IF NOT EXISTS public.telegram_acompanhamentos (
    telegram_chat_id bigint NOT NULL,
    candidatura_id text NOT NULL,
    identidade_politica_id text,
    status text NOT NULL DEFAULT 'ativo'
      CHECK (status IN ('ativo', 'nao_eleito', 'aguardando_eleicao', 'encerrado')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    cancelled_at timestamptz,
    PRIMARY KEY (telegram_chat_id, candidatura_id)
  )`,
  `CREATE TABLE IF NOT EXISTS public.telegram_sessoes_site (
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
  )`,
  `CREATE INDEX IF NOT EXISTS telegram_sessoes_site_expira_idx ON public.telegram_sessoes_site (expira_at)`,
  `CREATE TABLE IF NOT EXISTS public.telegram_vinculos_pendentes (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
    candidatura_ids text[] NOT NULL CHECK (cardinality(candidatura_ids) BETWEEN 1 AND 100),
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    consumed_at timestamptz,
    consumed_by_chat_id bigint,
    CHECK (expires_at > created_at),
    CHECK (
      (consumed_at IS NULL AND consumed_by_chat_id IS NULL)
      OR (consumed_at IS NOT NULL AND consumed_by_chat_id IS NOT NULL)
    )
  )`,
  `CREATE INDEX IF NOT EXISTS telegram_vinculos_pendentes_expira_idx
    ON public.telegram_vinculos_pendentes (expires_at) WHERE consumed_at IS NULL`,
  `CREATE TABLE IF NOT EXISTS public.telegram_fontes_notificacao (
    tipo text NOT NULL CHECK (tipo IN ('candidato', 'edicoes')),
    referencia text NOT NULL,
    inicializado_at timestamptz NOT NULL DEFAULT now(),
    verificado_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (tipo, referencia),
    CHECK ((tipo = 'candidato' AND referencia <> '') OR (tipo = 'edicoes' AND referencia = ''))
  )`,
  `CREATE TABLE IF NOT EXISTS public.telegram_eventos_conhecidos (
    tipo text NOT NULL,
    referencia text NOT NULL,
    evento_id text NOT NULL CHECK (evento_id <> ''),
    registrado_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (tipo, referencia, evento_id),
    FOREIGN KEY (tipo, referencia)
      REFERENCES public.telegram_fontes_notificacao (tipo, referencia)
  )`,
  `CREATE TABLE IF NOT EXISTS public.telegram_fila_avisos (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    telegram_chat_id bigint NOT NULL,
    tipo text NOT NULL,
    referencia text NOT NULL,
    evento_id text NOT NULL,
    texto text NOT NULL CHECK (char_length(texto) BETWEEN 1 AND 4096),
    status text NOT NULL DEFAULT 'pendente'
      CHECK (status IN ('pendente', 'processando', 'enviado', 'cancelado', 'erro', 'incerto')),
    tentativas integer NOT NULL DEFAULT 0 CHECK (tentativas >= 0),
    proxima_tentativa_at timestamptz NOT NULL DEFAULT now(),
    processamento_iniciado_at timestamptz,
    enviado_at timestamptz,
    telegram_message_id bigint,
    ultimo_erro_codigo text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (telegram_chat_id, tipo, referencia, evento_id),
    FOREIGN KEY (tipo, referencia, evento_id)
      REFERENCES public.telegram_eventos_conhecidos (tipo, referencia, evento_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_telegram_fila_avisos_pendentes
    ON public.telegram_fila_avisos (proxima_tentativa_at, id)
    WHERE status IN ('pendente', 'erro')`,
  `CREATE INDEX IF NOT EXISTS idx_telegram_fila_avisos_processando
    ON public.telegram_fila_avisos (processamento_iniciado_at) WHERE status = 'processando'`,
  `CREATE TABLE IF NOT EXISTS public.interacoes_politicas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_chat_id bigint NOT NULL,
    candidatura_id text NOT NULL CHECK (candidatura_id ~ '^[0-9]{8,20}$'),
    categoria text NOT NULL CHECK (categoria IN ('pergunta','discordancia','elogio','sugestao','cobranca')),
    mensagem text NOT NULL CHECK (char_length(mensagem) BETWEEN 15 AND 2000),
    contexto text NOT NULL CHECK (contexto IN ('ficha','materia')),
    origem_caminho text,
    autorizacao_encaminhamento_at timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'recebida'
      CHECK (status IN ('recebida','em_analise','encaminhada','respondida','sem_resposta','nao_encaminhada')),
    destino_oficial text,
    destino_fonte_url text,
    encaminhada_at timestamptz,
    resposta_texto text CHECK (resposta_texto IS NULL OR char_length(resposta_texto) BETWEEN 1 AND 2400),
    resposta_autoria text CHECK (resposta_autoria IS NULL OR resposta_autoria IN ('titular','assessoria','orgao')),
    resposta_origem_verificada text,
    resposta_confirmada_at timestamptz,
    notificacao_status text NOT NULL DEFAULT 'nao_aplicavel'
      CHECK (notificacao_status IN ('nao_aplicavel','pendente','processando','enviado','erro','incerto')),
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
  )`,
  `CREATE TABLE IF NOT EXISTS public.interacoes_politicas_historico (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    interacao_id uuid NOT NULL REFERENCES public.interacoes_politicas(id),
    evento text NOT NULL CHECK (evento IN (
      'recebida','em_analise','encaminhada','respondida','sem_resposta','nao_encaminhada'
    )),
    observacao text,
    registrado_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS interacoes_politicas_historico_idx
    ON public.interacoes_politicas_historico (interacao_id, registrado_at)`,
  `CREATE INDEX IF NOT EXISTS interacoes_politicas_cidadao_idx
    ON public.interacoes_politicas (telegram_chat_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS interacoes_politicas_fila_idx
    ON public.interacoes_politicas (created_at)
    WHERE notificacao_status IN ('pendente','erro','processando')`,
];

export async function prepararEstruturaDeTestes(): Promise<number> {
  await sql.begin(async tx => {
    for (const statement of statements) {
      // Comandos estáticos e versionados no repositório; nenhum SQL do usuário.
      await tx.unsafe(statement);
    }
  });
  const [{ total }] = await sql<{ total: number }[]>`
    SELECT count(*)::integer AS total FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN (
      'rate_limit_buckets', 'admin_artigos', 'admin_artigos_historico',
      'public_questions', 'public_question_events', 'telegram_preferencias',
      'telegram_acompanhamentos', 'telegram_sessoes_site',
      'telegram_vinculos_pendentes', 'telegram_fontes_notificacao',
      'telegram_eventos_conhecidos', 'telegram_fila_avisos',
      'interacoes_politicas', 'interacoes_politicas_historico'
    )
  `;
  return total;
}

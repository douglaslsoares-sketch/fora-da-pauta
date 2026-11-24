CREATE SCHEMA IF NOT EXISTS editoriais;
CREATE TABLE IF NOT EXISTS editoriais.publicacoes (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 slug text UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 titulo text NOT NULL,
 resumo text NOT NULL,
 categoria text NOT NULL,
 corpo text NOT NULL DEFAULT '',
 imagem_url text,
 audio_url text,
 fontes jsonb NOT NULL DEFAULT '[]'::jsonb,
 estado text NOT NULL DEFAULT 'rascunho' CHECK (estado IN ('rascunho','publicado','arquivado')),
 publicado_em timestamptz,
 criado_em timestamptz NOT NULL DEFAULT now(),
 CHECK (estado <> 'publicado' OR publicado_em IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS editoriais.inscricoes (
 endpoint text PRIMARY KEY,
 p256dh text NOT NULL,
 auth text NOT NULL,
 criado_em timestamptz NOT NULL DEFAULT now()
);

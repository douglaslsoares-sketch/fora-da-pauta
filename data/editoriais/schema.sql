CREATE SCHEMA IF NOT EXISTS editoriais;
-- Publicações permanecem em public.admin_artigos; não criar cadastro duplicado.
CREATE TABLE IF NOT EXISTS editoriais.inscricoes (
 endpoint text PRIMARY KEY,
 p256dh text NOT NULL,
 auth text NOT NULL,
 criado_em timestamptz NOT NULL DEFAULT now()
);

-- Feedback de voz sem notas. Tabela independente no banco PostgreSQL compartilhado.
-- Somente a administração autenticada pode recuperar o áudio.
CREATE TABLE IF NOT EXISTS public.politicos_feedback_voz (
  id uuid PRIMARY KEY,
  audio bytea NOT NULL CHECK (octet_length(audio) BETWEEN 800 AND 3000000),
  mime_type text NOT NULL CHECK (mime_type IN ('audio/webm', 'audio/mp4', 'audio/ogg')),
  duracao_segundos integer CHECK (duracao_segundos BETWEEN 1 AND 300),
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS politicos_feedback_voz_criado_idx
  ON public.politicos_feedback_voz(criado_em DESC);

-- Ampliação compatível com feedbacks anteriores; gravação do percurso sem campos digitados.
ALTER TABLE public.politicos_feedback_voz ADD COLUMN IF NOT EXISTS percurso jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.politicos_feedback_voz ADD COLUMN IF NOT EXISTS tipo_midia text NOT NULL DEFAULT 'audio';
ALTER TABLE public.politicos_feedback_voz DROP CONSTRAINT IF EXISTS politicos_feedback_voz_audio_check;
ALTER TABLE public.politicos_feedback_voz DROP CONSTRAINT IF EXISTS politicos_feedback_voz_mime_type_check;
ALTER TABLE public.politicos_feedback_voz ADD CONSTRAINT politicos_feedback_voz_audio_check
  CHECK (octet_length(audio) BETWEEN 800 AND 3400000);
ALTER TABLE public.politicos_feedback_voz ADD CONSTRAINT politicos_feedback_voz_mime_type_check
  CHECK (mime_type IN ('audio/webm', 'audio/mp4', 'audio/ogg', 'video/webm', 'video/mp4'));

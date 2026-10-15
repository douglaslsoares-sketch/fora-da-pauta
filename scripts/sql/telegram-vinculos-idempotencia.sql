ALTER TABLE public.telegram_vinculos_pendentes
  ADD COLUMN IF NOT EXISTS consumed_by_chat_id bigint;

ALTER TABLE public.telegram_vinculos_pendentes
  DROP CONSTRAINT IF EXISTS telegram_vinculos_pendentes_consumo_consistente;

ALTER TABLE public.telegram_vinculos_pendentes
  ADD CONSTRAINT telegram_vinculos_pendentes_consumo_consistente
  CHECK (
    (
      consumed_at IS NULL
      AND consumed_by_chat_id IS NULL
    )
    OR
    (
      consumed_at IS NOT NULL
      AND consumed_by_chat_id IS NOT NULL
    )
  );
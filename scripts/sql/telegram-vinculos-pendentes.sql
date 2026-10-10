CREATE TABLE IF NOT EXISTS public.telegram_vinculos_pendentes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  token_hash text NOT NULL UNIQUE
    CHECK (token_hash ~ '^[a-f0-9]{64}$'),

  candidatura_ids text[] NOT NULL
    CHECK (
      cardinality(candidatura_ids) >= 1
      AND cardinality(candidatura_ids) <= 100
    ),

  created_at timestamptz NOT NULL DEFAULT now(),

  expires_at timestamptz NOT NULL,

  consumed_at timestamptz,

  CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS telegram_vinculos_pendentes_expira_idx
  ON public.telegram_vinculos_pendentes (expires_at)
  WHERE consumed_at IS NULL;
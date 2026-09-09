BEGIN;

CREATE TABLE IF NOT EXISTS aggregate_topic_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_topic_id uuid NOT NULL
    REFERENCES aggregate_topics(id)
    ON DELETE CASCADE,
  alias_slug text NOT NULL UNIQUE,
  alias_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS
  aggregate_topic_aliases_topic_id_idx
  ON aggregate_topic_aliases(aggregate_topic_id);

INSERT INTO aggregate_topic_aliases (
  aggregate_topic_id,
  alias_slug,
  alias_label
)
SELECT
  at.id,
  aliases.alias_slug,
  aliases.alias_label
FROM aggregate_topics at
JOIN (
  VALUES
    ('saude', 'saude-publica', 'Saúde pública'),
    ('saude', 'sistema-publico-de-saude', 'Sistema público de saúde'),
    ('educacao', 'educacao-publica', 'Educação pública'),
    ('educacao', 'ensino-publico', 'Ensino público'),
    ('educacao', 'escolas-publicas', 'Escolas públicas')
) AS aliases(topic_slug, alias_slug, alias_label)
  ON aliases.topic_slug = at.slug
ON CONFLICT (alias_slug)
DO UPDATE SET
  aggregate_topic_id = EXCLUDED.aggregate_topic_id,
  alias_label = EXCLUDED.alias_label;

COMMIT;

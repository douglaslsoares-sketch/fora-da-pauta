-- =========================================================
-- FORA DA PAUTA
-- Campanha de Interesses
-- Migration 002 — agregação temática por participante único
-- PostgreSQL
--
-- Regra permanente:
-- cada participante conta no máximo UMA VEZ por tema.
-- Repetições posteriores do mesmo tema não aumentam
-- o número de pessoas nem o percentual daquele tema.
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 1. PARTICIPANTES PSEUDONIMIZADOS
-- =========================================================
-- Não armazena nome, e-mail ou documento.
-- participant_key_hash deve ser um identificador pseudonimizado
-- e estável o suficiente para reconhecer o mesmo participante
-- em sessões diferentes.

CREATE TABLE IF NOT EXISTS pseudonymous_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    participant_key_hash TEXT NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'blocked', 'deleted'))
);

CREATE INDEX IF NOT EXISTS idx_pseudonymous_participants_last_seen
    ON pseudonymous_participants (last_seen_at DESC);


-- =========================================================
-- 2. VINCULAR SESSÕES A UM PARTICIPANTE PSEUDONIMIZADO
-- =========================================================

ALTER TABLE audit_sessions
    ADD COLUMN IF NOT EXISTS participant_id UUID
        REFERENCES pseudonymous_participants(id)
        ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_audit_sessions_participant
    ON audit_sessions (participant_id, created_at);


-- =========================================================
-- 3. TAXONOMIA CANÔNICA DE TEMAS
-- =========================================================
-- interpreted_topics continua registrando o que a IA extraiu
-- em cada interação.
--
-- aggregate_topics representa a taxonomia consolidada usada
-- para contagem e percentuais.

CREATE TABLE IF NOT EXISTS aggregate_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,

    description TEXT,

    parent_topic_id UUID
        REFERENCES aggregate_topics(id)
        ON DELETE SET NULL,

    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aggregate_topics_parent
    ON aggregate_topics (parent_topic_id);

CREATE INDEX IF NOT EXISTS idx_aggregate_topics_active
    ON aggregate_topics (is_active);


-- =========================================================
-- 4. MAPEAR TEMA INTERPRETADO → TEMA CANÔNICO
-- =========================================================

CREATE TABLE IF NOT EXISTS interpreted_topic_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    interpreted_topic_id UUID NOT NULL
        REFERENCES interpreted_topics(id)
        ON DELETE CASCADE,

    aggregate_topic_id UUID NOT NULL
        REFERENCES aggregate_topics(id)
        ON DELETE RESTRICT,

    mapping_confidence NUMERIC(5,4)
        CHECK (
            mapping_confidence IS NULL OR
            (mapping_confidence >= 0 AND mapping_confidence <= 1)
        ),

    mapping_method TEXT NOT NULL DEFAULT 'model'
        CHECK (mapping_method IN ('model', 'rule', 'human')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (interpreted_topic_id, aggregate_topic_id)
);

CREATE INDEX IF NOT EXISTS idx_interpreted_topic_mappings_topic
    ON interpreted_topic_mappings (aggregate_topic_id);


-- =========================================================
-- 5. MENÇÃO ÚNICA POR PARTICIPANTE E TEMA
-- =========================================================
-- ESTA É A REGRA CENTRAL:
--
-- UNIQUE(participant_id, aggregate_topic_id)
--
-- Portanto:
-- - mesma pessoa fala "saúde" 1 vez  -> conta 1
-- - mesma pessoa fala "saúde" 20 vezes -> continua contando 1
-- - mesma pessoa fala "saúde" + "educação" -> conta 1 em cada tema

CREATE TABLE IF NOT EXISTS participant_topic_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    participant_id UUID NOT NULL
        REFERENCES pseudonymous_participants(id)
        ON DELETE CASCADE,

    aggregate_topic_id UUID NOT NULL
        REFERENCES aggregate_topics(id)
        ON DELETE RESTRICT,

    first_interpreted_topic_id UUID
        REFERENCES interpreted_topics(id)
        ON DELETE SET NULL,

    first_session_id UUID
        REFERENCES audit_sessions(id)
        ON DELETE SET NULL,

    first_mentioned_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Atualizado quando a pessoa volta a falar do mesmo tema.
    -- Não altera a contagem de pessoas.
    last_mentioned_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Quantas vezes o tema apareceu nas interações dessa pessoa.
    -- Serve apenas para auditoria/análise interna.
    -- NÃO deve ser usado como numerador do percentual de pessoas.
    raw_mention_count INTEGER NOT NULL DEFAULT 1
        CHECK (raw_mention_count >= 1),

    UNIQUE (participant_id, aggregate_topic_id)
);

CREATE INDEX IF NOT EXISTS idx_participant_topic_mentions_topic
    ON participant_topic_mentions (aggregate_topic_id);

CREATE INDEX IF NOT EXISTS idx_participant_topic_mentions_participant
    ON participant_topic_mentions (participant_id);

CREATE INDEX IF NOT EXISTS idx_participant_topic_mentions_first_date
    ON participant_topic_mentions (first_mentioned_at);


-- =========================================================
-- 6. FUNÇÃO SEGURA DE UPSERT DA MENÇÃO
-- =========================================================
-- Se o participante mencionar novamente o mesmo tema:
-- - NÃO cria nova linha;
-- - NÃO aumenta o número de participantes do tema;
-- - apenas atualiza last_mentioned_at;
-- - incrementa raw_mention_count para auditoria interna.

CREATE OR REPLACE FUNCTION register_participant_topic_mention(
    p_participant_id UUID,
    p_aggregate_topic_id UUID,
    p_interpreted_topic_id UUID DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_mentioned_at TIMESTAMPTZ DEFAULT now()
)
RETURNS participant_topic_mentions
LANGUAGE plpgsql
AS $$
DECLARE
    result participant_topic_mentions;
BEGIN
    INSERT INTO participant_topic_mentions (
        participant_id,
        aggregate_topic_id,
        first_interpreted_topic_id,
        first_session_id,
        first_mentioned_at,
        last_mentioned_at,
        raw_mention_count
    )
    VALUES (
        p_participant_id,
        p_aggregate_topic_id,
        p_interpreted_topic_id,
        p_session_id,
        p_mentioned_at,
        p_mentioned_at,
        1
    )
    ON CONFLICT (participant_id, aggregate_topic_id)
    DO UPDATE SET
        last_mentioned_at = GREATEST(
            participant_topic_mentions.last_mentioned_at,
            EXCLUDED.last_mentioned_at
        ),
        raw_mention_count = participant_topic_mentions.raw_mention_count + 1
    RETURNING * INTO result;

    RETURN result;
END;
$$;


-- =========================================================
-- 7. SNAPSHOTS AGREGADOS
-- =========================================================
-- Guarda o retrato histórico do percentual por tema.
--
-- participant_count:
-- número de participantes únicos que mencionaram o tema.
--
-- denominator_participant_count:
-- base total de participantes válidos usada no cálculo.
--
-- mention_percentage:
-- participant_count / denominator_participant_count * 100.
--
-- Os percentuais entre temas NÃO precisam somar 100%.

CREATE TABLE IF NOT EXISTS aggregate_topic_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    aggregate_topic_id UUID NOT NULL
        REFERENCES aggregate_topics(id)
        ON DELETE CASCADE,

    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    participant_count INTEGER NOT NULL
        CHECK (participant_count >= 0),

    denominator_participant_count INTEGER NOT NULL
        CHECK (denominator_participant_count >= 0),

    mention_percentage NUMERIC(7,4) NOT NULL
        CHECK (mention_percentage >= 0 AND mention_percentage <= 100),

    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    calculation_version TEXT,

    CHECK (period_end > period_start),

    UNIQUE (
        aggregate_topic_id,
        period_start,
        period_end,
        calculation_version
    )
);

CREATE INDEX IF NOT EXISTS idx_aggregate_topic_snapshots_topic_period
    ON aggregate_topic_snapshots (
        aggregate_topic_id,
        period_start,
        period_end
    );


-- =========================================================
-- 8. VIEW PARA CONTAGEM ATUAL DE PESSOAS ÚNICAS POR TEMA
-- =========================================================

CREATE OR REPLACE VIEW current_topic_unique_participant_counts AS
SELECT
    at.id AS aggregate_topic_id,
    at.slug,
    at.name,
    COUNT(ptm.participant_id)::BIGINT AS unique_participant_count
FROM aggregate_topics at
LEFT JOIN participant_topic_mentions ptm
    ON ptm.aggregate_topic_id = at.id
WHERE at.is_active = true
GROUP BY
    at.id,
    at.slug,
    at.name;


-- =========================================================
-- 9. updated_at DOS TEMAS
-- =========================================================

CREATE OR REPLACE FUNCTION set_aggregate_topic_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_aggregate_topics_updated_at
    ON aggregate_topics;

CREATE TRIGGER trg_aggregate_topics_updated_at
BEFORE UPDATE ON aggregate_topics
FOR EACH ROW
EXECUTE FUNCTION set_aggregate_topic_updated_at();


-- =========================================================
-- REGRA CONSOLIDADA
-- =========================================================
--
-- Métrica pública:
-- "percentual de participantes que mencionaram o tema"
--
-- Numerador:
-- COUNT(DISTINCT participant_id) por aggregate_topic_id
--
-- Denominador:
-- número de participantes válidos da base/período definido
--
-- Uma pessoa só pode aumentar o numerador de um tema UMA VEZ,
-- independentemente do número de vezes que volte a mencioná-lo.
--
-- raw_mention_count registra repetição apenas para auditoria
-- e análise interna; nunca para o percentual público.
-- =========================================================

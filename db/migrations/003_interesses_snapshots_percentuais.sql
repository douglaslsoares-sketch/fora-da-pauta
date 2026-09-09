/*
 * FORA DA PAUTA — CAMPANHA "SEUS INTERESSES"
 * Migration 003
 *
 * Denominador: participantes distintos com pelo menos uma interpretação
 * confirmada no período.
 * Numerador por tema: participantes distintos com pelo menos um tema
 * confirmado e mapeado ao tema canônico no mesmo período.
 * Intervalo: period_start <= confirmed_at < period_end.
 */
CREATE OR REPLACE FUNCTION refresh_aggregate_topic_snapshots(
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_calculation_version text DEFAULT 'confirmed-at-v1'
)
RETURNS TABLE (
  aggregate_topic_id uuid,
  slug text,
  name text,
  participant_count integer,
  denominator_participant_count integer,
  mention_percentage numeric,
  calculated_at timestamptz
)
LANGUAGE plpgsql
AS $function$
#variable_conflict use_column
DECLARE
  v_denominator integer;
  v_version text;
BEGIN
  IF p_period_start IS NULL
     OR p_period_end IS NULL
     OR p_period_end <= p_period_start
  THEN
    RAISE EXCEPTION
      'Período inválido: period_end deve ser posterior a period_start.';
  END IF;

  v_version :=
    COALESCE(
      NULLIF(BTRIM(p_calculation_version), ''),
      'confirmed-at-v1'
    );

  SELECT COUNT(DISTINCT s.participant_id)::integer
  INTO v_denominator
  FROM interpretations i
  JOIN audit_sessions s
    ON s.id = i.session_id
  WHERE i.confirmed_by_user IS TRUE
    AND i.confirmed_at IS NOT NULL
    AND s.participant_id IS NOT NULL
    AND i.confirmed_at >= p_period_start
    AND i.confirmed_at < p_period_end;

  RETURN QUERY
  WITH topic_counts AS (
    SELECT
      at.id AS aggregate_topic_id,
      COUNT(DISTINCT s.participant_id)::integer AS participant_count
    FROM aggregate_topics at
    LEFT JOIN interpreted_topic_mappings itm
      ON itm.aggregate_topic_id = at.id
    LEFT JOIN interpreted_topics it
      ON it.id = itm.interpreted_topic_id
    LEFT JOIN interpretations i
      ON i.id = it.interpretation_id
     AND i.confirmed_by_user IS TRUE
     AND i.confirmed_at IS NOT NULL
     AND i.confirmed_at >= p_period_start
     AND i.confirmed_at < p_period_end
    LEFT JOIN audit_sessions s
      ON s.id = i.session_id
     AND s.participant_id IS NOT NULL
    WHERE at.is_active IS TRUE
    GROUP BY at.id
  ),
  upserted AS (
    INSERT INTO aggregate_topic_snapshots (
      aggregate_topic_id,
      period_start,
      period_end,
      participant_count,
      denominator_participant_count,
      mention_percentage,
      calculated_at,
      calculation_version
    )
    SELECT
      tc.aggregate_topic_id,
      p_period_start,
      p_period_end,
      tc.participant_count,
      v_denominator,
      CASE
        WHEN v_denominator = 0 THEN 0::numeric
        ELSE ROUND((tc.participant_count::numeric * 100::numeric) / v_denominator::numeric, 2)
      END,
      now(),
      v_version
    FROM topic_counts tc
    ON CONFLICT (
      aggregate_topic_id,
      period_start,
      period_end,
      calculation_version
    )
    DO UPDATE SET
      participant_count = EXCLUDED.participant_count,
      denominator_participant_count = EXCLUDED.denominator_participant_count,
      mention_percentage = EXCLUDED.mention_percentage,
      calculated_at = now()
    RETURNING
      aggregate_topic_snapshots.aggregate_topic_id,
      aggregate_topic_snapshots.participant_count,
      aggregate_topic_snapshots.denominator_participant_count,
      aggregate_topic_snapshots.mention_percentage,
      aggregate_topic_snapshots.calculated_at
  )
  SELECT
    u.aggregate_topic_id,
    at.slug,
    at.name,
    u.participant_count,
    u.denominator_participant_count,
    u.mention_percentage,
    u.calculated_at
  FROM upserted u
  JOIN aggregate_topics at
    ON at.id = u.aggregate_topic_id
  ORDER BY at.name;
END;
$function$;

COMMENT ON FUNCTION refresh_aggregate_topic_snapshots(
  timestamptz,
  timestamptz,
  text
)
IS
'Calcula e persiste snapshots de participantes únicos por tema. '
'Denominador: participantes distintos com interpretação confirmada no período. '
'Numerador: participantes distintos mapeados ao tema canônico no mesmo período. '
'Intervalo: period_start <= confirmed_at < period_end.';

-- 008_thread_privacy_and_question_access.down.sql
--
-- Restaura o esquema anterior à migração 008.
--
-- Por segurança, o rollback é recusado se já existirem:
-- - autorizações granulares;
-- - fios privados.

DO $rollback_guard$
DECLARE
  grant_count bigint;
  private_thread_count bigint;
BEGIN

  SELECT COUNT(*)
  INTO grant_count
  FROM prelaunch_consultation_question_grants;

  SELECT COUNT(*)
  INTO private_thread_count
  FROM prelaunch_consultation_threads
  WHERE
    thread_kind = 'party_private'
    OR counterparty_party_id IS NOT NULL;

  IF grant_count <> 0 THEN
    RAISE EXCEPTION
      'Rollback 008 recusado: existem question grants.';
  END IF;

  IF private_thread_count <> 0 THEN
    RAISE EXCEPTION
      'Rollback 008 recusado: existem fios privados.';
  END IF;

END
$rollback_guard$;

-- statement-breakpoint

DROP TABLE
prelaunch_consultation_question_grants;

-- statement-breakpoint

DROP INDEX
prelaunch_threads_counterparty_idx;

-- statement-breakpoint

DROP INDEX
prelaunch_threads_private_party_unique_idx;

-- statement-breakpoint

DROP INDEX
prelaunch_threads_shared_question_unique_idx;

-- statement-breakpoint

ALTER TABLE prelaunch_consultation_threads
DROP CONSTRAINT prelaunch_threads_counterparty_fkey;

-- statement-breakpoint

ALTER TABLE prelaunch_consultation_threads
DROP CONSTRAINT prelaunch_threads_counterparty_check;

-- statement-breakpoint

ALTER TABLE prelaunch_consultation_threads
DROP CONSTRAINT prelaunch_threads_kind_check;

-- statement-breakpoint

ALTER TABLE prelaunch_consultation_threads
DROP COLUMN counterparty_party_id;

-- statement-breakpoint

ALTER TABLE prelaunch_consultation_threads
DROP COLUMN thread_kind;

-- statement-breakpoint

CREATE UNIQUE INDEX
prelaunch_threads_question_unique_idx
ON prelaunch_consultation_threads(
  version_id,
  question_id
)
WHERE question_id IS NOT NULL;
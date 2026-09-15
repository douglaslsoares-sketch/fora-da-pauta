-- 008_thread_privacy_and_question_access.sql
--
-- Evolui o modelo de consultas para:
-- 1. contexto comum por pergunta;
-- 2. fios privados por contraparte;
-- 3. autorização granular por pergunta.
--
-- Esta migração NÃO move mensagens existentes.
-- Os fios já existentes tornam-se shared_context.

ALTER TABLE prelaunch_consultation_threads
ADD COLUMN thread_kind text NOT NULL
DEFAULT 'shared_context';

-- statement-breakpoint

ALTER TABLE prelaunch_consultation_threads
ADD COLUMN counterparty_party_id uuid;

-- statement-breakpoint

ALTER TABLE prelaunch_consultation_threads
ADD CONSTRAINT prelaunch_threads_kind_check
CHECK (
  thread_kind IN (
    'shared_context',
    'party_private'
  )
);

-- statement-breakpoint

ALTER TABLE prelaunch_consultation_threads
ADD CONSTRAINT prelaunch_threads_counterparty_check
CHECK (
  (
    thread_kind = 'shared_context'
    AND counterparty_party_id IS NULL
  )
  OR
  (
    thread_kind = 'party_private'
    AND question_id IS NOT NULL
    AND counterparty_party_id IS NOT NULL
  )
);

-- statement-breakpoint

ALTER TABLE prelaunch_consultation_threads
ADD CONSTRAINT prelaunch_threads_counterparty_fkey
FOREIGN KEY (
  counterparty_party_id,
  consultation_id
)
REFERENCES prelaunch_consultation_parties(
  id,
  consultation_id
)
ON DELETE RESTRICT;

-- statement-breakpoint

DROP INDEX prelaunch_threads_question_unique_idx;

-- statement-breakpoint

CREATE UNIQUE INDEX
prelaunch_threads_shared_question_unique_idx
ON prelaunch_consultation_threads(
  version_id,
  question_id
)
WHERE
  question_id IS NOT NULL
  AND thread_kind = 'shared_context';

-- statement-breakpoint

CREATE UNIQUE INDEX
prelaunch_threads_private_party_unique_idx
ON prelaunch_consultation_threads(
  version_id,
  question_id,
  counterparty_party_id
)
WHERE
  question_id IS NOT NULL
  AND thread_kind = 'party_private';

-- statement-breakpoint

CREATE INDEX
prelaunch_threads_counterparty_idx
ON prelaunch_consultation_threads(
  consultation_id,
  counterparty_party_id
)
WHERE counterparty_party_id IS NOT NULL;

-- statement-breakpoint

CREATE TABLE prelaunch_consultation_question_grants (

  id uuid PRIMARY KEY
    DEFAULT gen_random_uuid(),

  consultation_id uuid NOT NULL,

  version_id uuid NOT NULL,

  question_id uuid NOT NULL,

  party_id uuid NOT NULL,

  can_view_shared_context boolean
    NOT NULL
    DEFAULT true,

  can_view_private_thread boolean
    NOT NULL
    DEFAULT true,

  can_send_messages boolean
    NOT NULL
    DEFAULT true,

  valid_from timestamptz
    NOT NULL
    DEFAULT now(),

  valid_until timestamptz,

  revoked_at timestamptz,

  created_at timestamptz
    NOT NULL
    DEFAULT now(),

  CONSTRAINT prelaunch_qgrants_send_check
    CHECK (
      NOT can_send_messages
      OR can_view_private_thread
    ),

  CONSTRAINT prelaunch_qgrants_valid_until_check
    CHECK (
      valid_until IS NULL
      OR valid_until > valid_from
    ),

  CONSTRAINT prelaunch_qgrants_revoked_check
    CHECK (
      revoked_at IS NULL
      OR revoked_at >= valid_from
    ),

  CONSTRAINT prelaunch_qgrants_version_fkey
    FOREIGN KEY (
      version_id,
      consultation_id
    )
    REFERENCES prelaunch_consultation_versions(
      id,
      consultation_id
    )
    ON DELETE CASCADE,

  CONSTRAINT prelaunch_qgrants_question_fkey
    FOREIGN KEY (
      question_id,
      version_id
    )
    REFERENCES prelaunch_consultation_questions(
      id,
      version_id
    )
    ON DELETE CASCADE,

  CONSTRAINT prelaunch_qgrants_party_fkey
    FOREIGN KEY (
      party_id,
      consultation_id
    )
    REFERENCES prelaunch_consultation_parties(
      id,
      consultation_id
    )
    ON DELETE CASCADE,

  CONSTRAINT prelaunch_qgrants_id_consultation_key
    UNIQUE (
      id,
      consultation_id
    )
);

-- statement-breakpoint

CREATE UNIQUE INDEX
prelaunch_qgrants_active_unique_idx
ON prelaunch_consultation_question_grants(
  consultation_id,
  question_id,
  party_id
)
WHERE revoked_at IS NULL;

-- statement-breakpoint

CREATE INDEX
prelaunch_qgrants_party_idx
ON prelaunch_consultation_question_grants(
  consultation_id,
  party_id,
  question_id
);
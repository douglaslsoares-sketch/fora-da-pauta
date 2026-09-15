BEGIN;

-- =========================================================
-- FORA DA PAUTA
-- SISTEMA DE CONSULTAS DO PRÉ-LANÇAMENTO
-- MIGRATION 007
--
-- Estrutura geral para consultas jurídicas, contábeis,
-- execução, comunicação, plataforma, meios de pagamento
-- e outros serviços.
--
-- Princípios:
-- - documento-base versionado;
-- - identificação por SHA-256;
-- - diálogo cronológico;
-- - registro do autor efetivo dos atos;
-- - representação formal com poderes delimitados;
-- - representante distinto do executor;
-- - mensagens e resultados preservados;
-- - propostas comerciais versionadas;
-- - composição detalhada de preços;
-- - proposta não equivale a contratação;
-- - trilha de auditoria.
-- =========================================================


CREATE TABLE prelaunch_consultations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    category text NOT NULL,
    title text NOT NULL,
    description text,
    requires_commercial_proposal boolean NOT NULL DEFAULT true,
    commercial_instructions text,
    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','open','paused','closed','archived')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE prelaunch_consultation_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid NOT NULL
        REFERENCES prelaunch_consultations(id)
        ON DELETE CASCADE,
    version_number integer NOT NULL CHECK (version_number > 0),
    source_hash text NOT NULL
        CHECK (source_hash ~ '^[0-9A-F]{64}$'),
    source_filename text,
    source_document text NOT NULL,
    status text NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','open','closed','superseded')),
    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE (consultation_id, version_number),
    UNIQUE (consultation_id, source_hash),
    UNIQUE (id, consultation_id)
);


CREATE TABLE prelaunch_consultation_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id uuid NOT NULL
        REFERENCES prelaunch_consultation_versions(id)
        ON DELETE CASCADE,
    question_code text NOT NULL,
    section_code text,
    section_title text,
    question_text text NOT NULL,
    position integer NOT NULL CHECK (position > 0),
    confidentiality text NOT NULL DEFAULT 'standard'
        CHECK (confidentiality IN ('standard','restricted')),
    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE (version_id, question_code),
    UNIQUE (version_id, position),
    UNIQUE (id, version_id)
);


CREATE INDEX prelaunch_questions_version_idx
    ON prelaunch_consultation_questions(version_id);


CREATE TABLE prelaunch_consultation_parties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid NOT NULL
        REFERENCES prelaunch_consultations(id)
        ON DELETE CASCADE,

    party_kind text NOT NULL
        CHECK (party_kind IN ('person','organization')),

    role text NOT NULL
        CHECK (
            role IN (
                'brand_owner',
                'authorized_representative',
                'project',
                'professional',
                'provider',
                'observer'
            )
        ),

    display_name text NOT NULL,
    organization_name text,
    credential_type text,
    credential_display text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE (id, consultation_id)
);


COMMENT ON COLUMN prelaunch_consultation_parties.credential_display IS
'Identificação profissional exibível, como OAB, CRC ou identificação empresarial. Não é senha.';


CREATE TABLE prelaunch_consultation_representations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid NOT NULL,

    principal_party_id uuid NOT NULL,
    representative_party_id uuid NOT NULL,

    instrument_type text
        CHECK (
            instrument_type IS NULL
            OR instrument_type IN (
                'authorization',
                'power_of_attorney',
                'mandate',
                'contract',
                'other'
            )
        ),

    instrument_reference text,
    scope_summary text,

    can_send_messages boolean NOT NULL DEFAULT true,
    can_receive_messages boolean NOT NULL DEFAULT true,
    can_request_clarifications boolean NOT NULL DEFAULT true,
    can_request_proposals boolean NOT NULL DEFAULT true,

    can_negotiate_nonbinding_terms boolean NOT NULL DEFAULT false,
    can_sign_contracts boolean NOT NULL DEFAULT false,
    can_assume_financial_obligations boolean NOT NULL DEFAULT false,
    can_access_restricted_content boolean NOT NULL DEFAULT false,

    valid_from timestamptz NOT NULL DEFAULT now(),
    valid_until timestamptz,
    revoked_at timestamptz,

    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),

    FOREIGN KEY (principal_party_id, consultation_id)
        REFERENCES prelaunch_consultation_parties(id, consultation_id)
        ON DELETE RESTRICT,

    FOREIGN KEY (representative_party_id, consultation_id)
        REFERENCES prelaunch_consultation_parties(id, consultation_id)
        ON DELETE RESTRICT,

    UNIQUE (id, consultation_id),

    CHECK (principal_party_id <> representative_party_id),

    CHECK (
        valid_until IS NULL
        OR valid_until > valid_from
    ),

    CHECK (
        revoked_at IS NULL
        OR revoked_at >= valid_from
    )
);


COMMENT ON TABLE prelaunch_consultation_representations IS
'Registra poderes efetivamente concedidos ao representante. A existência formal da representação não substitui a realidade dos atos praticados.';


CREATE INDEX prelaunch_representations_parties_idx
    ON prelaunch_consultation_representations(
        consultation_id,
        principal_party_id,
        representative_party_id
    );


CREATE TABLE prelaunch_consultation_access_grants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid NOT NULL,
    party_id uuid NOT NULL,
    representation_id uuid,

    access_scope text NOT NULL DEFAULT 'standard'
        CHECK (access_scope IN ('standard','full')),

    auth_method text NOT NULL,
    auth_reference_hash text,

    valid_from timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz,
    revoked_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),

    FOREIGN KEY (party_id, consultation_id)
        REFERENCES prelaunch_consultation_parties(id, consultation_id)
        ON DELETE CASCADE,

    FOREIGN KEY (representation_id, consultation_id)
        REFERENCES prelaunch_consultation_representations(id, consultation_id)
        ON DELETE RESTRICT,

    CHECK (
        expires_at IS NULL
        OR expires_at > valid_from
    )
);


CREATE INDEX prelaunch_access_party_idx
    ON prelaunch_consultation_access_grants(
        consultation_id,
        party_id
    );


CREATE TABLE prelaunch_consultation_threads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid NOT NULL,
    version_id uuid NOT NULL,
    question_id uuid,
    subject text,

    status text NOT NULL DEFAULT 'open'
        CHECK (
            status IN (
                'open',
                'waiting_project',
                'waiting_external',
                'concluded',
                'closed'
            )
        ),

    created_at timestamptz NOT NULL DEFAULT now(),
    closed_at timestamptz,

    FOREIGN KEY (version_id, consultation_id)
        REFERENCES prelaunch_consultation_versions(id, consultation_id)
        ON DELETE CASCADE,

    FOREIGN KEY (question_id, version_id)
        REFERENCES prelaunch_consultation_questions(id, version_id)
        ON DELETE CASCADE,

    UNIQUE (id, consultation_id),

    CHECK (
        closed_at IS NULL
        OR closed_at >= created_at
    )
);


CREATE UNIQUE INDEX prelaunch_threads_question_unique_idx
    ON prelaunch_consultation_threads(version_id, question_id)
    WHERE question_id IS NOT NULL;


CREATE INDEX prelaunch_threads_status_idx
    ON prelaunch_consultation_threads(
        consultation_id,
        status
    );


CREATE TABLE prelaunch_consultation_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid NOT NULL,
    thread_id uuid NOT NULL,

    sequence_no integer NOT NULL CHECK (sequence_no > 0),

    author_party_id uuid,
    representation_id uuid,

    author_capacity text NOT NULL
        CHECK (
            author_capacity IN (
                'brand_owner',
                'authorized_representative',
                'project',
                'professional',
                'provider',
                'system'
            )
        ),

    message_kind text NOT NULL DEFAULT 'message'
        CHECK (
            message_kind IN (
                'message',
                'clarification',
                'correction',
                'system'
            )
        ),

    body text NOT NULL
        CHECK (length(btrim(body)) > 0),

    reply_to_message_id uuid,
    supersedes_message_id uuid,

    previous_message_hash text
        CHECK (
            previous_message_hash IS NULL
            OR previous_message_hash ~ '^[0-9A-F]{64}$'
        ),

    message_hash text
        CHECK (
            message_hash IS NULL
            OR message_hash ~ '^[0-9A-F]{64}$'
        ),

    created_at timestamptz NOT NULL DEFAULT now(),

    FOREIGN KEY (thread_id, consultation_id)
        REFERENCES prelaunch_consultation_threads(id, consultation_id)
        ON DELETE CASCADE,

    FOREIGN KEY (author_party_id, consultation_id)
        REFERENCES prelaunch_consultation_parties(id, consultation_id)
        ON DELETE RESTRICT,

    FOREIGN KEY (representation_id, consultation_id)
        REFERENCES prelaunch_consultation_representations(id, consultation_id)
        ON DELETE RESTRICT,

    UNIQUE (thread_id, sequence_no),
    UNIQUE (id, thread_id),

    CHECK (
        (
            author_capacity = 'system'
            AND author_party_id IS NULL
            AND representation_id IS NULL
        )
        OR
        (
            author_capacity = 'authorized_representative'
            AND author_party_id IS NOT NULL
            AND representation_id IS NOT NULL
        )
        OR
        (
            author_capacity NOT IN ('system','authorized_representative')
            AND author_party_id IS NOT NULL
            AND representation_id IS NULL
        )
    )
);


ALTER TABLE prelaunch_consultation_messages
ADD CONSTRAINT prelaunch_messages_reply_fk
FOREIGN KEY (reply_to_message_id, thread_id)
REFERENCES prelaunch_consultation_messages(id, thread_id)
ON DELETE RESTRICT;


ALTER TABLE prelaunch_consultation_messages
ADD CONSTRAINT prelaunch_messages_supersedes_fk
FOREIGN KEY (supersedes_message_id, thread_id)
REFERENCES prelaunch_consultation_messages(id, thread_id)
ON DELETE RESTRICT;


CREATE INDEX prelaunch_messages_thread_order_idx
    ON prelaunch_consultation_messages(
        thread_id,
        sequence_no
    );


CREATE TABLE prelaunch_consultation_outcomes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid NOT NULL,
    thread_id uuid NOT NULL,
    author_party_id uuid NOT NULL,

    outcome_kind text NOT NULL
        CHECK (
            outcome_kind IN (
                'answer',
                'conclusion',
                'opinion',
                'recommendation'
            )
        ),

    revision_no integer NOT NULL CHECK (revision_no > 0),

    body text NOT NULL
        CHECK (length(btrim(body)) > 0),

    basis text,
    recommended_action text,
    caveats text,
    risk_level text,

    supersedes_outcome_id uuid,

    outcome_hash text
        CHECK (
            outcome_hash IS NULL
            OR outcome_hash ~ '^[0-9A-F]{64}$'
        ),

    created_at timestamptz NOT NULL DEFAULT now(),
    finalized_at timestamptz,

    FOREIGN KEY (thread_id, consultation_id)
        REFERENCES prelaunch_consultation_threads(id, consultation_id)
        ON DELETE CASCADE,

    FOREIGN KEY (author_party_id, consultation_id)
        REFERENCES prelaunch_consultation_parties(id, consultation_id)
        ON DELETE RESTRICT,

    UNIQUE (thread_id, outcome_kind, revision_no),
    UNIQUE (id, thread_id),

    CHECK (
        finalized_at IS NULL
        OR finalized_at >= created_at
    )
);


ALTER TABLE prelaunch_consultation_outcomes
ADD CONSTRAINT prelaunch_outcomes_supersedes_fk
FOREIGN KEY (supersedes_outcome_id, thread_id)
REFERENCES prelaunch_consultation_outcomes(id, thread_id)
ON DELETE RESTRICT;


CREATE TABLE prelaunch_consultation_proposals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid NOT NULL,
    version_id uuid NOT NULL,
    party_id uuid NOT NULL,

    proposal_series text NOT NULL DEFAULT 'principal',
    revision_no integer NOT NULL CHECK (revision_no > 0),

    title text NOT NULL,

    price_status text NOT NULL DEFAULT 'priced'
        CHECK (
            price_status IN (
                'priced',
                'pro_bono',
                'to_be_defined',
                'not_applicable'
            )
        ),

    currency text NOT NULL DEFAULT 'BRL'
        CHECK (currency ~ '^[A-Z]{3}$'),

    scope_included text,
    scope_excluded text,
    third_party_costs text,
    payment_terms text,
    service_period text,
    adjustment_terms text,
    cancellation_terms text,
    assumptions text,
    price_notes text,

    valid_until date,

    supersedes_proposal_id uuid,

    proposal_hash text
        CHECK (
            proposal_hash IS NULL
            OR proposal_hash ~ '^[0-9A-F]{64}$'
        ),

    submitted_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),

    FOREIGN KEY (version_id, consultation_id)
        REFERENCES prelaunch_consultation_versions(id, consultation_id)
        ON DELETE CASCADE,

    FOREIGN KEY (party_id, consultation_id)
        REFERENCES prelaunch_consultation_parties(id, consultation_id)
        ON DELETE RESTRICT,

    UNIQUE (
        consultation_id,
        version_id,
        party_id,
        proposal_series,
        revision_no
    ),

    UNIQUE (id, consultation_id)
);


ALTER TABLE prelaunch_consultation_proposals
ADD CONSTRAINT prelaunch_proposals_supersedes_fk
FOREIGN KEY (supersedes_proposal_id, consultation_id)
REFERENCES prelaunch_consultation_proposals(id, consultation_id)
ON DELETE RESTRICT;


COMMENT ON TABLE prelaunch_consultation_proposals IS
'Propostas comerciais versionadas. A existência de proposta não significa contratação.';


CREATE INDEX prelaunch_proposals_party_idx
    ON prelaunch_consultation_proposals(
        consultation_id,
        party_id,
        submitted_at
    );


CREATE TABLE prelaunch_consultation_price_components (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id uuid NOT NULL
        REFERENCES prelaunch_consultation_proposals(id)
        ON DELETE CASCADE,

    position integer NOT NULL CHECK (position > 0),
    description text NOT NULL,

    charge_type text NOT NULL
        CHECK (
            charge_type IN (
                'one_time',
                'monthly',
                'annual',
                'hourly',
                'per_unit',
                'per_transaction',
                'percentage',
                'fixed_plus_percentage',
                'variable',
                'custom'
            )
        ),

    amount numeric(18,2)
        CHECK (amount IS NULL OR amount >= 0),

    percentage numeric(9,4)
        CHECK (
            percentage IS NULL
            OR (
                percentage >= 0
                AND percentage <= 100
            )
        ),

    minimum_amount numeric(18,2)
        CHECK (
            minimum_amount IS NULL
            OR minimum_amount >= 0
        ),

    maximum_amount numeric(18,2)
        CHECK (
            maximum_amount IS NULL
            OR maximum_amount >= 0
        ),

    unit_label text,
    pricing_formula text,
    taxes_included boolean,

    required_charge boolean NOT NULL DEFAULT true,

    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE (proposal_id, position),

    CHECK (
        maximum_amount IS NULL
        OR minimum_amount IS NULL
        OR maximum_amount >= minimum_amount
    ),

    CHECK (
        (
            charge_type IN (
                'one_time',
                'monthly',
                'annual',
                'hourly',
                'per_unit',
                'per_transaction'
            )
            AND amount IS NOT NULL
        )
        OR
        (
            charge_type = 'percentage'
            AND percentage IS NOT NULL
        )
        OR
        (
            charge_type = 'fixed_plus_percentage'
            AND amount IS NOT NULL
            AND percentage IS NOT NULL
        )
        OR
        charge_type IN ('variable','custom')
    )
);


CREATE INDEX prelaunch_price_components_proposal_idx
    ON prelaunch_consultation_price_components(
        proposal_id,
        position
    );


CREATE TABLE prelaunch_consultation_engagements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid NOT NULL,
    proposal_id uuid NOT NULL,

    status text NOT NULL DEFAULT 'selected'
        CHECK (
            status IN (
                'selected',
                'contracted',
                'active',
                'completed',
                'cancelled'
            )
        ),

    contract_reference text,
    contracted_at timestamptz,
    starts_on date,
    ends_on date,
    notes text,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    FOREIGN KEY (proposal_id, consultation_id)
        REFERENCES prelaunch_consultation_proposals(id, consultation_id)
        ON DELETE RESTRICT,

    UNIQUE (proposal_id),

    CHECK (
        ends_on IS NULL
        OR starts_on IS NULL
        OR ends_on >= starts_on
    ),

    CHECK (
        status NOT IN ('contracted','active','completed')
        OR contracted_at IS NOT NULL
    )
);


COMMENT ON TABLE prelaunch_consultation_engagements IS
'Registro separado da contratação. Uma proposta recebida não é custo contratado por si só.';


CREATE TABLE prelaunch_consultation_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    consultation_id uuid NOT NULL
        REFERENCES prelaunch_consultations(id)
        ON DELETE CASCADE,

    version_id uuid,
    thread_id uuid,
    actor_party_id uuid,
    representation_id uuid,

    event_type text NOT NULL,
    event_data jsonb NOT NULL DEFAULT '{}'::jsonb,

    created_at timestamptz NOT NULL DEFAULT now(),

    FOREIGN KEY (version_id, consultation_id)
        REFERENCES prelaunch_consultation_versions(id, consultation_id)
        ON DELETE CASCADE,

    FOREIGN KEY (thread_id, consultation_id)
        REFERENCES prelaunch_consultation_threads(id, consultation_id)
        ON DELETE CASCADE,

    FOREIGN KEY (actor_party_id, consultation_id)
        REFERENCES prelaunch_consultation_parties(id, consultation_id)
        ON DELETE RESTRICT,

    FOREIGN KEY (representation_id, consultation_id)
        REFERENCES prelaunch_consultation_representations(id, consultation_id)
        ON DELETE RESTRICT
);


CREATE INDEX prelaunch_events_time_idx
    ON prelaunch_consultation_events(
        consultation_id,
        created_at
    );


-- =========================================================
-- updated_at
-- =========================================================

CREATE OR REPLACE FUNCTION set_prelaunch_consultation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


CREATE TRIGGER trg_prelaunch_consultation_updated_at
BEFORE UPDATE ON prelaunch_consultations
FOR EACH ROW
EXECUTE FUNCTION set_prelaunch_consultation_updated_at();


CREATE OR REPLACE FUNCTION set_prelaunch_engagement_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


CREATE TRIGGER trg_prelaunch_engagement_updated_at
BEFORE UPDATE ON prelaunch_consultation_engagements
FOR EACH ROW
EXECUTE FUNCTION set_prelaunch_engagement_updated_at();


-- =========================================================
-- Proteção de registros históricos
-- =========================================================

CREATE OR REPLACE FUNCTION protect_prelaunch_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION
        'Registro histórico append-only: UPDATE ou DELETE direto não permitido.';
    RETURN OLD;
END;
$$;


CREATE TRIGGER trg_prelaunch_messages_append_only
BEFORE UPDATE OR DELETE ON prelaunch_consultation_messages
FOR EACH ROW
EXECUTE FUNCTION protect_prelaunch_append_only();


CREATE TRIGGER trg_prelaunch_outcomes_append_only
BEFORE UPDATE OR DELETE ON prelaunch_consultation_outcomes
FOR EACH ROW
EXECUTE FUNCTION protect_prelaunch_append_only();


CREATE TRIGGER trg_prelaunch_proposals_append_only
BEFORE UPDATE OR DELETE ON prelaunch_consultation_proposals
FOR EACH ROW
EXECUTE FUNCTION protect_prelaunch_append_only();


CREATE TRIGGER trg_prelaunch_price_components_append_only
BEFORE UPDATE OR DELETE ON prelaunch_consultation_price_components
FOR EACH ROW
EXECUTE FUNCTION protect_prelaunch_append_only();


CREATE TRIGGER trg_prelaunch_events_append_only
BEFORE UPDATE OR DELETE ON prelaunch_consultation_events
FOR EACH ROW
EXECUTE FUNCTION protect_prelaunch_append_only();


-- =========================================================
-- Imutabilidade do documento-base de cada versão
-- =========================================================

CREATE OR REPLACE FUNCTION protect_prelaunch_version_content()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN

    IF
        NEW.consultation_id IS DISTINCT FROM OLD.consultation_id
        OR NEW.version_number IS DISTINCT FROM OLD.version_number
        OR NEW.source_hash IS DISTINCT FROM OLD.source_hash
        OR NEW.source_filename IS DISTINCT FROM OLD.source_filename
        OR NEW.source_document IS DISTINCT FROM OLD.source_document
    THEN

        RAISE EXCEPTION
            'O documento de uma versão é imutável. Crie uma nova versão.';

    END IF;

    RETURN NEW;
END;
$$;


CREATE TRIGGER trg_prelaunch_version_content_immutable
BEFORE UPDATE ON prelaunch_consultation_versions
FOR EACH ROW
EXECUTE FUNCTION protect_prelaunch_version_content();


COMMENT ON TABLE prelaunch_consultation_messages IS
'Histórico cronológico das conversas. Correções são registradas como novas mensagens.';

COMMENT ON TABLE prelaunch_consultation_events IS
'Trilha cronológica de auditoria dos atos relevantes da consulta.';


COMMIT;
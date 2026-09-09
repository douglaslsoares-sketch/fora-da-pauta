-- =========================================================
-- FORA DA PAUTA
-- Campanha de Interesses
-- Migration 001 — estrutura-base de auditoria
-- PostgreSQL
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS audit_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    channel TEXT NOT NULL CHECK (channel IN ('text', 'voice')),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
    model_version TEXT,
    search_logic_version TEXT,
    response_logic_version TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_sessions_created_at
    ON audit_sessions (created_at DESC);

CREATE TABLE IF NOT EXISTS user_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES audit_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    input_type TEXT NOT NULL CHECK (input_type IN ('text', 'voice')),
    transcript TEXT NOT NULL,
    audio_reference TEXT,
    transcription_confidence NUMERIC(5,4)
        CHECK (
            transcription_confidence IS NULL OR
            (transcription_confidence >= 0 AND transcription_confidence <= 1)
        )
);

CREATE INDEX IF NOT EXISTS idx_user_inputs_session_id
    ON user_inputs (session_id, created_at);

CREATE TABLE IF NOT EXISTS interpretations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES audit_sessions(id) ON DELETE CASCADE,
    user_input_id UUID NOT NULL REFERENCES user_inputs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    summary TEXT NOT NULL,
    needs_clarification BOOLEAN NOT NULL DEFAULT false,
    confirmed_by_user BOOLEAN,
    confirmed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_interpretations_session_id
    ON interpretations (session_id, created_at);

CREATE TABLE IF NOT EXISTS interpreted_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interpretation_id UUID NOT NULL REFERENCES interpretations(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    description TEXT,
    source_excerpt TEXT NOT NULL,
    confidence NUMERIC(5,4)
        CHECK (
            confidence IS NULL OR
            (confidence >= 0 AND confidence <= 1)
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interpreted_topics_interpretation
    ON interpreted_topics (interpretation_id);

CREATE TABLE IF NOT EXISTS interpretation_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interpretation_id UUID NOT NULL REFERENCES interpretations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    previous_value JSONB NOT NULL,
    new_value JSONB NOT NULL,
    reason TEXT,
    user_confirmed BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_interpretation_revisions_interpretation
    ON interpretation_revisions (interpretation_id, created_at);

CREATE TABLE IF NOT EXISTS research_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES audit_sessions(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES interpreted_topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    election_year INTEGER,
    election_scope TEXT,
    office TEXT,
    jurisdiction TEXT,
    candidate_universe_source TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_research_plans_session
    ON research_plans (session_id);

CREATE INDEX IF NOT EXISTS idx_research_plans_topic
    ON research_plans (topic_id);

CREATE TABLE IF NOT EXISTS research_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_plan_id UUID NOT NULL REFERENCES research_plans(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    purpose TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_research_questions_plan
    ON research_questions (research_plan_id);

CREATE TABLE IF NOT EXISTS research_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_plan_id UUID NOT NULL REFERENCES research_plans(id) ON DELETE CASCADE,
    candidate_id TEXT,
    candidate_name TEXT NOT NULL,
    official_candidate_reference TEXT,
    included BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_research_candidates_plan
    ON research_candidates (research_plan_id);

CREATE INDEX IF NOT EXISTS idx_research_candidates_candidate_id
    ON research_candidates (candidate_id);

CREATE TABLE IF NOT EXISTS search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_plan_id UUID NOT NULL REFERENCES research_plans(id) ON DELETE CASCADE,
    research_candidate_id UUID REFERENCES research_candidates(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    query_text TEXT NOT NULL,
    source_type TEXT,
    result_count INTEGER CHECK (result_count IS NULL OR result_count >= 0),
    execution_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (execution_status IN ('pending', 'success', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_search_queries_plan
    ON search_queries (research_plan_id, created_at);

CREATE INDEX IF NOT EXISTS idx_search_queries_candidate
    ON search_queries (research_candidate_id);

CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    publisher TEXT,
    title TEXT,
    source_type TEXT NOT NULL
        CHECK (
            source_type IN (
                'official_document',
                'court_record',
                'legislative_record',
                'official_database',
                'video',
                'interview',
                'news',
                'official_social_post',
                'other'
            )
        ),
    published_at TIMESTAMPTZ,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    verification_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            verification_status IN (
                'pending',
                'verified',
                'partially_verified',
                'not_verified',
                'unavailable'
            )
        ),
    archive_reference TEXT,
    UNIQUE (url)
);

CREATE INDEX IF NOT EXISTS idx_sources_type
    ON sources (source_type);

CREATE INDEX IF NOT EXISTS idx_sources_verification
    ON sources (verification_status);

CREATE TABLE IF NOT EXISTS evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES audit_sessions(id) ON DELETE CASCADE,
    research_plan_id UUID NOT NULL REFERENCES research_plans(id) ON DELETE CASCADE,
    research_candidate_id UUID REFERENCES research_candidates(id) ON DELETE SET NULL,
    topic_id UUID NOT NULL REFERENCES interpreted_topics(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
    event_date TIMESTAMPTZ,
    evidence_type TEXT NOT NULL
        CHECK (
            evidence_type IN (
                'public_statement',
                'vote',
                'bill',
                'government_program',
                'government_action',
                'official_post',
                'interview',
                'court_record',
                'investigation_record',
                'other'
            )
        ),
    factual_description TEXT NOT NULL,
    relevant_excerpt TEXT,
    context TEXT,
    precise_reference TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            verification_status IN (
                'pending',
                'verified',
                'partially_verified',
                'not_verified'
            )
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidences_session
    ON evidences (session_id);

CREATE INDEX IF NOT EXISTS idx_evidences_plan
    ON evidences (research_plan_id);

CREATE INDEX IF NOT EXISTS idx_evidences_candidate
    ON evidences (research_candidate_id);

CREATE INDEX IF NOT EXISTS idx_evidences_topic
    ON evidences (topic_id);

CREATE INDEX IF NOT EXISTS idx_evidences_source
    ON evidences (source_id);

CREATE INDEX IF NOT EXISTS idx_evidences_event_date
    ON evidences (event_date);

CREATE TABLE IF NOT EXISTS evidence_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_a_id UUID NOT NULL REFERENCES evidences(id) ON DELETE CASCADE,
    evidence_b_id UUID NOT NULL REFERENCES evidences(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL
        CHECK (
            relation_type IN (
                'same_event',
                'same_statement',
                'duplicate',
                'chronologically_related'
            )
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (evidence_a_id <> evidence_b_id)
);

CREATE INDEX IF NOT EXISTS idx_evidence_relations_a
    ON evidence_relations (evidence_a_id);

CREATE INDEX IF NOT EXISTS idx_evidence_relations_b
    ON evidence_relations (evidence_b_id);

CREATE TABLE IF NOT EXISTS discarded_evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES audit_sessions(id) ON DELETE CASCADE,
    research_plan_id UUID REFERENCES research_plans(id) ON DELETE SET NULL,
    research_candidate_id UUID REFERENCES research_candidates(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES interpreted_topics(id) ON DELETE SET NULL,
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    reason TEXT NOT NULL
        CHECK (
            reason IN (
                'duplicate',
                'source_not_verified',
                'original_source_missing',
                'not_relevant',
                'insufficient_context',
                'unsupported_claim',
                'wrong_candidate',
                'wrong_date',
                'other'
            )
        ),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discarded_evidences_session
    ON discarded_evidences (session_id);

CREATE INDEX IF NOT EXISTS idx_discarded_evidences_plan
    ON discarded_evidences (research_plan_id);

CREATE TABLE IF NOT EXISTS assistant_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES audit_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    response_text TEXT NOT NULL,
    response_version TEXT,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (
            status IN (
                'draft',
                'audit_pending',
                'approved',
                'rejected',
                'shown_to_user'
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_assistant_responses_session
    ON assistant_responses (session_id, created_at);

CREATE TABLE IF NOT EXISTS response_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES assistant_responses(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    claim_type TEXT NOT NULL
        CHECK (
            claim_type IN (
                'factual',
                'procedural',
                'uncertainty',
                'navigation'
            )
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_response_claims_response
    ON response_claims (response_id);

CREATE TABLE IF NOT EXISTS claim_evidences (
    claim_id UUID NOT NULL REFERENCES response_claims(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES evidences(id) ON DELETE RESTRICT,
    PRIMARY KEY (claim_id, evidence_id)
);

CREATE INDEX IF NOT EXISTS idx_claim_evidences_evidence
    ON claim_evidences (evidence_id);

CREATE TABLE IF NOT EXISTS automatic_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES assistant_responses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    topic_fidelity_pass BOOLEAN,
    all_factual_claims_sourced BOOLEAN,
    sources_support_claims BOOLEAN,
    divergent_evidence_search_done BOOLEAN,
    unsupported_inference_detected BOOLEAN,
    editorial_conclusion_detected BOOLEAN,
    candidate_coverage_complete BOOLEAN,
    overall_status TEXT NOT NULL
        CHECK (overall_status IN ('pass', 'fail', 'needs_review'))
);

CREATE INDEX IF NOT EXISTS idx_automatic_audits_response
    ON automatic_audits (response_id);

CREATE TABLE IF NOT EXISTS audit_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES automatic_audits(id) ON DELETE CASCADE,
    issue_type TEXT NOT NULL,
    severity TEXT NOT NULL
        CHECK (severity IN ('info', 'warning', 'critical')),
    description TEXT NOT NULL,
    related_claim_id UUID REFERENCES response_claims(id) ON DELETE SET NULL,
    related_evidence_id UUID REFERENCES evidences(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_issues_audit
    ON audit_issues (audit_id);

CREATE TABLE IF NOT EXISTS human_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES audit_sessions(id) ON DELETE CASCADE,
    auditor_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_intent_understood BOOLEAN,
    topic_coverage BOOLEAN,
    source_quality BOOLEAN,
    context_preserved BOOLEAN,
    important_omission BOOLEAN,
    neutral_presentation BOOLEAN,
    overall_result TEXT
        CHECK (
            overall_result IN (
                'approved',
                'needs_improvement',
                'rejected'
            )
        ),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_human_audits_session
    ON human_audits (session_id);

CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES audit_sessions(id) ON DELETE CASCADE,
    response_id UUID REFERENCES assistant_responses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    feedback_type TEXT NOT NULL
        CHECK (
            feedback_type IN (
                'misunderstood',
                'incomplete',
                'useful',
                'source_problem',
                'other'
            )
        ),
    comment TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_session
    ON user_feedback (session_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_sessions_updated_at ON audit_sessions;

CREATE TRIGGER trg_audit_sessions_updated_at
BEFORE UPDATE ON audit_sessions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Regra técnica: sem evidência vinculada, a resposta não pode
-- ser aprovada nem marcada como mostrada ao usuário.
CREATE OR REPLACE FUNCTION validate_response_before_publish()
RETURNS TRIGGER AS $$
DECLARE
    unsupported_count INTEGER;
BEGIN
    IF NEW.status IN ('approved', 'shown_to_user') THEN

        SELECT COUNT(*)
        INTO unsupported_count
        FROM response_claims rc
        WHERE rc.response_id = NEW.id
          AND rc.claim_type = 'factual'
          AND NOT EXISTS (
              SELECT 1
              FROM claim_evidences ce
              WHERE ce.claim_id = rc.id
          );

        IF unsupported_count > 0 THEN
            RAISE EXCEPTION
                'Resposta contém % afirmação(ões) factual(is) sem evidência vinculada.',
                unsupported_count;
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_response_before_publish
    ON assistant_responses;

CREATE TRIGGER trg_validate_response_before_publish
BEFORE UPDATE OF status ON assistant_responses
FOR EACH ROW
EXECUTE FUNCTION validate_response_before_publish();

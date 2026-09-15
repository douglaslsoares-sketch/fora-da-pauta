BEGIN;

CREATE TABLE public_questions (

    id uuid PRIMARY KEY
        DEFAULT gen_random_uuid(),

    tracking_token_hash text NOT NULL
        UNIQUE,

    input_type text NOT NULL,

    raw_transcript text,

    confirmed_text text NOT NULL,

    status text NOT NULL
        DEFAULT 'pending',

    response_text text,

    is_public boolean NOT NULL
        DEFAULT false,

    response_published_at timestamptz,

    created_at timestamptz NOT NULL
        DEFAULT now(),

    updated_at timestamptz NOT NULL
        DEFAULT now(),

    CONSTRAINT public_questions_input_type_check
        CHECK (
            input_type IN (
                'voice',
                'text'
            )
        ),

    CONSTRAINT public_questions_status_check
        CHECK (
            status IN (
                'pending',
                'answered',
                'hidden'
            )
        ),

    CONSTRAINT public_questions_confirmed_text_check
        CHECK (
            length(trim(confirmed_text))
            BETWEEN 1 AND 2000
        ),

    CONSTRAINT public_questions_raw_transcript_check
        CHECK (
            raw_transcript IS NULL
            OR length(raw_transcript) <= 5000
        ),

    CONSTRAINT public_questions_response_check
        CHECK (
            response_text IS NULL
            OR length(trim(response_text))
                BETWEEN 1 AND 10000
        ),

    CONSTRAINT public_questions_public_answer_check
        CHECK (
            NOT is_public
            OR (
                status = 'answered'
                AND response_text IS NOT NULL
                AND response_published_at IS NOT NULL
            )
        )
);


CREATE INDEX public_questions_created_idx
    ON public_questions (
        created_at DESC
    );


CREATE INDEX public_questions_public_idx
    ON public_questions (
        response_published_at DESC
    )
    WHERE
        is_public IS TRUE
        AND status = 'answered';


CREATE TABLE public_question_events (

    id uuid PRIMARY KEY
        DEFAULT gen_random_uuid(),

    question_id uuid NOT NULL
        REFERENCES public_questions(id)
        ON DELETE CASCADE,

    event_type text NOT NULL,

    event_data jsonb NOT NULL
        DEFAULT '{}'::jsonb,

    created_at timestamptz NOT NULL
        DEFAULT now()
);


CREATE INDEX public_question_events_question_idx
    ON public_question_events (
        question_id,
        created_at
    );


CREATE OR REPLACE FUNCTION
set_public_question_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


CREATE TRIGGER
trg_public_question_updated_at
BEFORE UPDATE ON public_questions
FOR EACH ROW
EXECUTE FUNCTION
set_public_question_updated_at();


CREATE OR REPLACE FUNCTION
protect_public_question_submission()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN

    IF
        NEW.tracking_token_hash
            IS DISTINCT FROM OLD.tracking_token_hash
        OR NEW.input_type
            IS DISTINCT FROM OLD.input_type
        OR NEW.raw_transcript
            IS DISTINCT FROM OLD.raw_transcript
        OR NEW.confirmed_text
            IS DISTINCT FROM OLD.confirmed_text
        OR NEW.created_at
            IS DISTINCT FROM OLD.created_at
    THEN
        RAISE EXCEPTION
            'O conteúdo confirmado da pergunta é imutável após o envio.';
    END IF;

    RETURN NEW;
END;
$$;


CREATE TRIGGER
trg_public_question_submission_immutable
BEFORE UPDATE ON public_questions
FOR EACH ROW
EXECUTE FUNCTION
protect_public_question_submission();


CREATE OR REPLACE FUNCTION
protect_public_question_event_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION
        'O histórico de eventos das perguntas é append-only.';
    RETURN OLD;
END;
$$;


CREATE TRIGGER
trg_public_question_events_append_only
BEFORE UPDATE OR DELETE
ON public_question_events
FOR EACH ROW
EXECUTE FUNCTION
protect_public_question_event_append_only();


COMMENT ON TABLE public_questions IS
'Perguntas públicas enviadas ao Fora da Pauta. A gravação de voz não é armazenada nesta tabela.';


COMMENT ON COLUMN public_questions.raw_transcript IS
'Transcrição produzida antes da conferência da pessoa. Pode ser nula quando a entrada começou em texto.';


COMMENT ON COLUMN public_questions.confirmed_text IS
'Texto final conferido e enviado pela própria pessoa. Imutável após o envio.';


COMMENT ON COLUMN public_questions.tracking_token_hash IS
'Hash SHA-256 do token aleatório entregue à pessoa para acompanhar sua pergunta. O token original não é armazenado.';


COMMENT ON TABLE public_question_events IS
'Trilha cronológica append-only dos atos relacionados às perguntas públicas.';


COMMIT;
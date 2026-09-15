BEGIN;

DROP TRIGGER IF EXISTS
trg_public_question_events_append_only
ON public_question_events;

DROP FUNCTION IF EXISTS
protect_public_question_event_append_only();


DROP TRIGGER IF EXISTS
trg_public_question_submission_immutable
ON public_questions;

DROP FUNCTION IF EXISTS
protect_public_question_submission();


DROP TRIGGER IF EXISTS
trg_public_question_updated_at
ON public_questions;

DROP FUNCTION IF EXISTS
set_public_question_updated_at();


DROP TABLE IF EXISTS
public_question_events;

DROP TABLE IF EXISTS
public_questions;


COMMIT;
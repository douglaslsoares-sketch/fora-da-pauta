BEGIN;

ALTER TABLE interpretations
  ADD COLUMN IF NOT EXISTS clarification_question text;

ALTER TABLE interpreted_topics
  ADD COLUMN IF NOT EXISTS source_user_input_id uuid
  REFERENCES user_inputs(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS
  interpreted_topics_source_user_input_id_idx
  ON interpreted_topics(source_user_input_id);

COMMIT;

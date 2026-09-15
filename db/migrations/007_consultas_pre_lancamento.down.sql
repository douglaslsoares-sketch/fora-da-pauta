BEGIN;

DROP TABLE IF EXISTS prelaunch_consultation_events;
DROP TABLE IF EXISTS prelaunch_consultation_engagements;
DROP TABLE IF EXISTS prelaunch_consultation_price_components;
DROP TABLE IF EXISTS prelaunch_consultation_proposals;
DROP TABLE IF EXISTS prelaunch_consultation_outcomes;
DROP TABLE IF EXISTS prelaunch_consultation_messages;
DROP TABLE IF EXISTS prelaunch_consultation_threads;
DROP TABLE IF EXISTS prelaunch_consultation_access_grants;
DROP TABLE IF EXISTS prelaunch_consultation_representations;
DROP TABLE IF EXISTS prelaunch_consultation_parties;
DROP TABLE IF EXISTS prelaunch_consultation_questions;
DROP TABLE IF EXISTS prelaunch_consultation_versions;
DROP TABLE IF EXISTS prelaunch_consultations;

DROP FUNCTION IF EXISTS protect_prelaunch_version_content();
DROP FUNCTION IF EXISTS protect_prelaunch_append_only();
DROP FUNCTION IF EXISTS set_prelaunch_engagement_updated_at();
DROP FUNCTION IF EXISTS set_prelaunch_consultation_updated_at();

COMMIT;
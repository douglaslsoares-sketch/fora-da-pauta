BEGIN;

CREATE TABLE rate_limit_buckets (

    scope text NOT NULL,

    subject_hash text NOT NULL,

    window_start timestamptz NOT NULL,

    window_seconds integer NOT NULL,

    hit_count integer NOT NULL
        DEFAULT 1,

    expires_at timestamptz NOT NULL,

    CONSTRAINT rate_limit_buckets_scope_check
        CHECK (
            length(trim(scope))
            BETWEEN 1 AND 80
        ),

    CONSTRAINT rate_limit_buckets_subject_hash_check
        CHECK (
            subject_hash ~ '^[0-9a-f]{64}$'
        ),

    CONSTRAINT rate_limit_buckets_window_seconds_check
        CHECK (
            window_seconds
            BETWEEN 60 AND 604800
        ),

    CONSTRAINT rate_limit_buckets_hit_count_check
        CHECK (
            hit_count
            BETWEEN 1 AND 1000000
        ),

    CONSTRAINT rate_limit_buckets_expiry_check
        CHECK (
            expires_at > window_start
        ),

    PRIMARY KEY (
        scope,
        subject_hash,
        window_start,
        window_seconds
    )
);


CREATE INDEX rate_limit_buckets_expires_idx
    ON rate_limit_buckets (
        expires_at
    );


COMMENT ON TABLE rate_limit_buckets IS
'Temporary counters used to reduce abusive request volume.';


COMMENT ON COLUMN rate_limit_buckets.subject_hash IS
'HMAC-SHA256 identifier derived by the application. Raw IP addresses are not stored.';


COMMENT ON COLUMN rate_limit_buckets.scope IS
'Application-defined rate-limit scope, such as audio transcription, question submission, or failed admin login.';


COMMENT ON COLUMN rate_limit_buckets.expires_at IS
'Retention boundary. Expired buckets may be deleted opportunistically by the application.';


COMMIT;
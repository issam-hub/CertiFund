DO $$ BEGIN
    CREATE TYPE review_status AS ENUM ('Approved', 'Rejected', 'Flagged');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS project_review (
    review_id bigserial PRIMARY KEY,
    status review_status NOT NULL,
    feedback text NOT NULL,
    reviewed_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    reviewer_id bigint NOT NULL REFERENCES user_t ON DELETE CASCADE,
    project_id bigint NOT NULL REFERENCES project ON DELETE CASCADE
);

ALTER TABLE project ADD COLUMN IF NOT EXISTS is_suspicious bool NOT NULL DEFAULT FALSE;
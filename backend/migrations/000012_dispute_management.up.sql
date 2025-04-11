DO $$ BEGIN
    CREATE TYPE dispute_status AS ENUM ('pending', 'under review', 'resolved', 'rejected', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE dispute_context AS ENUM ('project', 'user', 'comment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS dispute (
    dispute_id bigserial PRIMARY KEY,
    status dispute_status NOT NULL DEFAULT 'pending',
    type text not null,
    description text not null,
    context dispute_context not null,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    resolved_at timestamp(0) with time zone NOT NULL DEFAULT '1970-01-01T00:00:00+01:00',
    reporter_id bigint NOT NULL REFERENCES User_t ON DELETE CASCADE,
    project_id BIGINT REFERENCES project ON DELETE CASCADE,
    user_id BIGINT REFERENCES user_t ON DELETE CASCADE,
    comment_id BIGINT REFERENCES project_comment ON DELETE CASCADE,
    CHECK (
    (project_id IS NOT NULL)::INTEGER +
    (user_id IS NOT NULL)::INTEGER +
    (comment_id IS NOT NULL)::INTEGER = 1
    ),
    version integer NOT NULL DEFAULT 1,
    evidences text[] DEFAULT '{}'::text[]
);

CREATE TABLE IF NOT EXISTS resolution (
    resolution_id bigserial PRIMARY KEY,
    dispute_id bigint NOT NULL REFERENCES dispute ON DELETE CASCADE,
    note text NOT NULL,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);
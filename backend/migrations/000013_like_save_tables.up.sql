CREATE TABLE IF NOT EXISTS favourite (
    user_id bigint NOT NULL REFERENCES user_t ON DELETE CASCADE,
    project_id bigint NOT NULL REFERENCES project ON DELETE CASCADE,
    PRIMARY KEY(user_id, project_id),
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS save (
    user_id bigint NOT NULL REFERENCES user_t ON DELETE CASCADE,
    project_id bigint NOT NULL REFERENCES project ON DELETE CASCADE,
    PRIMARY KEY(user_id, project_id),
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);
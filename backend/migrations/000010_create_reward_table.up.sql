CREATE TABLE IF NOT EXISTS reward (
    reward_id bigserial PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    amount DECIMAL NOT NULL,
    image_url text,
    includes text[] NOT NULL,
    estimated_delivery timestamp(0) with time zone NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    project_id bigint NOT NULL REFERENCES project ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS backing_reward (
    backing_id bigint NOT NULL REFERENCES backing ON DELETE CASCADE,
    reward_id bigint NOT NULL REFERENCES reward ON DELETE CASCADE,
    PRIMARY KEY (backing_id, reward_id)
);
CREATE TABLE IF NOT EXISTS backing (
    backing_id bigserial PRIMARY KEY,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    backer_id bigint NOT NULL REFERENCES user_t ON DELETE CASCADE,
    project_id bigint NOT NULL REFERENCES project ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment (
    payment_id bigserial PRIMARY KEY,
    amount DECIMAL NOT NULL,
    status varchar(20) NOT NULL,
    transaction_id text NOT NULL,
    payment_method text NOT NULL,
    backing_id bigint NOT NULL UNIQUE REFERENCES backing ON DELETE CASCADE,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS cancellation (
    cancellation_id bigserial PRIMARY KEY,
    reason text,
    date timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    backing_id bigint NOT NULL REFERENCES backing ON DELETE CASCADE,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_payment_modtime
BEFORE UPDATE ON payment
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
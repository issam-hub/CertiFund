CREATE TABLE IF NOT EXISTS user_t (
    user_id bigserial PRIMARY KEY,
    username text NOT NULL,
    email citext UNIQUE NOT NULL,
    password_hash bytea NOT NULL,
    activated bool NOT NULL,
    image_url text,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    version integer NOT NULL DEFAULT 1
); 

CREATE TRIGGER update_user_modtime
BEFORE UPDATE ON user_t
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
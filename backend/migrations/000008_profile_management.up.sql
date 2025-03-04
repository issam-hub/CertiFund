CREATE INDEX IF NOT EXISTS creator_idx ON project (creator_id);
ALTER TABLE user_t ADD COLUMN bio text;
ALTER TABLE user_t ADD COLUMN website text;
ALTER TABLE user_t ADD COLUMN twitter text;
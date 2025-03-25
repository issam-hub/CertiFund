CREATE TABLE IF NOT EXISTS project_update (
    update_id bigserial PRIMARY KEY,
    project_id bigint NOT NULL REFERENCES project ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    created_at timestamp(0) with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_comment (
    comment_id bigserial PRIMARY KEY,
    project_id bigint NOT NULL REFERENCES project ON DELETE CASCADE,
    user_id bigint NOT NULL REFERENCES user_t ON DELETE CASCADE,
    content text NOT NULL,
    parent_comment_id bigint REFERENCES project_comment(comment_id),
    created_at timestamp(0) with time zone NOT NULL DEFAULT now(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_comment_user_id ON project_comment(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_project_id ON project_comment(project_id);



CREATE TRIGGER update_comment_modtime
BEFORE UPDATE ON project_comment
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
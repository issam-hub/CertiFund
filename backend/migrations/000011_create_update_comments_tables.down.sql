DROP FUNCTION IF EXISTS update_modified_column CASCADE;
DROP TABLE IF EXISTS project_update;
DROP TABLE IF EXISTS project_comment;
DROP INDEX IF EXISTS idx_comment_user_id;
DROP INDEX IF EXISTS idx_comment_project_id;

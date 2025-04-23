DROP TABLE IF EXISTS project_review;
ALTER TABLE project DROP COLUMN IF EXISTS is_suspicious;
DROP TYPE IF EXISTS review_status;
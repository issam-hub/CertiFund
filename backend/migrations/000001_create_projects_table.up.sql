DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('Draft', 'Pending Review', 'Approved', 'Rejected', 'Live', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS project (
    project_id bigserial PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL, 
    funding_goal DECIMAL NOT NULL,
    current_funding DECIMAL NOT NULL DEFAULT 0.0,
    deadline timestamp(0) with time zone NOT NULL,
    status project_status NOT NULL DEFAULT 'Draft',
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    launched_at timestamp(0) with time zone NOT NULL DEFAULT '1970-01-01T00:00:00+01:00',
    version integer NOT NULL DEFAULT 1
);

CREATE TRIGGER update_project_modtime
BEFORE UPDATE ON project
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
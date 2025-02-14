DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('Draft', 'Pending Review', 'Approved', 'Rejected', 'Live', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
CREATE TABLE IF NOT EXISTS project (
    project_id bigserial PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL, 
    funding_goal DECIMAL NOT NULL,
    current_funding DECIMAL NOT NULL DEFAULT 0.0,
    deadline timestamp(0) with time zone NOT NULL,
    status project_status NOT NULL DEFAULT 'Pending Review',
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    version integer NOT NULL DEFAULT 1
);
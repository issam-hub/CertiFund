DO $$ BEGIN
    CREATE TYPE expert_review_decision AS ENUM ('highly not recommended', 'not recommended', 'neutral', 'recommended', 'highly recommended', 'unverified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS expert (
    expert_id bigserial PRIMARY KEY,
    expertise_fields text[] NOT NULL,
    qualification text NOT NULL,
    expertise_level NUMERIC(2, 1) NOT NULL,
    is_active BOOL NOT NULL DEFAULT TRUE,
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    user_id bigint NOT NULL REFERENCES user_t ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expert_review (
    expert_review_id bigserial PRIMARY KEY,
    vote jsonb NOT NULL,
    comment text NOT NULL,
    reviewed_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    project_id bigint NOT NULL REFERENCES project ON DELETE CASCADE,
    expert_id bigint NOT NULL REFERENCES expert ON DELETE CASCADE
);

ALTER TABLE project ADD COLUMN IF NOT EXISTS experts_decision expert_review_decision DEFAULT 'unverified';
ALTER TABLE project ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

CREATE OR REPLACE FUNCTION calculate_expert_decision(project_id_param BIGINT)
RETURNS expert_review_decision AS $$
DECLARE
    result expert_review_decision;
BEGIN
    WITH weighted_votes AS (
        SELECT
            SUM(e.expertise_level * (er.vote->>'highly_not_recommended')::float) AS weighted_highly_not_recommended,
            SUM(e.expertise_level * (er.vote->>'not_recommended')::float) AS weighted_not_recommended,
            SUM(e.expertise_level * (er.vote->>'recommended')::float) AS weighted_recommended,
            SUM(e.expertise_level * (er.vote->>'highly_recommended')::float) AS weighted_highly_recommended
        FROM expert_review er
        JOIN expert e ON er.expert_id = e.expert_id
        WHERE er.project_id = project_id_param
    )
    SELECT
        CASE 
            WHEN weighted_highly_recommended = weighted_highly_not_recommended AND 
                weighted_highly_recommended = weighted_not_recommended AND 
                weighted_highly_recommended = weighted_recommended 
            THEN 'neutral'

            WHEN weighted_highly_recommended >= weighted_highly_not_recommended AND 
                weighted_highly_recommended >= weighted_not_recommended AND 
                weighted_highly_recommended >= weighted_recommended 
            THEN 'highly recommended'

            WHEN weighted_recommended >= weighted_highly_not_recommended AND 
                weighted_recommended >= weighted_not_recommended AND 
                weighted_recommended >= weighted_highly_recommended 
            THEN 'recommended'

            WHEN weighted_not_recommended >= weighted_highly_not_recommended AND 
                weighted_not_recommended >= weighted_recommended AND 
                weighted_not_recommended >= weighted_highly_recommended 
            THEN 'not recommended'

            WHEN weighted_highly_not_recommended >= weighted_not_recommended AND 
                weighted_highly_not_recommended >= weighted_recommended AND 
                weighted_highly_not_recommended >= weighted_highly_recommended 
            THEN 'highly not recommended'
            
            ELSE 'neutral'
        END
    INTO result
    FROM weighted_votes;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_project_approved_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Approved' AND (OLD.status IS NULL OR OLD.status != 'Approved') THEN
        NEW.approved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_project_approval
BEFORE UPDATE OF status ON project
FOR EACH ROW
EXECUTE FUNCTION set_project_approved_timestamp();

CREATE OR REPLACE FUNCTION update_experts_decisions()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    -- Find projects approved exactly 3 days ago and update their experts_decision
    UPDATE project
    SET experts_decision = calculate_expert_decision(project_id)
    WHERE status = 'Approved'
      AND experts_decision = 'unverified'
      AND approved_at IS NOT NULL
      AND approved_at <= NOW() - INTERVAL '10 minutes' -- for developement only
      AND approved_at > NOW() - INTERVAL '15 minutes'; -- for developement only
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;
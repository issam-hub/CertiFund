package data

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"projectx/internal/validator"
	"time"

	"github.com/lib/pq"
)

type Dispute struct {
	ID                 int            `json:"dispute_id"`
	Status             string         `json:"status"`
	Type               string         `json:"type"`
	Description        string         `json:"description"`
	Context            string         `json:"context"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	Version            int            `json:"version"`
	ResolvedAt         time.Time      `json:"resolved_at"`
	ReporterID         int            `json:"reporter_id"`
	ReportedResourceID int            `json:"reported_resource_id"`
	Evidences          pq.StringArray `json:"evidences,omitempty"`
}

func ValidateDispute(v *validator.Validator, dispute *Dispute) {
	v.Check(dispute.Status != "", "status", "Status must be provided")
	v.Check(dispute.Type != "", "type", "Type must be provided")
	v.Check(dispute.Description != "", "description", "Description must be provided")
	v.Check(validator.InBetween(dispute.Description, 10, 500), "description", "Description must be between 10 and 500 characters")
	v.Check(dispute.Context != "", "context", "Context must be provided")
	v.Check(validator.In(dispute.Context, "project", "user", "comment"), "context", "Context must be either project, user, or comment")
	v.Check(dispute.ReporterID != 0, "reporter_id", "Reporter ID must be provided")
	v.Check(dispute.ReportedResourceID != 0, "reported_resource_id", "Reported Resource ID must be provided")
}

type DisputeModel struct {
	DB *sql.DB
}

func (m DisputeModel) Insert(dispute Dispute) error {
	var resourceID string
	switch dispute.Context {
	case "project":
		resourceID = "project_id"
	case "user":
		resourceID = "user_id"
	case "comment":
		resourceID = "comment_id"
	}

	fmt.Println(fmt.Sprintf(`INSERT INTO dispute (status, type, description, context, reporter_id, %s, evidences)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
	RETURNING dispute_id, created_at, updated_at`, resourceID))

	query := fmt.Sprintf(`INSERT INTO dispute (status, type, description, context, reporter_id, %s, evidences)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
	RETURNING dispute_id, created_at, updated_at`, resourceID)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{
		dispute.Status,
		dispute.Type,
		dispute.Description,
		dispute.Context,
		dispute.ReporterID,
		dispute.ReportedResourceID,
		dispute.Evidences,
	}

	return m.DB.QueryRowContext(ctx, query, args...).Scan(
		&dispute.ID,
		&dispute.CreatedAt,
		&dispute.UpdatedAt,
	)
}

func (m DisputeModel) Delete(disputeID int) error {
	if disputeID < 1 {
		return ErrNoRecordFound
	}
	query := `DELETE FROM dispute WHERE dispute_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := m.DB.ExecContext(ctx, query, disputeID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (m DisputeModel) Update(dispute *Dispute, note string) error {
	disputeQuery := `UPDATE dispute SET status = $1, resolved_at = $2, version = version + 1 WHERE dispute_id = $3 AND version = $4 RETURNING updated_at, version`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	args := []interface{}{
		dispute.Status,
		time.Now(),
		dispute.ID,
		dispute.Version,
	}

	err = tx.QueryRowContext(ctx, disputeQuery, args...).Scan(
		&dispute.UpdatedAt,
		&dispute.Version,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return ErrEditConflict
		default:
			return err
		}
	}

	resolutionQuery := `INSERT INTO resolution (dispute_id, note) VALUES ($1, $2)`
	args2 := []interface{}{
		dispute.ID,
		note,
	}
	_, err = tx.ExecContext(ctx, resolutionQuery, args2...)
	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (m DisputeModel) Get(disputeID int) (*Dispute, error) {
	if disputeID < 1 {
		return nil, ErrNoRecordFound
	}

	query := `SELECT 
	dispute_id, 
	status, 
	type, 
	description, 
	context, 
	created_at, 
	updated_at, 
	resolved_at, 
	reporter_id, 
	CASE 
        WHEN project_id IS NOT NULL THEN project_id
        WHEN user_id IS NOT NULL THEN user_id
        WHEN comment_id IS NOT NULL THEN comment_id
    END AS reported_resource_id, 
	evidences,
	version
	FROM dispute WHERE dispute_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	dispute := &Dispute{}
	err := m.DB.QueryRowContext(ctx, query, disputeID).Scan(
		&dispute.ID,
		&dispute.Status,
		&dispute.Type,
		&dispute.Description,
		&dispute.Context,
		&dispute.CreatedAt,
		&dispute.UpdatedAt,
		&dispute.ResolvedAt,
		&dispute.ReporterID,
		&dispute.ReportedResourceID,
		&dispute.Evidences,
		&dispute.Version,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	return dispute, nil
}

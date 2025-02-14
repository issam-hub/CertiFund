package data

import (
	"context"
	"database/sql"
	"errors"
	"projectx/internal/validator"
	"strings"
	"time"
)

type Project struct {
	ID             int       `json:"project_id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	FundingGoal    float64   `json:"funding_goal"`
	CurrentFunding float64   `json:"current_funding"`
	Deadline       time.Time `json:"deadline"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"-"`
	Version        int32     `json:"version"`
}

type ProjectModel struct {
	DB *sql.DB
}

func ValidateProject(v *validator.Validator, project *Project) {
	v.Check(project.Title != "", "title", "Title must be provided")
	v.Check(len(project.Title) <= 100, "title", "Title should be less than or equal to 100 character")

	v.Check(project.Description != "", "description", "Description must be provided")
	v.Check(len(strings.Split(project.Description, " ")) <= 2000, "description", "Description should be less than or equal to 2000 word")

	v.Check(project.FundingGoal != 0, "funding goal", "Funding goal must be provided")
	v.Check(project.FundingGoal > 0, "funding goal", "Funding goal must be positive")

	v.Check(project.Deadline.GoString() != "", "deadline", "Deadline must be provided")
	v.Check(project.Deadline.After(time.Now()), "deadline", "Deadline should be after the date of today")

}

func (m ProjectModel) GetAll() ([]*Project, error) {
	return nil, nil
}

func (m ProjectModel) Insert(project *Project) error {
	query := `
	INSERT INTO project 
	(title, description, funding_goal, deadline)
	VALUES ($1, $2, $3, $4)
	RETURNING project_id, status, created_at, version
	`
	args := []interface{}{
		project.Title,
		project.Description,
		project.FundingGoal,
		project.Deadline,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return m.DB.QueryRowContext(ctx, query, args...).Scan(&project.ID, &project.Status, &project.CreatedAt, &project.Version)
}

func (m ProjectModel) Get(id int) (*Project, error) {
	if id < 1 {
		return nil, ErrNoRecordFound
	}
	var project Project
	query := `SELECT project_id, title, description, funding_goal, current_funding, deadline, status, created_at, version FROM project WHERE project_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, id).Scan(
		&project.ID,
		&project.Title,
		&project.Description,
		&project.FundingGoal,
		&project.CurrentFunding,
		&project.Deadline,
		&project.Status,
		&project.CreatedAt,
		&project.Version,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}
	return &project, nil
}

func (m ProjectModel) Update(project *Project) error {
	query := `
		UPDATE project SET 
		title = $1, description = $2, funding_goal = $3, deadline = $4, version = version + 1
		WHERE project_id = $5 AND version = $6 RETURNING version
	`

	args := []interface{}{
		project.Title,
		project.Description,
		project.FundingGoal,
		project.Deadline,
		project.ID,
		project.Version,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&project.Version)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return ErrEditConflict
		default:
			return err
		}
	}
	return nil
}

func (m ProjectModel) Delete(id int) error {
	if id < 1 {
		return ErrNoRecordFound
	}

	query := `DELETE FROM project WHERE project_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := m.DB.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrNoRecordFound
	}

	return nil
}

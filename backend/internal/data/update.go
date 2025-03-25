package data

import (
	"context"
	"database/sql"
	"errors"
	"projectx/internal/validator"
	"time"
)

type Update struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	ProjectID int    `json:"project_id"`
	CreatedAt string `json:"created_at"`
}

func ValidateUpdate(v *validator.Validator, update *Update) {
	titleLen := len(update.Title)
	// contentLen := len(update.Content)
	v.Check(update.Title != "", "title", "Title must be provided")
	v.Check(titleLen >= 5 && titleLen <= 100, "title", "Title must be between 5 characters to 100 characters long")

	// v.Check(update.Content != "", "content", "Content must be provided")
	// v.Check(contentLen >= 20 && contentLen <= 1000, "content", "Content must be between 20 characters to 1000 characters long")
}

type UpdateModel struct {
	DB *sql.DB
}

func (m UpdateModel) Insert(update *Update) error {
	query := `
	INSERT INTO project_update 
	(title, content, project_id)
	VALUES ($1, $2, $3)
	RETURNING update_id, created_at
	`
	args := []interface{}{
		update.Title,
		update.Content,
		update.ProjectID,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return m.DB.QueryRowContext(ctx, query, args...).Scan(&update.ID, &update.CreatedAt)
}

func (m UpdateModel) Delete(id int) error {
	query := `DELETE FROM project_update WHERE update_id = $1`

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

func (m UpdateModel) GetAllByProjectID(projectID int, filters Filter) ([]*Update, MetaData, error) {
	offset := (filters.Page - 1) * filters.PageSize

	query := `
	SELECT COUNT(*) OVER(), update_id, title, content, created_at
	FROM project_update
	WHERE project_id = $1
	ORDER BY created_at DESC
	LIMIT $2 OFFSET $3
	`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, projectID, filters.PageSize, offset)
	if err != nil {
		return nil, MetaData{}, err
	}
	defer rows.Close()

	updates := []*Update{}
	totalRecords := 0
	for rows.Next() {
		update := &Update{}
		err := rows.Scan(
			&totalRecords,
			&update.ID,
			&update.Title,
			&update.Content,
			&update.CreatedAt,
		)
		if err != nil {
			return nil, MetaData{}, err
		}
		updates = append(updates, update)
	}

	if err = rows.Err(); err != nil {
		return nil, MetaData{}, err
	}
	metaData := calculateMetadata(totalRecords, filters.Page, filters.PageSize)

	return updates, metaData, nil
}

func (m UpdateModel) Get(id int) (*Update, error) {
	if id < 1 {
		return nil, ErrNoRecordFound
	}

	query := `SELECT update_id, title, content, created_at, project_id
	FROM project_update
	WHERE update_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var update Update

	err := m.DB.QueryRowContext(ctx, query, id).Scan(
		&update.ID,
		&update.Title,
		&update.Content,
		&update.CreatedAt,
		&update.ProjectID,
	)

	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	return &update, nil
}

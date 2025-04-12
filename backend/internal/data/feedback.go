package data

import (
	"context"
	"database/sql"
	"time"
)

type FeedbackModel struct {
	DB *sql.DB
}

func (m FeedbackModel) InsertLike(user_id, project_id int) error {
	query := `INSERT INTO favourite (user_id, project_id) VALUES ($1, $2)`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := m.DB.ExecContext(ctx, query, user_id, project_id)
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

func (m FeedbackModel) GetLikes(project_id int) (*int, error) {
	query := `SELECT COUNT(*) FROM favourite WHERE project_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count int
	err := m.DB.QueryRowContext(ctx, query, project_id).Scan(&count)
	if err != nil {
		return nil, err
	}

	return &count, nil
}

func (m FeedbackModel) Unlike(user_id, project_id int) error {
	query := `DELETE FROM favourite WHERE user_id = $1 AND project_id = $2`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{
		user_id,
		project_id,
	}

	result, err := m.DB.ExecContext(ctx, query, args...)
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

func (m FeedbackModel) DidILikeThis(user_id, project_id int) (bool, error) {
	query := `SELECT EXISTS (SELECT 1 FROM favourite WHERE user_id = $1 AND project_id = $2) AS did_i_like_this`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{
		user_id,
		project_id,
	}

	var didI bool
	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&didI)
	if err != nil {
		return false, err
	}

	return didI, nil
}

func (m FeedbackModel) InsertSave(user_id, project_id int) error {
	query := `INSERT INTO save (user_id, project_id) VALUES ($1, $2)`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := m.DB.ExecContext(ctx, query, user_id, project_id)
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

func (m FeedbackModel) Unsave(user_id, project_id int) error {
	query := `DELETE FROM save WHERE user_id = $1 AND project_id = $2`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{
		user_id,
		project_id,
	}

	result, err := m.DB.ExecContext(ctx, query, args...)
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

func (m FeedbackModel) DidISaveThis(user_id, project_id int) (bool, error) {
	query := `SELECT EXISTS (SELECT 1 FROM save WHERE user_id = $1 AND project_id = $2) AS did_i_save_this`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{
		user_id,
		project_id,
	}

	var didI bool
	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&didI)
	if err != nil {
		return false, err
	}

	return didI, nil
}

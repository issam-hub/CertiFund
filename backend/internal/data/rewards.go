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

type Reward struct {
	ID                int            `json:"id"`
	ProjectID         int            `json:"project_id"`
	Title             string         `json:"title"`
	Description       string         `json:"description"`
	Amount            float64        `json:"amount"`
	EstimatedDelivery time.Time      `json:"estimated_delivery"`
	ImageURL          string         `json:"image_url"`
	IsAvailable       bool           `json:"is_available"`
	Includes          pq.StringArray `json:"includes"`
	CreatedAt         time.Time      `json:"-"`
	UpdatedAt         time.Time      `json:"-"`
	Version           int32          `json:"version"`
	BackingID         int            `json:"backing_id"`
}

type RewardModel struct {
	DB *sql.DB
}

func IfThenElseMessage(condition bool, a string, b string) string {
	if condition {
		return a
	}
	return b
}

func ValidateReward(v *validator.Validator, reward *Reward, index int32) {
	v.Check(reward.Title != "", "title", IfThenElseMessage(index == 0, "Title must be provided", fmt.Sprintf("Title %d must be provided", index)))
	v.Check(validator.MaxChars(reward.Title, 100), "title", IfThenElseMessage(index == 0, "Title cannot be more than 100 characters", fmt.Sprintf("Title %d cannot be more than 100 characters", index)))

	v.Check(reward.Amount >= 10000, "amount", IfThenElseMessage(index == 0, "Amount must be at least 10000", fmt.Sprintf("Amount %d must be at least 10000", index)))

	v.Check(reward.EstimatedDelivery.GoString() != "", "estimated_delivery", IfThenElseMessage(index == 0, "Estimated delivery must be provided", fmt.Sprintf("Estimated delivery %d must be provided", index)))
	v.Check(reward.EstimatedDelivery.After(time.Now()), "estimated_delivery", IfThenElseMessage(index == 0, "Estimated delivery should be after the date of today", fmt.Sprintf("Estimated delivery %d should be after the date of today", index)))

	v.Check(len(reward.Includes) > 0, "includes", IfThenElseMessage(index == 0, "Includes must be provided", fmt.Sprintf("Includes %d must be provided", index)))
	for i, include := range reward.Includes {
		v.Check(validator.MaxChars(include, 300), "includes", IfThenElseMessage(index == 0, fmt.Sprintf("Include %d cannot be more than 300 characters", i), fmt.Sprintf("Include %d of reward %d cannot be more than 300 characters", i, index)))
	}
}

func (m RewardModel) InsertAll(reward []Reward, projectID int) error {
	query := `INSERT INTO reward (project_id, title, description, amount, estimated_delivery, image_url, is_available, includes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	for _, r := range reward {
		_, err := tx.ExecContext(ctx, query, projectID, r.Title, r.Description, r.Amount, r.EstimatedDelivery, r.ImageURL, r.IsAvailable, r.Includes)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}

func (m RewardModel) GetAll(id int) (*[]Reward, error) {
	query := `SELECT reward_id, project_id, title, description, amount, image_url, includes, estimated_delivery, is_available FROM reward WHERE project_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rewards []Reward
	for rows.Next() {
		var reward Reward
		err := rows.Scan(&reward.ID, &reward.ProjectID, &reward.Title, &reward.Description, &reward.Amount, &reward.ImageURL, &reward.Includes, &reward.EstimatedDelivery, &reward.IsAvailable)
		if err != nil {
			return nil, err
		}
		rewards = append(rewards, reward)
	}

	return &rewards, nil
}

func (m RewardModel) UpdateAll(rewards []Reward, projectID int) error {
	reInsertQuery := `INSERT INTO reward (project_id, title, description, amount, estimated_delivery, image_url, is_available, includes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	deleteQuery := `DELETE FROM reward WHERE project_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, deleteQuery, projectID)
	if err != nil {
		return err
	}

	for _, r := range rewards {
		args := []interface{}{
			projectID,
			r.Title,
			r.Description,
			r.Amount,
			r.EstimatedDelivery,
			r.ImageURL,
			r.IsAvailable,
			r.Includes,
		}
		_, err := tx.ExecContext(ctx, reInsertQuery, args...)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}

func (m RewardModel) Get(id int) (*Reward, error) {
	if id < 1 {
		return nil, ErrNoRecordFound
	}
	var reward Reward
	query := `SELECT reward_id, project_id, title, description, amount, image_url, includes, estimated_delivery, is_available FROM reward WHERE reward_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, id).Scan(
		&reward.ID,
		&reward.ProjectID,
		&reward.Title,
		&reward.Description,
		&reward.Amount,
		&reward.ImageURL,
		&reward.Includes,
		&reward.EstimatedDelivery,
		&reward.IsAvailable,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}
	return &reward, nil
}

func (m RewardModel) InsertBackingReward(backingID, rewardID int) error {
	query := `INSERT INTO backing_reward (backing_id, reward_id) VALUES ($1, $2)`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, backingID, rewardID)
	if err != nil {
		return err
	}
	return nil
}

func (m RewardModel) CheckBackingWithRewards(backingID int) (bool, error) {
	query := `SELECT EXISTS (SELECT 1 FROM backing_reward WHERE backing_id = $1)`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var exists bool
	err := m.DB.QueryRowContext(ctx, query, backingID).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, err
}

func (m RewardModel) DeleteBackingReward(backingID int) error {
	query := `DELETE FROM backing_reward WHERE backing_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, backingID)
	if err != nil {
		return err
	}
	return nil
}

func (m RewardModel) GetAllByBacking(backingID int) (*[]Reward, error) {
	query := `SELECT r.reward_id, r.project_id, r.title, r.description, r.amount, r.image_url, r.includes, r.estimated_delivery, r.is_available 
	FROM reward r 
	INNER JOIN backing_reward br 
	ON br.reward_id = r.reward_id 
	WHERE br.backing_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, backingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rewards []Reward
	for rows.Next() {
		var reward Reward
		err := rows.Scan(&reward.ID, &reward.ProjectID, &reward.Title, &reward.Description, &reward.Amount, &reward.ImageURL, &reward.Includes, &reward.EstimatedDelivery, &reward.IsAvailable)
		if err != nil {
			return nil, err
		}
		rewards = append(rewards, reward)
	}

	return &rewards, nil
}

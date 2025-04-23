package data

import (
	"context"
	"database/sql"
	"encoding/json"
	"projectx/internal/validator"
	"time"

	"github.com/lib/pq"
)

type Expert struct {
	ID              int            `json:"expert_id"`
	ExpertiseFields pq.StringArray `json:"expertise_fields"`
	ExpertiseLevel  float64        `json:"expertise_level"`
	Qualification   string         `json:"qualification"`
	IsActive        bool           `json:"is_active"`
	CreatedAt       time.Time      `json:"-"`
	UpdatedAt       time.Time      `json:"-"`
	UserID          int            `json:"user_id"`
}

type Vote struct {
	HighlyNotRecommended float64 `json:"highly_not_recommended"`
	NotRecommended       float64 `json:"not_recommended"`
	Recommended          float64 `json:"recommended"`
	HighlyRecommended    float64 `json:"highly_recommended"`
}

type ExpertReview struct {
	ID         int       `json:"expert_review_id"`
	Vote       Vote      `json:"vote"`
	Comment    string    `json:"comment"`
	ReviewedAt time.Time `json:"reviewed_at"`
	ProjectID  int       `json:"project_id"`
	ExpertID   int       `json:"expert_id"`
}

func ValidateExpert(v *validator.Validator, expert *Expert) {
	acceptableLevels := []float64{0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1}
	v.Check(expert.ExpertiseFields != nil, "expertise_fields", "Expertise Fields must be provided")
	v.Check(len(expert.ExpertiseFields) >= 1 && len(expert.ExpertiseFields) <= 5, "expertise_fields", "Expertise Fields most contain at least 1 and no more than 5 items")
	v.Check(validator.Unique(expert.ExpertiseFields), "expertise_fields", "Expertise Fields must contain unique items")
	v.Check(expert.Qualification != "", "qualification", "Qualification must be provided")
	v.Check(expert.IsActive == true || expert.IsActive == false, "is_active", "IsActive must be a boolean")
	v.Check(expert.ExpertiseLevel >= 0 && expert.ExpertiseLevel <= 1, "expertise_level", "Expertise Level must be between 0 and 1")
	v.Check(validator.In(expert.ExpertiseLevel, acceptableLevels...), "expertise_level", "Invalid expertise level")

	for _, field := range expert.ExpertiseFields {
		v.Check(validator.In(field, SupportedCategories...), "expertise_fields", "Invalid category")
	}
}

func ValidateExpertReview(v *validator.Validator, review *ExpertReview) {
	acceptableVotes := []float64{0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1}
	v.Check(review.Vote != Vote{}, "decision", "Decision must be provided")
	v.Check(validator.In(review.Vote.HighlyNotRecommended, acceptableVotes...), "highly_not_recommended", "Invalid vote value")
	v.Check(validator.In(review.Vote.NotRecommended, acceptableVotes...), "not_recommended", "Invalid vote value")
	v.Check(validator.In(review.Vote.Recommended, acceptableVotes...), "recommended", "Invalid vote value")
	v.Check(validator.In(review.Vote.HighlyRecommended, acceptableVotes...), "highly_recommended", "Invalid vote value")
}

type ExpertsModel struct {
	DB *sql.DB
}

func (m ExpertsModel) Insert(expert *Expert) error {
	query := `INSERT INTO expert (expertise_fields, qualification, expertise_level, is_active, user_id)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING expert_id, created_at, updated_at`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{
		expert.ExpertiseFields,
		expert.Qualification,
		expert.ExpertiseLevel,
		expert.IsActive,
		expert.UserID,
	}

	return m.DB.QueryRowContext(ctx, query, args...).Scan(
		&expert.ID,
		&expert.CreatedAt,
		&expert.UpdatedAt,
	)
}

func (m ExpertsModel) GetByUserID(userID int) (*Expert, error) {
	query := `SELECT expert_id, expertise_fields, qualification, is_active, created_at, updated_at
	FROM expert
	WHERE user_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var expert Expert

	err := m.DB.QueryRowContext(ctx, query, userID).Scan(
		&expert.ID,
		&expert.ExpertiseFields,
		&expert.Qualification,
		&expert.IsActive,
		&expert.CreatedAt,
		&expert.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrNoRecordFound
		}
		return nil, err
	}

	return &expert, nil
}

func (m ExpertsModel) Assess(review *ExpertReview) error {
	query := `INSERT INTO expert_review (vote, comment, project_id, expert_id)
	VALUES ($1, $2, $3, $4)
	RETURNING expert_review_id, reviewed_at`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	voteJSON, err := json.Marshal(review.Vote)
	if err != nil {
		return err
	}

	args := []interface{}{
		voteJSON,
		review.Comment,
		review.ProjectID,
		review.ExpertID,
	}

	err = m.DB.QueryRowContext(ctx, query, args...).Scan(
		&review.ID,
		&review.ReviewedAt,
	)
	if err != nil {
		switch {
		case err.Error() == `pq: insert or update on table "expert_review" violates foreign key constraint "expert_review_expert_id_fkey"`:
			return ErrVotedTwice
		default:
			return err
		}
	}
	return nil
}

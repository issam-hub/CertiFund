package data

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"projectx/internal/validator"
	"strings"
	"time"

	"github.com/lib/pq"
)

type Project struct {
	ID              int            `json:"project_id"`
	Title           string         `json:"title"`
	Description     string         `json:"description"`
	FundingGoal     float64        `json:"funding_goal"`
	CurrentFunding  float64        `json:"current_funding"`
	Categories      pq.StringArray `json:"categories"`
	Deadline        time.Time      `json:"deadline"`
	Status          string         `json:"status"`
	ProjectImg      string         `json:"project_img"`
	Campaign        string         `json:"campaign"`
	CreatedAt       time.Time      `json:"-"`
	UpdatedAt       time.Time      `json:"-"`
	LaunchedAt      time.Time      `json:"launched_at"`
	Version         int32          `json:"version"`
	CreatorID       int            `json:"creator_id"`
	Rewards         []Reward       `json:"rewards,omitempty"`
	IsSuspicious    bool           `json:"is_suspicious"`
	ExpertsDecision string         `json:"experts_decision"`
}

type Review struct {
	ID         int       `json:"review_id"`
	Status     string    `json:"status"`
	Feedback   string    `json:"feedback"`
	ReviewedAt time.Time `json:"reviewed_at"`
	ReviewerID int       `json:"reviewer_id"`
	ProjectID  int       `json:"project_id"`
}

type ProjectModel struct {
	DB *sql.DB
}

func ValidateProject(v *validator.Validator, project *Project) {

	v.Check(project.Title != "", "title", "Title must be provided")
	v.Check(len(project.Title) <= 100, "title", "Title should be less than or equal to 100 character")

	v.Check(project.Description != "", "description", "Description must be provided")
	v.Check(len(strings.Split(project.Description, " ")) <= 2000, "description", "Description should be less than or equal to 2000 word")

	v.Check(project.Categories != nil, "categories", "Categories must be provided")
	v.Check(len(project.Categories) >= 1 && len(project.Categories) <= 5, "categories", "Categories most contain at least 1 and no more than 5 items")
	v.Check(validator.Unique(project.Categories), "categories", "Categories must contain unique items")

	v.Check(project.FundingGoal != 0, "funding goal", "Funding goal must be provided")
	v.Check(project.FundingGoal > 0, "funding goal", "Funding goal must be positive")

	v.Check(project.Deadline.GoString() != "", "deadline", "Deadline must be provided")
	v.Check(project.Deadline.After(time.Now()), "deadline", "Deadline should be after the date of today")
	v.Check((project.Deadline.Sub(time.Now()).Hours()/24/30) <= 4, "deadline", "Deadline should not exceed 4 months since the date of today")

	for _, category := range project.Categories {
		v.Check(validator.In(category, SupportedCategories...), "categories", "Invalid category")
	}
}

func ValidateCategories(v *validator.Validator, categories []string) {
	categoriesList := []string{"technology", "art", "music", "games", "film & video", "publishing & writing", "design", "food & craft", "social good", "miscellaneous"}
	v.Check(validator.Unique(categories), "categories", "Categories must contain unique items")
	for _, category := range categoriesList {
		v.Check(validator.In(category, categories...), "categories", "Invalid category")
	}
}

func ValidateTitle(v *validator.Validator, title string) {
	v.Check(len(title) <= 100, "title", "Title should be less than or equal to 100 character")
}

func ValidateReview(v *validator.Validator, review *Review) {
	v.Check(validator.In(review.Status, "Approved", "Rejected", "Flagged"), "status", "Status should be either approved, rejected or flagged")
	v.Check(validator.InBetween(review.Feedback, 10, 500), "feedback", "Feedback should be between 10 and 500 characters")
}

func (m ProjectModel) GetAll(title string, categories []string, filters Filter) ([]*Project, MetaData, error) {
	offset := (filters.Page - 1) * filters.PageSize

	query := fmt.Sprintf(`
	SELECT COUNT(*) OVER(), project_id, title, description, categories, funding_goal, current_funding, deadline, status, project_img, campaign, created_at, updated_at, launched_at, version, creator_id, experts_decision
	FROM project
	WHERE (to_tsvector('simple', title) @@ plainto_tsquery('simple', $1) OR $1='') 
	AND (categories && $2 OR $2 = '{}')
	AND (status = 'Completed' OR status = 'Live')
	ORDER BY %s %s, project_id ASC
	LIMIT $3 OFFSET $4
	`, filters.sortColumn(), filters.sortDirection())

	projects := []*Project{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{title, pq.Array(categories), filters.PageSize, offset}

	rows, err := m.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, MetaData{}, err
	}

	totalRecords := 0
	for rows.Next() {
		project := &Project{}
		var projectImgVar sql.NullString
		var campaignVar sql.NullString

		err := rows.Scan(
			&totalRecords,
			&project.ID,
			&project.Title,
			&project.Description,
			&project.Categories,
			&project.FundingGoal,
			&project.CurrentFunding,
			&project.Deadline,
			&project.Status,
			&projectImgVar,
			&campaignVar,
			&project.CreatedAt,
			&project.UpdatedAt,
			&project.LaunchedAt,
			&project.Version,
			&project.CreatorID,
			&project.ExpertsDecision,
		)
		if err != nil {
			return nil, MetaData{}, err
		}

		project.ProjectImg = projectImgVar.String
		project.Campaign = campaignVar.String

		projects = append(projects, project)
	}
	if err := rows.Err(); err != nil {
		return nil, MetaData{}, err
	}

	metaData := calculateMetadata(totalRecords, filters.Page, filters.PageSize)

	return projects, metaData, nil
}

func (m ProjectModel) Insert(project *Project) error {
	query := `
	INSERT INTO project 
	(title, description, categories, funding_goal, deadline, creator_id)
	VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING project_id, status, created_at, updated_at, version
	`
	args := []interface{}{
		project.Title,
		project.Description,
		project.Categories,
		project.FundingGoal,
		project.Deadline,
		project.CreatorID,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	return m.DB.QueryRowContext(ctx, query, args...).Scan(&project.ID, &project.Status, &project.CreatedAt, &project.UpdatedAt, &project.Version)
}

func (m ProjectModel) Get(id int) (*Project, error) {
	if id < 1 {
		return nil, ErrNoRecordFound
	}
	var project Project
	var projectImgVar sql.NullString
	var campaignVar sql.NullString
	query := `SELECT project_id, title, description, categories, funding_goal, current_funding, deadline, status, project_img, campaign, created_at, updated_at, launched_at, version, creator_id, experts_decision FROM project WHERE project_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, id).Scan(
		&project.ID,
		&project.Title,
		&project.Description,
		&project.Categories,
		&project.FundingGoal,
		&project.CurrentFunding,
		&project.Deadline,
		&project.Status,
		&projectImgVar,
		&campaignVar,
		&project.CreatedAt,
		&project.UpdatedAt,
		&project.LaunchedAt,
		&project.Version,
		&project.CreatorID,
		&project.ExpertsDecision,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	project.ProjectImg = projectImgVar.String
	project.Campaign = campaignVar.String

	return &project, nil
}
func (m ProjectModel) GetPublic(id int) (*Project, error) {
	if id < 1 {
		return nil, ErrNoRecordFound
	}
	var project Project
	var projectImgVar sql.NullString
	var campaignVar sql.NullString
	query := `SELECT project_id, title, description, categories, funding_goal, current_funding, deadline, status, project_img, campaign, created_at, updated_at, launched_at, version, creator_id, experts_decision FROM project WHERE project_id = $1 AND (status = 'Live' OR status = 'Completed')`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, id).Scan(
		&project.ID,
		&project.Title,
		&project.Description,
		&project.Categories,
		&project.FundingGoal,
		&project.CurrentFunding,
		&project.Deadline,
		&project.Status,
		&projectImgVar,
		&campaignVar,
		&project.CreatedAt,
		&project.UpdatedAt,
		&project.LaunchedAt,
		&project.Version,
		&project.CreatorID,
		&project.ExpertsDecision,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	project.ProjectImg = projectImgVar.String
	project.Campaign = campaignVar.String

	return &project, nil
}

func (m ProjectModel) Update(project *Project) error {
	query := `
		UPDATE project SET 
		title = $1, description = $2, categories = $3, funding_goal = $4, current_funding = $5, deadline = $6, status = $7, project_img = $8, campaign = $9, launched_at = $10, is_suspicious = $11, version = version + 1
		WHERE project_id = $12 AND version = $13 RETURNING updated_at, version
	`

	args := []interface{}{
		project.Title,
		project.Description,
		project.Categories,
		project.FundingGoal,
		project.CurrentFunding,
		project.Deadline,
		project.Status,
		project.ProjectImg,
		project.Campaign,
		project.LaunchedAt,
		project.IsSuspicious,
		project.ID,
		project.Version,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&project.UpdatedAt, &project.Version)
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

func (m ProjectModel) ProjectOwnership(projectID, creatorID int) (bool, error) {
	query := `
	SELECT EXISTS (
		SELECT 1 FROM project p WHERE
		p.project_id = $1 AND p.creator_id = $2
	) AS is_project_owner
	`

	args := []interface{}{projectID, creatorID}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var isProjectOwner bool

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&isProjectOwner)
	if err != nil {
		return false, err
	}

	return isProjectOwner, nil
}

func (m ProjectModel) GetAllByCreator(creatorID int) ([]*Project, error) {
	query := `
		SELECT project_id, title, description, categories, funding_goal, current_funding, deadline, status, project_img, campaign, created_at, updated_at, launched_at, version, creator_id, experts_decision
		FROM project WHERE creator_id = $1
	`

	projects := []*Project{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, creatorID)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		project := &Project{}
		var projectImgVar sql.NullString
		var campaignVar sql.NullString

		err := rows.Scan(
			&project.ID,
			&project.Title,
			&project.Description,
			&project.Categories,
			&project.FundingGoal,
			&project.CurrentFunding,
			&project.Deadline,
			&project.Status,
			&projectImgVar,
			&campaignVar,
			&project.CreatedAt,
			&project.UpdatedAt,
			&project.LaunchedAt,
			&project.Version,
			&project.CreatorID,
			&project.ExpertsDecision,
		)
		if err != nil {
			return nil, err
		}

		project.ProjectImg = projectImgVar.String
		project.Campaign = campaignVar.String

		projects = append(projects, project)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projects, nil
}

func (m ProjectModel) GetAllByCreatorPublic(creatorID int) ([]*Project, error) {
	query := `
		SELECT project_id, title, description, categories, funding_goal, current_funding, deadline, status, project_img, campaign, created_at, updated_at, launched_at, version, creator_id, experts_decision
		FROM project WHERE creator_id = $1 AND (status = 'Live' OR status = 'Completed')
	`

	projects := []*Project{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, creatorID)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		project := &Project{}
		var projectImgVar sql.NullString
		var campaignVar sql.NullString

		err := rows.Scan(
			&project.ID,
			&project.Title,
			&project.Description,
			&project.Categories,
			&project.FundingGoal,
			&project.CurrentFunding,
			&project.Deadline,
			&project.Status,
			&projectImgVar,
			&campaignVar,
			&project.CreatedAt,
			&project.UpdatedAt,
			&project.LaunchedAt,
			&project.Version,
			&project.CreatorID,
			&project.ExpertsDecision,
		)
		if err != nil {
			return nil, err
		}

		project.ProjectImg = projectImgVar.String
		project.Campaign = campaignVar.String

		projects = append(projects, project)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projects, nil
}

func (m ProjectModel) GetAllByBacker(backerID int) ([]*Project, error) {
	query := `
		SELECT pr.project_id, pr.title, pr.description, pr.categories, pr.funding_goal, pr.current_funding, pr.deadline, pr.status, pr.project_img, pr.campaign, pr.created_at, pr.updated_at, pr.launched_at, pr.version, pr.creator_id, pr.experts_decision 
		FROM project pr INNER JOIN backing b ON pr.project_id = b.project_id WHERE b.backer_id = $1
	`

	projects := []*Project{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, backerID)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		project := &Project{}
		var projectImgVar sql.NullString
		var campaignVar sql.NullString

		err := rows.Scan(
			&project.ID,
			&project.Title,
			&project.Description,
			&project.Categories,
			&project.FundingGoal,
			&project.CurrentFunding,
			&project.Deadline,
			&project.Status,
			&projectImgVar,
			&campaignVar,
			&project.CreatedAt,
			&project.UpdatedAt,
			&project.LaunchedAt,
			&project.Version,
			&project.CreatorID,
			&project.ExpertsDecision,
		)
		if err != nil {
			return nil, err
		}

		project.ProjectImg = projectImgVar.String
		project.Campaign = campaignVar.String

		projects = append(projects, project)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projects, nil
}

func (m ProjectModel) GetAllSavedByCurrentUser(userID int) ([]*Project, error) {
	query := `
	SELECT pr.project_id, pr.title, pr.description, pr.categories, pr.funding_goal, pr.current_funding, pr.deadline, pr.status, pr.project_img, pr.campaign, pr.created_at, pr.updated_at, pr.launched_at, pr.version, pr.creator_id, pr.experts_decision 
	FROM project pr INNER JOIN save s ON pr.project_id = s.project_id WHERE s.user_id = $1
`

	projects := []*Project{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		project := &Project{}
		var projectImgVar sql.NullString
		var campaignVar sql.NullString

		err := rows.Scan(
			&project.ID,
			&project.Title,
			&project.Description,
			&project.Categories,
			&project.FundingGoal,
			&project.CurrentFunding,
			&project.Deadline,
			&project.Status,
			&projectImgVar,
			&campaignVar,
			&project.CreatedAt,
			&project.UpdatedAt,
			&project.LaunchedAt,
			&project.Version,
			&project.CreatorID,
			&project.ExpertsDecision,
		)
		if err != nil {
			return nil, err
		}

		project.ProjectImg = projectImgVar.String
		project.Campaign = campaignVar.String

		projects = append(projects, project)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projects, nil
}

func (m ProjectModel) ReviewProject(review *Review) error {
	query := `INSERT INTO project_review
	(status, feedback, reviewer_id, project_id)
	VALUES ($1, $2, $3, $4)
	RETURNING review_id, reviewed_at`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{
		review.Status,
		review.Feedback,
		review.ReviewerID,
		review.ProjectID,
	}

	return m.DB.QueryRowContext(ctx, query, args...).Scan(
		&review.ID,
		&review.ReviewedAt,
	)
}

func (m ProjectModel) GetReview(userId int, projectId int) (*Review, error) {
	query := `SELECT review_id, status, feedback FROM project_review WHERE project_id = $1 AND user_id = $2 ORDER BY review_id DESC LIMIT 1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var review Review

	args := []interface{}{
		projectId,
		userId,
	}
	err := m.DB.QueryRowContext(ctx, query, args...).Scan(
		&review.ID,
		&review.Status,
		&review.Feedback,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	return &review, nil
}

func (m ProjectModel) GetAllByReviewer(reviewerID, page, pageSize int) ([]*Project, MetaData, error) {
	offset := (page - 1) * pageSize

	query := `
		SELECT COUNT(pr.project_id) OVER(), pr.project_id, pr.title, pr.description, pr.categories, pr.funding_goal, pr.current_funding, pr.deadline, pr.status, pr.project_img, pr.campaign, pr.created_at, pr.updated_at, pr.launched_at, pr.version, pr.creator_id, pr.is_suspicious, pr.experts_decision
		FROM project pr INNER JOIN project_review pre ON pr.project_id = pre.project_id WHERE pre.reviewer_id = $1 AND pre.status <> 'Flagged'
		LIMIT $2 OFFSET $3
	`

	projects := []*Project{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{reviewerID, pageSize, offset}

	rows, err := m.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, MetaData{}, err
	}

	totalRecords := 0
	for rows.Next() {
		project := &Project{}
		var projectImgVar sql.NullString
		var campaignVar sql.NullString

		err := rows.Scan(
			&totalRecords,
			&project.ID,
			&project.Title,
			&project.Description,
			&project.Categories,
			&project.FundingGoal,
			&project.CurrentFunding,
			&project.Deadline,
			&project.Status,
			&projectImgVar,
			&campaignVar,
			&project.CreatedAt,
			&project.UpdatedAt,
			&project.LaunchedAt,
			&project.Version,
			&project.CreatorID,
			&project.IsSuspicious,
			&project.ExpertsDecision,
		)
		if err != nil {
			return nil, MetaData{}, err
		}

		project.ProjectImg = projectImgVar.String
		project.Campaign = campaignVar.String

		projects = append(projects, project)
	}
	if err := rows.Err(); err != nil {
		return nil, MetaData{}, err
	}

	metaData := calculateMetadata(totalRecords, page, pageSize)

	return projects, metaData, nil
}

func (m ProjectModel) GetAllFlaggedByReviewer(reviewerID, page, pageSize int) ([]*Project, MetaData, error) {
	offset := (page - 1) * pageSize

	query := `
		SELECT COUNT(pr.project_id) OVER(), pr.project_id, pr.title, pr.description, pr.categories, pr.funding_goal, pr.current_funding, pr.deadline, pr.status, pr.project_img, pr.campaign, pr.created_at, pr.updated_at, pr.launched_at, pr.version, pr.creator_id, pr.is_suspicious, pr.experts_decision
		FROM project pr INNER JOIN project_review pre ON pr.project_id = pre.project_id WHERE pre.reviewer_id = $1 AND pre.status = 'Flagged'
		LIMIT $2 OFFSET $3
	`

	projects := []*Project{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{reviewerID, pageSize, offset}

	rows, err := m.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, MetaData{}, err
	}

	totalRecords := 0
	for rows.Next() {
		project := &Project{}
		var projectImgVar sql.NullString
		var campaignVar sql.NullString

		err := rows.Scan(
			&totalRecords,
			&project.ID,
			&project.Title,
			&project.Description,
			&project.Categories,
			&project.FundingGoal,
			&project.CurrentFunding,
			&project.Deadline,
			&project.Status,
			&projectImgVar,
			&campaignVar,
			&project.CreatedAt,
			&project.UpdatedAt,
			&project.LaunchedAt,
			&project.Version,
			&project.CreatorID,
			&project.IsSuspicious,
			&project.ExpertsDecision,
		)
		if err != nil {
			return nil, MetaData{}, err
		}

		project.ProjectImg = projectImgVar.String
		project.Campaign = campaignVar.String

		projects = append(projects, project)
	}
	if err := rows.Err(); err != nil {
		return nil, MetaData{}, err
	}

	metaData := calculateMetadata(totalRecords, page, pageSize)

	return projects, metaData, nil
}

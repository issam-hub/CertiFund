package data

import (
	"context"
	"database/sql"
	"time"

	"github.com/lib/pq"
)

type ProjectsTable struct {
	ID             int            `json:"project_id"`
	Title          string         `json:"title"`
	Description    string         `json:"description"`
	FundingGoal    float64        `json:"funding_goal"`
	CurrentFunding float64        `json:"current_funding"`
	Categories     pq.StringArray `json:"categories"`
	Deadline       time.Time      `json:"deadline"`
	Status         string         `json:"status"`
	ProjectImg     string         `json:"project_img"`
	Campaign       string         `json:"campaign"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	LaunchedAt     time.Time      `json:"launched_at"`
	Version        int32          `json:"-"`
	Creator        string         `json:"creator"`
	Backers        int            `json:"backers"`
	CreatorImg     string         `json:"creator_img"`
	Rewards        []Reward       `json:"rewards,omitempty"`
}

type UsersTable struct {
	ID               int       `json:"user_id"`
	Username         string    `json:"username"`
	Email            string    `json:"email"`
	ImageURL         string    `json:"image_url"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	Role             string    `json:"role"`
	ProjectsCreated  string    `json:"projects_created"`
	ProjectsBacked   string    `json:"projects_backed"`
	TotalContributed float64   `json:"total_contributed"`
	Activated        bool      `json:"activated"`
}

type BackingsTable struct {
	ID            int       `json:"backing_id"`
	PaymentID     int       `json:"payment_id"`
	Backer        string    `json:"backer"`
	Project       string    `json:"project"`
	ProjectID     int       `json:"project_id"`
	Amount        float64   `json:"amount"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	Status        string    `json:"status"`
	PaymentMethod string    `json:"payment_method"`
	TransactionID string    `json:"transaction_id"`
}

type TablesModel struct {
	DB *sql.DB
}

func (m TablesModel) GetProjects(page, pageSize int) ([]*ProjectsTable, MetaData, error) {
	offset := (page - 1) * pageSize

	query := `
	SELECT COUNT(pr.project_id) OVER(), pr.project_id, pr.title, pr.description, pr.categories, pr.funding_goal, pr.current_funding, pr.deadline, pr.status, pr.project_img, pr.campaign, pr.created_at, pr.updated_at, pr.launched_at, u.username as creator, u.image_url, count(DISTINCT b.backer_id) as backers
	FROM project pr 
	INNER JOIN user_t u ON pr.creator_id = u.user_id 
	LEFT JOIN backing b on pr.project_id = b.project_id
	GROUP BY pr.project_id, u.username, u.image_url
	LIMIT $1 OFFSET $2
	`

	table := []*ProjectsTable{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{pageSize, offset}

	rows, err := m.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, MetaData{}, err
	}

	totalRecords := 0
	for rows.Next() {
		row := &ProjectsTable{}
		var projectImgVar sql.NullString
		var campaignVar sql.NullString

		err := rows.Scan(
			&totalRecords,
			&row.ID,
			&row.Title,
			&row.Description,
			&row.Categories,
			&row.FundingGoal,
			&row.CurrentFunding,
			&row.Deadline,
			&row.Status,
			&projectImgVar,
			&campaignVar,
			&row.CreatedAt,
			&row.UpdatedAt,
			&row.LaunchedAt,
			&row.Creator,
			&row.CreatorImg,
			&row.Backers,
		)
		if err != nil {
			return nil, MetaData{}, err
		}

		row.ProjectImg = projectImgVar.String
		row.Campaign = campaignVar.String

		table = append(table, row)
	}
	if err := rows.Err(); err != nil {
		return nil, MetaData{}, err
	}

	metaData := calculateMetadata(totalRecords, page, pageSize)

	return table, metaData, nil
}

func (m TablesModel) GetUsers(page, pageSize int) ([]*UsersTable, MetaData, error) {
	offset := (page - 1) * pageSize

	query := `
	SELECT COUNT(u.user_id) OVER(),
		u.user_id,
		u.username,
		u.email,
		u.image_url,
		u.activated,
		r.rolename,
		COUNT(pr.creator_id) as projects_created,
		COUNT(DISTINCT CASE WHEN pa.status = 'succeeded' THEN b.backing_id END) as projects_backed,
		SUM(CASE WHEN pa.status = 'succeeded' THEN pa.amount ELSE 0 END) as total_contributed,
		u.created_at,
		u.updated_at
	FROM user_t u
	LEFT JOIN project pr ON u.user_id = pr.creator_id
	LEFT JOIN backing b ON u.user_id = b.backer_id
	LEFT JOIN payment pa ON b.backing_id = pa.backing_id
	INNER JOIN role_t r ON u.role_id = r.role_id
	GROUP BY u.user_id, u.username, u.email, u.image_url, r.rolename
	LIMIT $1 OFFSET $2
	`

	table := []*UsersTable{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{pageSize, offset}

	rows, err := m.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, MetaData{}, err
	}

	totalRecords := 0
	for rows.Next() {
		row := &UsersTable{}
		var amount sql.NullFloat64

		err := rows.Scan(
			&totalRecords,
			&row.ID,
			&row.Username,
			&row.Email,
			&row.ImageURL,
			&row.Activated,
			&row.Role,
			&row.ProjectsCreated,
			&row.ProjectsBacked,
			&amount,
			&row.CreatedAt,
			&row.UpdatedAt,
		)
		if err != nil {
			return nil, MetaData{}, err
		}

		row.TotalContributed = amount.Float64

		table = append(table, row)
	}
	if err := rows.Err(); err != nil {
		return nil, MetaData{}, err
	}

	metaData := calculateMetadata(totalRecords, page, pageSize)

	return table, metaData, nil
}

func (m TablesModel) GetBackings(page, pageSize int) ([]*BackingsTable, MetaData, error) {
	offset := (page - 1) * pageSize

	query := `
	SELECT COUNT(*) OVER(), b.backing_id, pa.payment_id, u.username, pr.project_id, pr.title, pa.amount, pa.status, pa.created_at, pa.updated_at, pa.payment_method, pa.transaction_id
	FROM backing b
	INNER JOIN user_t u ON b.backer_id = u.user_id 
	INNER JOIN project pr ON pr.project_id = b.project_id 
	INNER JOIN payment pa ON pa.backing_id = b.backing_id 
	GROUP BY b.backing_id, pa.payment_id, u.username, pr.project_id, pr.title, pa.amount, pa.status, pa.payment_method, pa.created_at, pa.updated_at, pa.transaction_id
	LIMIT $1 OFFSET $2
	`

	table := []*BackingsTable{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{pageSize, offset}

	rows, err := m.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, MetaData{}, err
	}

	totalRecords := 0
	for rows.Next() {
		row := &BackingsTable{}
		var amount sql.NullFloat64

		err := rows.Scan(
			&totalRecords,
			&row.ID,
			&row.PaymentID,
			&row.Backer,
			&row.ProjectID,
			&row.Project,
			&amount,
			&row.Status,
			&row.CreatedAt,
			&row.UpdatedAt,
			&row.PaymentMethod,
			&row.TransactionID,
		)
		if err != nil {
			return nil, MetaData{}, err
		}

		row.Amount = amount.Float64

		table = append(table, row)
	}
	if err := rows.Err(); err != nil {
		return nil, MetaData{}, err
	}

	metaData := calculateMetadata(totalRecords, page, pageSize)

	return table, metaData, nil
}

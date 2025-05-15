package data

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/lib/pq"
)

type Stats struct {
	TotalProjects      int     `json:"total_projects"`
	TotalMoneyRaised   float64 `json:"total_money_raised"`
	SuccessfulProjects int     `json:"successful_projects"`
	FailedProjects     int     `json:"failed_projects"`
	TotalBackers       int     `json:"total_backers"`
	TotalCreators      int     `json:"total_creators"`
	TotalBackings      int     `json:"total_backings"`
	TotalRefunds       int     `json:"total_refunds"`
}

type Overview struct {
	ProjectMonth       string `json:"project_month"`
	SuccessfulProjects int    `json:"successful_projects"`
	FailedProjects     int    `json:"failed_projects"`
	TotalProjects      int    `json:"total_projects"`
}

type TopProject struct {
	Title       string  `json:"title"`
	Creator     string  `json:"creator"`
	TotalRaised float64 `json:"total_raised"`
}

type TopUser struct {
	Username     string  `json:"username"`
	ProjectCount int     `json:"project_count"`
	TotalRaised  float64 `json:"total_raised"`
	ImageURL     string  `json:"image_url"`
}

type CategoryDistribution struct {
	Category string `json:"category"`
	Count    int    `json:"count"`
}

type CreatorBackerGrowth struct {
	Month    string `json:"month"`
	Creators int    `json:"creators"`
	Backers  int    `json:"backers"`
}

type BackingVSRefund struct {
	Month    string `json:"month"`
	Backings int    `json:"backings"`
	Refunds  int    `json:"refunds"`
}

type ProfileStats struct {
	CreatedProjects int `json:"created_projects"`
	BackedProjects  int `json:"backed_projects"`
}

type ReviewerPerformance struct {
	Day      string `json:"day"`
	Approved int    `json:"approved"`
	Rejected int    `json:"rejected"`
	Flagged  int    `json:"flagged"`
}

type Accuracy struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Vote        Vote   `json:"expert_vote"`
	FinalResult string `json:"final_result"`
}

type ReviewerStats struct {
	PendingReviews  int `json:"pending_reviews"`
	ApprovedReviews int `json:"approved_reviews"`
	RejectedReviews int `json:"rejected_reviews"`
}

type UserStats struct {
	TotalProjects  int     `json:"total_projects"`
	TotalRaised    float64 `json:"total_raised"`
	ProjectsBacked int     `json:"projects_backed"`
	TotalBacked    float64 `json:"total_backed"`
}

type ProjectsStatistics struct {
	Title          string         `json:"title"`
	Categories     pq.StringArray `json:"categories"`
	FundingGoal    float64        `json:"funding_goal"`
	CurrentFunding float64        `json:"current_funding"`
	Deadline       time.Time      `json:"deadline"`
	Status         string         `json:"status"`
	Backers        int            `json:"backers"`
}

type StatsModel struct {
	DB *sql.DB
}

func (m StatsModel) GetTotalProjectsCount(stats *Stats) error {
	query := `SELECT COUNT(*) OVER() FROM project`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}
	stats.TotalProjects = int(count.Int64)

	return nil
}

func (m StatsModel) GetTotalMoneyRaised(stats *Stats) error {
	query := `SELECT SUM(amount)/100 FROM payment WHERE status = 'succeeded'`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullFloat64
	err := m.DB.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}

	stats.TotalMoneyRaised = count.Float64

	return nil
}

func (m StatsModel) GetTotalSuccessfulProjectsCount(stats *Stats) error {
	query := `SELECT COUNT(*) OVER() FROM project WHERE status='Completed' AND current_funding >= funding_goal`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}
	stats.SuccessfulProjects = int(count.Int64)

	return nil
}

func (m StatsModel) GetTotalFailedProjectsCount(stats *Stats) error {
	query := `SELECT COUNT(*) OVER() FROM project WHERE status='Completed' AND current_funding < funding_goal`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}

	stats.FailedProjects = int(count.Int64)

	return nil
}
func (m StatsModel) GetTotalCreators(stats *Stats) error {
	query := `SELECT DISTINCT COUNT(creator_id) OVER()
	FROM project`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}

	stats.TotalCreators = int(count.Int64)

	return nil
}
func (m StatsModel) GetTotalBackers(stats *Stats) error {
	query := `SELECT DISTINCT COUNT(*) OVER()
	FROM backing b
	INNER JOIN payment pa
	ON b.backing_id = pa.backing_id
	WHERE pa.status = 'succeeded'`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}

	stats.TotalBackers = int(count.Int64)

	return nil
}
func (m StatsModel) GetTotalBackings(stats *Stats) error {
	query := `SELECT COUNT(*) FROM backing`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}

	stats.TotalBackings = int(count.Int64)

	return nil
}
func (m StatsModel) GetTotalRefunds(stats *Stats) error {
	query := `SELECT COUNT(*) OVER() FROM payment WHERE status = 'refunded'`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}

	stats.TotalRefunds = int(count.Int64)

	return nil
}

func (m StatsModel) GetProjectsOverview() ([]*Overview, error) {
	query := `
	WITH project_months AS (
		SELECT
			to_char(deadline, 'Month') AS project_month,
			CASE
				WHEN current_funding >= funding_goal THEN 'Successful'
				WHEN current_funding < funding_goal THEN 'Failed'
				ELSE 'Other'
			END AS project_status
		FROM project
		WHERE status = 'Completed'
	)

	SELECT
		left(project_month, 3),
		COUNT(*) AS total_projects,
		COUNT(CASE WHEN project_status = 'Successful' THEN 1 END) AS successful_projects,
		COUNT(CASE WHEN project_status = 'Failed' THEN 1 END) AS failed_projects
	FROM project_months
	GROUP BY project_month
	ORDER BY TO_DATE(project_month, 'Month');
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	projectsOverview := []*Overview{}

	for rows.Next() {
		overview := &Overview{}
		var totalCount sql.NullInt64
		var successCount sql.NullInt64
		var failureCount sql.NullInt64

		err := rows.Scan(
			&overview.ProjectMonth,
			&totalCount,
			&successCount,
			&failureCount,
		)
		if err != nil {
			return nil, err
		}

		overview.TotalProjects = int(totalCount.Int64)
		overview.SuccessfulProjects = int(successCount.Int64)
		overview.FailedProjects = int(failureCount.Int64)

		projectsOverview = append(projectsOverview, overview)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projectsOverview, nil
}

func (m StatsModel) GetTopFiveProjects() ([]*TopProject, error) {
	query := `
	SELECT pr.title, u.username AS creator, sum(pa.amount)/100 AS total_raised
	FROM backing b
	INNER JOIN payment pa
	ON pa.backing_id = b.backing_id
	INNER JOIN project pr
	ON b.project_id = pr.project_id
	INNER JOIN user_t u
	ON pr.creator_id = u.user_id
	WHERE pa.status = 'succeeded'
	GROUP BY creator, pr.title
	ORDER BY total_raised DESC
	LIMIT 5;
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	topProjects := []*TopProject{}

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		topProject := TopProject{}

		err := rows.Scan(&topProject.Title, &topProject.Creator, &topProject.TotalRaised)
		if err != nil {
			return nil, err
		}
		topProjects = append(topProjects, &topProject)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return topProjects, nil
}

func (m StatsModel) GetTopFiveCreators() ([]*TopUser, error) {
	query := `
	SELECT u.username, u.image_url, COUNT(pr.project_id) AS project_count, COALESCE(SUM(pa.amount)/100, 0) AS total_raised
	FROM project pr
	LEFT JOIN backing b ON b.project_id = pr.project_id
	LEFT JOIN payment pa ON b.backing_id = pa.backing_id
	INNER JOIN user_t u ON pr.creator_id = u.user_id
	WHERE pa.status = 'succeeded'
	GROUP BY u.username, u.image_url
	ORDER BY project_count DESC, total_raised DESC
	LIMIT 5;
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	topCreators := []*TopUser{}

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		topCreator := TopUser{}

		err := rows.Scan(&topCreator.Username, &topCreator.ImageURL, &topCreator.ProjectCount, &topCreator.TotalRaised)
		if err != nil {
			return nil, err
		}

		topCreators = append(topCreators, &topCreator)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return topCreators, nil
}

func (m StatsModel) GetTopFiveBackers() ([]*TopUser, error) {
	query := `
	SELECT u.username, u.image_url, COUNT(pr.project_id) AS project_count, SUM(pa.amount)/100 AS total_raised
	FROM backing b
	INNER JOIN payment pa ON b.backing_id = pa.backing_id
	INNER JOIN project pr ON b.project_id = pr.project_id
	INNER JOIN user_t u ON b.backer_id = u.user_id
	WHERE pa.status = 'succeeded'
	GROUP BY u.username, u.image_url
	ORDER BY project_count, total_raised DESC
	LIMIT 5;
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	topBackers := []*TopUser{}

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		topBacker := TopUser{}

		var imageUrl sql.NullString

		err := rows.Scan(&topBacker.Username, &imageUrl, &topBacker.ProjectCount, &topBacker.TotalRaised)
		if err != nil {
			return nil, err
		}

		topBacker.ImageURL = imageUrl.String

		topBackers = append(topBackers, &topBacker)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return topBackers, nil
}

func (m StatsModel) CategoriesDistrubtion() ([]*CategoryDistribution, error) {
	query := `
	WITH elements (element) AS (
		SELECT unnest(categories) FROM project
	)
	SELECT DISTINCT element AS category, COUNT(*)
	FROM elements
	GROUP BY category;
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	categoriesDist := []*CategoryDistribution{}

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		categoryDist := CategoryDistribution{}

		err := rows.Scan(&categoryDist.Category, &categoryDist.Count)
		if err != nil {
			return nil, err
		}

		categoriesDist = append(categoriesDist, &categoryDist)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return categoriesDist, nil
}

func (m StatsModel) CreatorsBackersGrowth() ([]*CreatorBackerGrowth, error) {
	query := `
	WITH months AS (
    SELECT 
        TO_CHAR(make_date(2025, m, 1), 'Month') AS month, 
        m AS month_num
    FROM generate_series(1, 12) AS m
	),
	creators_monthly AS (
		SELECT 
			TO_CHAR(launched_at, 'Month') AS month,
			COUNT(DISTINCT creator_id) AS unique_creators
		FROM project
		GROUP BY TO_CHAR(launched_at, 'Month')
	),
	backers_monthly AS (
		SELECT 
			TO_CHAR(b.created_at, 'Month') AS month,
			COUNT(DISTINCT b.backer_id) AS unique_backers
		FROM backing b
		GROUP BY TO_CHAR(b.created_at, 'Month')
	)

	SELECT 
		left(m.month, 3) AS month,
		COALESCE(c.unique_creators, 0) AS creators,
		COALESCE(b.unique_backers, 0) AS backers
	FROM 
		months m
	LEFT JOIN 
		creators_monthly c ON TRIM(m.month) = TRIM(c.month)
	LEFT JOIN 
		backers_monthly b ON TRIM(m.month) = TRIM(b.month)
	ORDER BY 
    m.month_num;
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	growths := []*CreatorBackerGrowth{}

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		growth := CreatorBackerGrowth{}

		err := rows.Scan(&growth.Month, &growth.Creators, &growth.Backers)
		if err != nil {
			return nil, err
		}

		growths = append(growths, &growth)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return growths, nil
}

func (m StatsModel) BackingsVSRefunds() ([]*BackingVSRefund, error) {
	query := `
	WITH months AS (
		SELECT 
			TO_CHAR(make_date(2025, m, 1), 'Month') AS month, 
			m AS month_num
		FROM generate_series(1, 12) AS m
	),
	backings_monthly AS (
		SELECT 
			TO_CHAR(created_at, 'Month') AS month,
			COUNT(backing_id) AS backings
		FROM payment
		GROUP BY TO_CHAR(created_at, 'Month')
	),
	refunds_monthly AS (
		SELECT 
			TO_CHAR(pa.created_at, 'Month') AS month,
			COUNT(pa.backing_id) AS refunds
		FROM payment pa
		WHERE pa.status = 'refunded'
		GROUP BY TO_CHAR(pa.created_at, 'Month')
	)

	SELECT 
		left(m.month, 3) AS month,
		COALESCE(b.backings, 0) AS backings,
		COALESCE(r.refunds, 0) AS refunds
	FROM 
		months m
	LEFT JOIN 
		backings_monthly b ON TRIM(m.month) = TRIM(b.month)
	LEFT JOIN 
		refunds_monthly r ON TRIM(m.month) = TRIM(r.month)
	ORDER BY 
		m.month_num;
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	datas := []*BackingVSRefund{}

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		data := BackingVSRefund{}

		err := rows.Scan(&data.Month, &data.Backings, &data.Refunds)
		if err != nil {
			return nil, err
		}

		datas = append(datas, &data)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return datas, nil
}

func (m StatsModel) CreatedBackedProjectsCount(userId int) (*ProfileStats, error) {
	backedQuery := `SELECT COUNT(b.project_id) AS backed_projects
	FROM project pr 
	INNER JOIN backing b ON pr.project_id = b.project_id 
	INNER JOIN payment pa ON pa.backing_id = b.backing_id 
	WHERE pa.status = 'succeeded' AND b.backer_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var profileStats ProfileStats

	err = tx.QueryRowContext(ctx, backedQuery, userId).Scan(&profileStats.BackedProjects)
	if err != nil {
		return nil, err
	}

	createdQuery := `SELECT COUNT(creator_id) FROM project WHERE creator_id=$1`

	err = tx.QueryRowContext(ctx, createdQuery, userId).Scan(&profileStats.CreatedProjects)
	if err != nil {
		return nil, err
	}

	return &profileStats, nil
}

func (m StatsModel) ReviewerPerformance(reviewerID int) ([]*ReviewerPerformance, error) {
	query := `
	WITH days AS (
	SELECT 0 AS dow, 'Sun' AS day UNION ALL
	SELECT 1, 'Mon' UNION ALL
	SELECT 2, 'Tue' UNION ALL
	SELECT 3, 'Wed' UNION ALL
	SELECT 4, 'Thu' UNION ALL
	SELECT 5, 'Fri' UNION ALL
	SELECT 6, 'Sat'
	)
	SELECT 
	days.day,
	COALESCE(SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END), 0) AS approved,
	COALESCE(SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END), 0) AS rejected,
	COALESCE(SUM(CASE WHEN status = 'Flagged' THEN 1 ELSE 0 END), 0) AS flagged
	FROM 
	days
	LEFT JOIN 
	project_review ON EXTRACT(DOW FROM reviewed_at) = days.dow AND reviewer_id = $1
	GROUP BY 
	days.dow, days.day
	ORDER BY 
	days.dow
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	weeklyPerformance := []*ReviewerPerformance{}

	rows, err := m.DB.QueryContext(ctx, query, reviewerID)

	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var performance ReviewerPerformance
		err := rows.Scan(&performance.Day, &performance.Approved, &performance.Rejected, &performance.Flagged)
		if err != nil {
			return nil, err
		}

		weeklyPerformance = append(weeklyPerformance, &performance)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return weeklyPerformance, nil
}

func (m StatsModel) ExpertAccuracy(reviewerID int) ([]*Accuracy, error) {
	query := `
	WITH ExpertVotes AS (
	SELECT 
		p.project_id AS id,
		p.title,
		p.experts_decision AS final_result,
		er.vote,
		er.reviewed_at,
		ROW_NUMBER() OVER (PARTITION BY er.project_id ORDER BY er.reviewed_at DESC) AS row_num
	FROM 
		expert_review er
	JOIN 
		Project p ON er.project_id = p.project_id
	WHERE 
		er.expert_id = $1
	)
	SELECT 
	id,
	title,
	vote AS expert_vote,
	final_result
	FROM 
	ExpertVotes ev
	WHERE 
	row_num = 1
	ORDER BY 
	reviewed_at DESC
	LIMIT 5
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	accuracyResult := []*Accuracy{}

	rows, err := m.DB.QueryContext(ctx, query, reviewerID)

	if err != nil {
		return nil, err
	}

	for rows.Next() {
		var acc Accuracy
		err := rows.Scan(&acc.ID, &acc.Title, &acc.Vote, &acc.FinalResult)
		if err != nil {
			return nil, err
		}

		accuracyResult = append(accuracyResult, &acc)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return accuracyResult, nil
}

func (m StatsModel) GetPendingReviews(rStats *ReviewerStats) error {
	query := `SELECT COUNT(*) as pending_reviews FROM project WHERE status = 'Draft'`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}
	rStats.PendingReviews = int(count.Int64)

	return nil
}
func (m StatsModel) GetApprovedReviews(rStats *ReviewerStats, reviewerID int) error {
	query := `SELECT COUNT(*) as approved_reviews FROM project_review WHERE status = 'Approved' AND reviewer_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query, reviewerID).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}
	rStats.ApprovedReviews = int(count.Int64)

	return nil
}
func (m StatsModel) GetRejectedReviews(rStats *ReviewerStats, reviewerID int) error {
	query := `SELECT COUNT(*) as approved_reviews FROM project_review WHERE status = 'Rejected' AND reviewer_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query, reviewerID).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}
	rStats.RejectedReviews = int(count.Int64)

	return nil
}

func (m StatsModel) GetTotalCreatedProjectsCount(stats *UserStats, creatorID int) error {
	query := `SELECT COUNT(*) OVER() FROM project WHERE creator_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query, creatorID).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}
	stats.TotalProjects = int(count.Int64)

	return nil
}

func (m StatsModel) GetTotalRaised(stats *UserStats, creatorID int) error {
	query := `SELECT SUM(current_funding)/100 FROM project WHERE creator_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullFloat64
	err := m.DB.QueryRowContext(ctx, query, creatorID).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}

	stats.TotalRaised = count.Float64

	return nil
}

func (m StatsModel) GetProjectsBacked(stats *UserStats, backerID int) error {
	query := `SELECT COUNT(*) FROM backing b INNER JOIN payment pa ON b.backing_id = pa.backing_id WHERE pa.status = 'succeeded' AND b.backer_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullInt64
	err := m.DB.QueryRowContext(ctx, query, backerID).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}

	stats.ProjectsBacked = int(count.Int64)

	return nil
}

func (m StatsModel) GetTotalBacks(stats *UserStats, backerID int) error {
	query := `SELECT SUM(pa.amount)/100 FROM backing b INNER JOIN payment pa ON b.backing_id = pa.backing_id WHERE pa.status = 'succeeded' AND b.backer_id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var count sql.NullFloat64
	err := m.DB.QueryRowContext(ctx, query, backerID).Scan(&count)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil
		}
		return err
	}

	stats.TotalBacked = count.Float64

	return nil
}

func (m StatsModel) GetFundingProgress(creatorID int) ([]*Overview, error) {
	query := `
	WITH project_months AS (
		SELECT
			to_char(deadline, 'Month') AS project_month,
			CASE
				WHEN current_funding >= funding_goal THEN 'Successful'
				WHEN current_funding < funding_goal THEN 'Failed'
				ELSE 'Other'
			END AS project_status
		FROM project
		WHERE status = 'Completed'
		AND creator_id = $1
	)

	SELECT
		left(project_month, 3),
		COUNT(*) AS total_projects,
		COUNT(CASE WHEN project_status = 'Successful' THEN 1 END) AS successful_projects,
		COUNT(CASE WHEN project_status = 'Failed' THEN 1 END) AS failed_projects
	FROM project_months
	GROUP BY project_month
	ORDER BY TO_DATE(project_month, 'Month');
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, creatorID)
	if err != nil {
		return nil, err
	}

	projectsOverview := []*Overview{}

	for rows.Next() {
		overview := &Overview{}
		var totalCount sql.NullInt64
		var successCount sql.NullInt64
		var failureCount sql.NullInt64

		err := rows.Scan(
			&overview.ProjectMonth,
			&totalCount,
			&successCount,
			&failureCount,
		)
		if err != nil {
			return nil, err
		}

		overview.TotalProjects = int(totalCount.Int64)
		overview.SuccessfulProjects = int(successCount.Int64)
		overview.FailedProjects = int(failureCount.Int64)

		projectsOverview = append(projectsOverview, overview)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projectsOverview, nil
}

func (m TablesModel) GetLiveProjectsStatistics(creatorID int) ([]*ProjectsStatistics, error) {
	query := `
	SELECT pr.title, pr.categories, pr.funding_goal, pr.current_funding, pr.deadline, count(DISTINCT b.backer_id) as backers
	FROM project pr 
	LEFT JOIN backing b on pr.project_id = b.project_id
	WHERE pr.status = 'Live' AND pr.creator_id = $1
	GROUP BY pr.project_id
	LIMIT 5
	`

	projects := []*ProjectsStatistics{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, creatorID)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		project := &ProjectsStatistics{}

		err := rows.Scan(
			&project.Title,
			&project.Categories,
			&project.FundingGoal,
			&project.CurrentFunding,
			&project.Deadline,
			&project.Backers,
		)
		if err != nil {
			return nil, err
		}

		projects = append(projects, project)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projects, nil
}

func (m TablesModel) GetBackedProjectsStatistics(backerID int) ([]*ProjectsStatistics, error) {
	query := `
	SELECT pr.title, pr.categories, pr.funding_goal, pr.current_funding, pr.deadline, pr.status, count(DISTINCT b.backer_id) as backers
	FROM project pr 
	LEFT JOIN backing b on pr.project_id = b.project_id
	WHERE b.backer_id = $1
	GROUP BY pr.project_id
	LIMIT 5
	`

	projects := []*ProjectsStatistics{}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, backerID)
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		project := &ProjectsStatistics{}

		err := rows.Scan(
			&project.Title,
			&project.Categories,
			&project.FundingGoal,
			&project.CurrentFunding,
			&project.Deadline,
			&project.Status,
			&project.Backers,
		)
		if err != nil {
			return nil, err
		}

		projects = append(projects, project)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projects, nil
}

package data

import (
	"context"
	"database/sql"
	"errors"
	"projectx/internal/validator"
	"time"
)

type Backing struct {
	BackingID int       `json:"backing_id"`
	CreatedAt time.Time `json:"created_at"`
	BackerID  int       `json:"backer_id"`
	ProjectID int       `json:"project_id"`
}

type Payment struct {
	PaymentID     int       `json:"payment_id"`
	Amount        float64   `json:"amount"`
	Status        string    `json:"status"`
	TransactionID string    `json:"transaction_id"`
	PaymentMethod string    `json:"payment_method"`
	BackingID     int       `json:"backing_id"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	Version       int       `json:"-"`
}

type Cancellation struct {
	CancellationID int       `json:"cancellation_id"`
	Reason         string    `json:"reason"`
	Date           time.Time `json:"date"`
	BackingID      int       `json:"backing_id"`
	CreatedAt      time.Time `json:"created_at"`
}

func ValidateAmount(v *validator.Validator, amount float64) {
	v.Check(amount >= 10000, "amount", "Pledge amount should be at least 100DA")
}

func ValidateReason(v *validator.Validator, reason string) {
	v.Check(validator.MaxChars(reason, 500), "reason", "Reason cannot be more than 50 characters")
}

type BackingModel struct {
	DB *sql.DB
}

func (m BackingModel) Insert(backing *Backing, payment *Payment) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO backing (backer_id, project_id) VALUES ($1, $2) RETURNING backing_id, created_at`

	args := []interface{}{
		backing.BackerID,
		backing.ProjectID,
	}

	err = tx.QueryRowContext(ctx, query, args...).Scan(&backing.BackingID, &backing.CreatedAt)

	if err != nil {
		return err
	}

	query = `INSERT INTO payment (amount, status, transaction_id, payment_method, backing_id)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING payment_id, created_at, updated_at, version`

	args = []interface{}{
		payment.Amount,
		payment.Status,
		payment.TransactionID,
		payment.PaymentMethod,
		backing.BackingID,
	}

	err = tx.QueryRowContext(ctx, query, args...).Scan(
		&payment.PaymentID,
		&payment.CreatedAt,
		&payment.UpdatedAt,
		&payment.Version,
	)

	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (m BackingModel) GetBackersCountByProject(id int) (int, error) {
	query := `SELECT COUNT(*) OVER() FROM backing b INNER JOIN payment p ON b.backing_id = p.backing_id WHERE project_id = $1 AND p.status <> 'refunded'`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var backersCount int

	err := m.DB.QueryRowContext(ctx, query, id).Scan(&backersCount)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return 0, nil
		}
		return 0, err
	}

	return backersCount, nil
}

func (m BackingModel) DidIBackProject(backerID int, projectID int) (bool, error) {
	query := `
	SELECT EXISTS (
		SELECT 1 FROM backing b INNER JOIN payment p ON b.backing_id = p.backing_id WHERE
		b.backer_id = $1 AND b.project_id = $2 AND p.status <> 'refunded'
	) AS did_i_back_it
	`

	args := []interface{}{backerID, projectID}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var didIbackIt bool

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&didIbackIt)
	if err != nil {
		return false, err
	}

	return didIbackIt, nil
}

func (m BackingModel) GetBacking(backerID int, projectID int) (*int, error) {
	checkQuery := `SELECT backing_id FROM backing WHERE backer_id = $1 AND project_id = $2 ORDER BY created_at DESC LIMIT 1`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []interface{}{
		backerID,
		projectID,
	}

	var backingID int

	err := m.DB.QueryRowContext(ctx, checkQuery, args...).Scan(&backingID)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}
	return &backingID, nil
}

func (m BackingModel) CheckBacking(backingID int) (*int, *string, error) {
	var paymentID int
	var transactionID string

	checkQuery := `SELECT payment_id, transaction_id FROM payment WHERE backing_id = $1`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, checkQuery, backingID).Scan(
		&paymentID,
		&transactionID,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, nil, ErrNoRecordFound
		default:
			return nil, nil, err
		}
	}
	return &paymentID, &transactionID, nil
}

func (m BackingModel) Refund(backingID int, reason string, paymentID int, refundDate time.Time) (*string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var createdAt string

	updateQuery := `UPDATE payment SET status = 'refunded' WHERE payment_id = $1 RETURNING created_at`
	err = tx.QueryRowContext(ctx, updateQuery, paymentID).Scan(&createdAt)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrEditConflict
		default:
			return nil, err
		}
	}

	insertQuery := `INSERT INTO cancellation (reason, date, backing_id)
	VALUES ($1, $2, $3)`

	args := []interface{}{
		reason,
		refundDate,
		backingID,
	}

	_, err = tx.ExecContext(ctx, insertQuery, args...)

	if err != nil {
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return &createdAt, nil
}

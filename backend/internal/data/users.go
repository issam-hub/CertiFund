package data

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"errors"
	"projectx/internal/validator"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        int      `json:"id"`
	Username  string   `json:"username"`
	Email     string   `json:"email"`
	Password  password `json:"-"`
	Activated bool     `json:"activated"`
	ImageUrl  string   `json:"image_url"`
	CreatedAt string   `json:"created_at"`
	Version   int      `json:"-"`
}

type password struct {
	plaintext *string
	hash      []byte
}

var (
	ErrDuplicateEmail = errors.New("duplicate email")
)

func (p *password) Set(plainTextPassword string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(plainTextPassword), 12)
	if err != nil {
		return err
	}
	p.plaintext = &plainTextPassword
	p.hash = hash
	return nil
}

func (p *password) Matches(plainTextPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword(p.hash, []byte(plainTextPassword))
	if err != nil {
		switch {
		case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword):
			return false, nil
		default:
			return false, err
		}
	}
	return true, nil
}

func ValidateEmail(v *validator.Validator, email string) {
	v.Check(email != "", "email", "Email must be provided")
	v.Check(validator.Matches(email, validator.EmailRX), "email", "Email is invalid")
}

func ValidPlainText(v *validator.Validator, plaintext *string) {
	v.Check(plaintext != nil, "password", "Password cannot be null")
	v.Check(*plaintext != "", "password", "Password must be provided")
}

func ValidateUser(v *validator.Validator, user *User) {
	// name validation
	v.Check(user.Username != "", "username", "Username must be provided")
	v.Check(validator.MaxChars(user.Username, 500), "username", "Username cannot be more than 500 characters")

	// email validation
	ValidateEmail(v, user.Email)

	// password validation
	ValidPlainText(v, user.Password.plaintext)

	v.Check(validator.InBetween(*user.Password.plaintext, 8, 72), "password", "password length should be between 8 and 72")
	if user.Password.hash == nil {
		panic("missing password hash for user")
	}
}

type UserModel struct {
	DB *sql.DB
}

func (m UserModel) Insert(user *User) error {
	query := `
	INSERT INTO user_t (username, email, password_hash, activated)
	VALUES ($1, $2, $3, $4)
	RETURNING user_id, created_at, version`

	args := []interface{}{user.Username, user.Email, user.Password.hash, user.Activated}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&user.ID, &user.CreatedAt, &user.Version)
	if err != nil {
		switch {
		case err.Error() == `pq: duplicate key value violates unique constraint "user_t_email_key"`:
			return ErrDuplicateEmail
		default:
			return err
		}
	}
	return nil
}

func (m UserModel) GetByEmail(email string) (*User, error) {
	query := `SELECT 
	user_id, username, email, password_hash, activated, image_url, created_at, version
	FROM user_t WHERE email = $1`

	var user User
	var ImgUrlVar sql.NullString

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password.hash,
		&user.Activated,
		&user.ImageUrl,
		&user.CreatedAt,
		&user.Version,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	user.ImageUrl = ImgUrlVar.String
	return &user, nil
}

func (m UserModel) GetByID(id int) (*User, error) {
	query := `SELECT 
	user_id, username, email, password_hash, activated, image_url, created_at, version
	FROM user_t WHERE user_id = $1`

	var user User
	var ImgUrlVar sql.NullString

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password.hash,
		&user.Activated,
		&ImgUrlVar,
		&user.CreatedAt,
		&user.Version,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	user.ImageUrl = ImgUrlVar.String
	return &user, nil
}

func (m UserModel) Update(user *User) error {
	query := `UPDATE user_t 
	SET username = $1, email = $2, password_hash = $3, activated = $4, image_url = $5, version = version + 1
	WHERE user_id = $6 AND version = $7
	RETURNING version`

	args := []interface{}{
		user.Username,
		user.Email,
		user.Password.hash,
		user.Activated,
		user.ImageUrl,
		user.ID,
		user.Version,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(&user.Version)
	if err != nil {
		switch {
		case err.Error() == `pq: duplicate key value violates unique constraint "users_email_key"`:
			return ErrDuplicateEmail
		case errors.Is(err, sql.ErrNoRows):
			return ErrEditConflict
		default:
			return err
		}
	}
	return nil
}

func (m UserModel) Delete(id int) error {
	if id < 1 {
		return ErrNoRecordFound
	}

	query := `DELETE FROM user_t WHERE user_id = $1`

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

func (m UserModel) GetByToken(tokenScope, tokenPlaintext string) (*User, error) {
	tokenHash := sha256.Sum256([]byte(tokenPlaintext))

	query := `
	SELECT user_t.user_id, user_t.created_at, user_t.username, user_t.email,
	user_t.password_hash, user_t.image_url, user_t.activated, user_t.version
	FROM user_t
	INNER JOIN tokens
	ON user_t.user_id = tokens.user_id
	WHERE tokens.hash = $1
	AND tokens.scope = $2
	AND tokens.expiry > $3
	`
	args := []interface{}{tokenHash[:], tokenScope, time.Now()}

	var user User
	var ImgUrlVar sql.NullString

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, args...).Scan(
		&user.ID,
		&user.CreatedAt,
		&user.Username,
		&user.Email,
		&user.Password.hash,
		&ImgUrlVar,
		&user.Activated,
		&user.Version,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	user.ImageUrl = ImgUrlVar.String
	return &user, nil
}

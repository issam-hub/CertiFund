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
	Role      string   `json:"role"`
	ImageUrl  string   `json:"image_url"`
	CreatedAt string   `json:"created_at"`
	Version   int      `json:"-"`
	Bio       string   `json:"bio"`
	Website   string   `json:"website"`
	Twitter   string   `json:"twitter"`
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
	v.Check(validator.MaxChars(user.Username, 50), "username", "Username cannot be more than 50 characters")

	// email validation
	ValidateEmail(v, user.Email)

	// password validation
	ValidPlainText(v, user.Password.plaintext)

	v.Check(validator.InBetween(*user.Password.plaintext, 8, 72), "password", "password length should be between 8 and 72")
	if user.Password.hash == nil {
		panic("missing password hash for user")
	}
}

func ValidateProfileUpdate(v *validator.Validator, user *User) {
	// name validation
	v.Check(user.Username != "", "username", "Username must be provided")
	v.Check(validator.MaxChars(user.Username, 50), "username", "Username cannot be more than 50 characters")

	ValidateEmail(v, user.Email)

	v.Check(validator.MaxChars(user.Bio, 500), "bio", "Bio cannot be more than 500 characters")

	if user.Website != "" {
		v.Check(validator.Matches(user.Website, validator.UrlRX), "website", "Website is invalid")
	}
	v.Check(validator.MaxChars(user.Twitter, 50), "twitter", "Twitter handle cannot be more than 50 characters")
}

type UserModel struct {
	DB *sql.DB
}

func (m UserModel) Insert(user *User) error {
	query := `
	INSERT INTO user_t (username, email, password_hash, activated, bio, role_id)
	VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING user_id, created_at, version`

	roleID, err := m.GetRoleIdByName(user.Role)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return ErrNoRecordFound
		default:
			return err
		}
	}

	args := []interface{}{user.Username, user.Email, user.Password.hash, user.Activated, user.Bio, roleID}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err = m.DB.QueryRowContext(ctx, query, args...).Scan(&user.ID, &user.CreatedAt, &user.Version)
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
	user_id, username, email, password_hash, activated, image_url, created_at, version, bio, website, twitter, role_id
	FROM user_t WHERE email = $1`

	var user User
	var ImgUrlVar sql.NullString
	var BioVar sql.NullString
	var WebsiteVar sql.NullString
	var TwitterVar sql.NullString
	var roleID int

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password.hash,
		&user.Activated,
		&ImgUrlVar,
		&user.CreatedAt,
		&user.Version,
		&BioVar,
		&WebsiteVar,
		&TwitterVar,
		&roleID,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	rolename, err := m.GetRoleNameByID(roleID)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	user.ImageUrl = ImgUrlVar.String
	user.Bio = BioVar.String
	user.Website = WebsiteVar.String
	user.Twitter = TwitterVar.String

	user.Role = *rolename

	return &user, nil
}

func (m UserModel) GetByID(id int) (*User, error) {
	query := `SELECT 
	user_id, username, email, password_hash, activated, image_url, created_at, version, bio, website, twitter, role_id
	FROM user_t WHERE user_id = $1`

	var user User
	var ImgUrlVar sql.NullString
	var BioVar sql.NullString
	var WebsiteVar sql.NullString
	var TwitterVar sql.NullString
	var roleID int

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
		&BioVar,
		&WebsiteVar,
		&TwitterVar,
		&roleID,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	rolename, err := m.GetRoleNameByID(roleID)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	user.ImageUrl = ImgUrlVar.String
	user.Bio = BioVar.String
	user.Website = WebsiteVar.String
	user.Twitter = TwitterVar.String

	user.Role = *rolename

	return &user, nil
}

func (m UserModel) Update(user *User) error {
	query := `UPDATE user_t 
	SET username = $1, email = $2, password_hash = $3, activated = $4, image_url = $5, version = version + 1, bio = $6, website = $7, twitter = $8, role_id = $9
	WHERE user_id = $10 AND version = $11
	RETURNING version`

	roleID, err := m.GetRoleIdByName(user.Role)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return ErrNoRecordFound
		default:
			return err
		}
	}

	args := []interface{}{
		user.Username,
		user.Email,
		user.Password.hash,
		user.Activated,
		user.ImageUrl,
		user.Bio,
		user.Website,
		user.Twitter,
		roleID,
		user.ID,
		user.Version,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err = m.DB.QueryRowContext(ctx, query, args...).Scan(&user.Version)
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
	user_t.password_hash, user_t.image_url, user_t.activated, user_t.version, user_t.bio, user_t.website, user_t.twitter, user_t.role_id
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
	var BioVar sql.NullString
	var WebsiteVar sql.NullString
	var TwitterVar sql.NullString
	var roleID int

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
		&BioVar,
		&WebsiteVar,
		&TwitterVar,
		&roleID,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	rolename, err := m.GetRoleNameByID(roleID)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}

	user.ImageUrl = ImgUrlVar.String
	user.Bio = BioVar.String
	user.Website = WebsiteVar.String
	user.Twitter = TwitterVar.String

	user.Role = *rolename

	return &user, nil
}

func (m UserModel) Logout(userID int) error {
	if userID < 1 {
		return ErrNoRecordFound
	}
	query := `
	DELETE FROM tokens WHERE user_id = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := m.DB.ExecContext(ctx, query, userID)
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

func (m UserModel) GetRoleIdByName(rolename string) (*int, error) {
	query := `
	SELECT role_id FROM role_t WHERE rolename = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var roleID int

	err := m.DB.QueryRowContext(ctx, query, rolename).Scan(&roleID)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}
	return &roleID, nil
}

func (m UserModel) GetRoleNameByID(roleID int) (*string, error) {
	query := `
	SELECT rolename FROM role_t WHERE role_id = $1
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var rolename string

	err := m.DB.QueryRowContext(ctx, query, roleID).Scan(&rolename)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNoRecordFound
		default:
			return nil, err
		}
	}
	return &rolename, nil
}

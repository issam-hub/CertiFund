package data

import (
	"context"
	"database/sql"
	"projectx/internal/validator"
	"time"
)

type Comment struct {
	ID              int    `json:"id"`
	Content         string `json:"content"`
	UserID          int    `json:"-"`
	ProjectID       int    `json:"project_id"`
	ParentCommentID int    `json:"-"`
	Path            string `json:"path,omitempty"`
	CreatedAt       string `json:"created_at"`
	UpdatedAt       string `json:"-"`
	Version         int    `json:"-"`
	Username        string `json:"username"`
	ImageURL        string `json:"image_url"`
}

func ValidateCommentContent(v *validator.Validator, content string) {
	v.Check(content != "", "content", "Content must be provided")
	v.Check(validator.MaxChars(content, 1000), "content", "Content cannot be more than 1000 characters")
}

type CommentsModel struct {
	DB *sql.DB
}

func (m CommentsModel) Insert(comment *Comment) error {
	var query string
	var args []interface{}

	if comment.ParentCommentID == 0 {
		query = `
			INSERT INTO project_comment (content, user_id, project_id, parent_comment_id)
			VALUES ($1, $2, $3, NULL)
			RETURNING comment_id, created_at, updated_at, version`

		args = []interface{}{
			comment.Content,
			comment.UserID,
			comment.ProjectID,
		}
	} else {
		query = `
			INSERT INTO project_comment (content, user_id, project_id, parent_comment_id)
			VALUES ($1, $2, $3, $4)
			RETURNING comment_id, created_at, updated_at, version`

		args = []interface{}{
			comment.Content,
			comment.UserID,
			comment.ProjectID,
			comment.ParentCommentID,
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result := m.DB.QueryRowContext(ctx, query, args...).Scan(
		&comment.ID,
		&comment.CreatedAt,
		&comment.UpdatedAt,
		&comment.Version,
	)

	userQuery := `SELECT username, image_url FROM user_t WHERE user_id = $1`

	ctx2, cancel2 := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel2()

	err := m.DB.QueryRowContext(ctx2, userQuery, comment.UserID).Scan(
		&comment.Username,
		&comment.ImageURL,
	)
	if err != nil {
		return err
	}

	return result
}

func (m CommentsModel) GetAll(projectID int) ([]*Comment, error) {
	query := `
		WITH RECURSIVE CommentHierarchy AS (
	SELECT 
		comment_id,
		content,
		user_id,
		project_id,
		created_at,
		CAST(comment_id AS TEXT) AS path
	FROM 
		project_comment
	WHERE 
		parent_comment_id IS NULL
	AND
		project_id = $1
	
	UNION ALL
	
	SELECT 
		c.comment_id,
		c.content,
		c.user_id,
		c.project_id,
		c.created_at,
		CONCAT(ch.path, ',', CAST(c.comment_id AS TEXT)) AS path
	FROM 
		project_comment c
	JOIN 
		CommentHierarchy ch ON c.parent_comment_id = ch.comment_id
	)
	SELECT 
	ch.comment_id,
	ch.content,
	ch.user_id,
	ch.project_id,
	ch.created_at,
	ch.path,
	u.username,
	u.image_url
	FROM 
	CommentHierarchy ch
	INNER JOIN
	user_t u ON ch.user_id = u.user_id
	ORDER BY 
	ch.path
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, projectID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := []*Comment{}
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.ID, &comment.Content, &comment.UserID, &comment.ProjectID, &comment.CreatedAt, &comment.Path, &comment.Username, &comment.ImageURL)
		if err != nil {
			return nil, err
		}
		comments = append(comments, &comment)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return comments, nil
}

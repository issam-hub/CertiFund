package data

import (
	"database/sql"
	"errors"
)

var (
	ErrNoRecordFound = errors.New("record not found")
	ErrEditConflict  = errors.New("edit conflict")
)

type Models struct {
	Projects ProjectModel
}

func NewModels(db *sql.DB) Models {
	return Models{
		Projects: ProjectModel{DB: db},
	}
}

package data

import (
	"database/sql"
	"errors"
)

var (
	ErrNoRecordFound   = errors.New("record not found")
	ErrEditConflict    = errors.New("edit conflict")
	ErrFailedOpening   = errors.New("failed to open file")
	ErrFailedUploading = errors.New("failed to upload the image")
)

type Models struct {
	Projects    ProjectModel
	Users       UserModel
	Permissions PermissionModel
	Tokens      TokenModel
	Backing     BackingModel
	Rewards     RewardModel
	Updates     UpdateModel
	Comments    CommentsModel
	Stats       StatsModel
	Tables      TablesModel
	Disputes    DisputeModel
}

func NewModels(db *sql.DB) Models {
	return Models{
		Projects:    ProjectModel{DB: db},
		Users:       UserModel{DB: db},
		Permissions: PermissionModel{DB: db},
		Tokens:      TokenModel{DB: db},
		Backing:     BackingModel{DB: db},
		Rewards:     RewardModel{DB: db},
		Updates:     UpdateModel{DB: db},
		Comments:    CommentsModel{DB: db},
		Stats:       StatsModel{DB: db},
		Tables:      TablesModel{DB: db},
		Disputes:    DisputeModel{DB: db},
	}
}

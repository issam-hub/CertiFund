package data

import (
	"database/sql"
	"errors"
)

var (
	ErrNoRecordFound    = errors.New("record not found")
	ErrEditConflict     = errors.New("edit conflict")
	ErrFailedOpening    = errors.New("failed to open file")
	ErrFailedUploading  = errors.New("failed to upload the image")
	ErrActionsForbidden = errors.New("You don't have the permission to perform this action")
	ErrVotedTwice       = errors.New("You have already voted for this project")
)

var SupportedCategories = []string{"technology", "art", "music", "games", "film & video", "publishing & writing", "design", "food & craft", "social good", "miscellaneous"}

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
	Feedback    FeedbackModel
	Experts     ExpertsModel
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
		Feedback:    FeedbackModel{DB: db},
		Experts:     ExpertsModel{DB: db},
	}
}

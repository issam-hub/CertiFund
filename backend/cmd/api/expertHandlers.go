package main

import (
	"errors"
	"net/http"
	"projectx/internal/data"
	"projectx/internal/validator"

	"github.com/labstack/echo/v4"
)

func (app *application) CreateExpertHandler(c echo.Context) error {
	var input struct {
		Username        string   `json:"username"`
		Email           string   `json:"email"`
		Password        string   `json:"password"`
		Role            string   `json:"role"`
		ExpertiseFields []string `json:"expertise_fields"`
		ExpertiseLevel  float64  `json:"expertise_level"`
		Qualification   string   `json:"qualification"`
		IsActive        bool     `json:"is_active"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user := &data.User{
		Username:  input.Username,
		Email:     input.Email,
		Activated: true,
		Role:      input.Role,
	}

	err := user.Password.Set(input.Password)
	if err != nil {
		return err
	}

	v := validator.New()

	if data.ValidateUser(v, user); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	err = app.models.Users.Insert(user)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrDuplicateEmail):
			v.AddError("email", "Email address already exists")
			return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
		default:
			return err
		}
	}

	expert := &data.Expert{
		UserID:          user.ID,
		ExpertiseFields: input.ExpertiseFields,
		ExpertiseLevel:  input.ExpertiseLevel,
		Qualification:   input.Qualification,
		IsActive:        input.IsActive,
	}

	if data.ValidateExpert(v, expert); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	err = app.models.Experts.Insert(expert)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Expert created successfully",
		"expert":  expert,
	})
}

func (app *application) assessProjectHandler(c echo.Context) error {
	user := c.Get("user").(*data.User)

	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	_, err = app.models.Projects.Get(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Project not found")
		default:
			return err
		}
	}

	expert, err := app.models.Experts.GetByUserID(user.ID)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Expert not found")
		default:
			return err
		}
	}

	var input struct {
		Vote    data.Vote `json:"vote"`
		Comment string    `json:"comment"`
	}
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	review := &data.ExpertReview{
		Vote:      input.Vote,
		Comment:   input.Comment,
		ProjectID: id,
		ExpertID:  expert.ID,
	}

	v := validator.New()

	if data.ValidateExpertReview(v, review); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	err = app.models.Experts.Assess(review)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrVotedTwice):
			return echo.NewHTTPError(http.StatusConflict, data.ErrVotedTwice.Error())
		default:
			return err
		}
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Project assessed successfully",
		"review":  review,
	})
}

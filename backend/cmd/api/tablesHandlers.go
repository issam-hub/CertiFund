package main

import (
	"errors"
	"fmt"
	"net/http"
	"projectx/internal/data"
	"projectx/internal/validator"

	"github.com/labstack/echo/v4"
)

func (app *application) getProjectsTableHandler(c echo.Context) error {
	var input struct {
		Page     int `json:"page"`
		PageSize int `json:"page_size"`
	}

	v := validator.New()

	input.Page = app.readInt(c.QueryParams(), "page", 1, v)
	input.PageSize = app.readInt(c.QueryParams(), "page_size", 5, v)

	v.Check(input.Page >= 1 && input.PageSize <= 10_000_000, "page", "page must be between 1 and 10000000")
	v.Check(input.PageSize >= 1 && input.PageSize <= 100, "page_size", "page size must be between 1 and 100")

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	table, metadata, err := app.models.Tables.GetProjects(input.Page, input.PageSize)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "Projects table retrieved successfully",
		"table":    table,
		"metadata": metadata,
	})
}

func (app *application) getPendingProjectsTableHandler(c echo.Context) error {
	var input struct {
		Page     int `json:"page"`
		PageSize int `json:"page_size"`
	}

	v := validator.New()

	input.Page = app.readInt(c.QueryParams(), "page", 1, v)
	input.PageSize = app.readInt(c.QueryParams(), "page_size", 5, v)

	v.Check(input.Page >= 1 && input.PageSize <= 10_000_000, "page", "page must be between 1 and 10000000")
	v.Check(input.PageSize >= 1 && input.PageSize <= 100, "page_size", "page size must be between 1 and 100")

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	table, metadata, err := app.models.Tables.GetPendingProjects(input.Page, input.PageSize)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "Projects table retrieved successfully",
		"table":    table,
		"metadata": metadata,
	})
}
func (app *application) getPendingAssessementProjectsTableHandler(c echo.Context) error {
	var input struct {
		Page     int `json:"page"`
		PageSize int `json:"page_size"`
	}

	v := validator.New()

	user := c.Get("user").(*data.User)

	expert, err := app.models.Experts.GetByUserID(user.ID)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "User not found")
		default:
			return err
		}
	}

	fmt.Println(expert)

	input.Page = app.readInt(c.QueryParams(), "page", 1, v)
	input.PageSize = app.readInt(c.QueryParams(), "page_size", 5, v)

	v.Check(input.Page >= 1 && input.PageSize <= 10_000_000, "page", "page must be between 1 and 10000000")
	v.Check(input.PageSize >= 1 && input.PageSize <= 100, "page_size", "page size must be between 1 and 100")

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	table, metadata, err := app.models.Tables.GetPendingAssessementProjects(expert.ExpertiseFields, expert.ID, input.Page, input.PageSize)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "Projects table retrieved successfully",
		"table":    table,
		"metadata": metadata,
	})
}

func (app *application) getAssessedProjectsTableHandler(c echo.Context) error {
	var input struct {
		Page     int `json:"page"`
		PageSize int `json:"page_size"`
	}

	v := validator.New()

	user := c.Get("user").(*data.User)

	expert, err := app.models.Experts.GetByUserID(user.ID)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "User not found")
		default:
			return err
		}
	}

	input.Page = app.readInt(c.QueryParams(), "page", 1, v)
	input.PageSize = app.readInt(c.QueryParams(), "page_size", 5, v)

	v.Check(input.Page >= 1 && input.PageSize <= 10_000_000, "page", "page must be between 1 and 10000000")
	v.Check(input.PageSize >= 1 && input.PageSize <= 100, "page_size", "page size must be between 1 and 100")

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	table, metadata, err := app.models.Tables.GetAssessedProjects(expert.ExpertiseFields, expert.ID, input.Page, input.PageSize)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "Projects table retrieved successfully",
		"table":    table,
		"metadata": metadata,
	})
}

func (app *application) getUsersTableHandler(c echo.Context) error {
	var input struct {
		Page     int `json:"page"`
		PageSize int `json:"page_size"`
	}

	v := validator.New()

	input.Page = app.readInt(c.QueryParams(), "page", 1, v)
	input.PageSize = app.readInt(c.QueryParams(), "page_size", 5, v)

	v.Check(input.Page >= 1 && input.PageSize <= 10_000_000, "page", "page must be between 1 and 10000000")
	v.Check(input.PageSize >= 1 && input.PageSize <= 100, "page_size", "page size must be between 1 and 100")

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	table, metadata, err := app.models.Tables.GetUsers(input.Page, input.PageSize)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "Users table retrieved successfully",
		"table":    table,
		"metadata": metadata,
	})
}

func (app *application) getBackingsTableHandler(c echo.Context) error {
	var input struct {
		Page     int `json:"page"`
		PageSize int `json:"page_size"`
	}

	v := validator.New()

	input.Page = app.readInt(c.QueryParams(), "page", 1, v)
	input.PageSize = app.readInt(c.QueryParams(), "page_size", 5, v)

	v.Check(input.Page >= 1 && input.PageSize <= 10_000_000, "page", "page must be between 1 and 10000000")
	v.Check(input.PageSize >= 1 && input.PageSize <= 100, "page_size", "page size must be between 1 and 100")

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	table, metadata, err := app.models.Tables.GetBackings(input.Page, input.PageSize)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "Backings table retrieved successfully",
		"table":    table,
		"metadata": metadata,
	})
}

func (app *application) getDisputesTableHandler(c echo.Context) error {
	var input struct {
		Page     int `json:"page"`
		PageSize int `json:"page_size"`
	}

	v := validator.New()

	input.Page = app.readInt(c.QueryParams(), "page", 1, v)
	input.PageSize = app.readInt(c.QueryParams(), "page_size", 5, v)

	v.Check(input.Page >= 1 && input.PageSize <= 10_000_000, "page", "page must be between 1 and 10000000")
	v.Check(input.PageSize >= 1 && input.PageSize <= 100, "page_size", "page size must be between 1 and 100")

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	table, metadata, err := app.models.Tables.GetDisputes(input.Page, input.PageSize)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "Backings table retrieved successfully",
		"table":    table,
		"metadata": metadata,
	})
}

func (app *application) getProjectsByReviewerHandler(c echo.Context) error {
	var input struct {
		Page     int `json:"page"`
		PageSize int `json:"page_size"`
	}

	v := validator.New()

	input.Page = app.readInt(c.QueryParams(), "page", 1, v)
	input.PageSize = app.readInt(c.QueryParams(), "page_size", 5, v)

	v.Check(input.Page >= 1 && input.PageSize <= 10_000_000, "page", "page must be between 1 and 10000000")
	v.Check(input.PageSize >= 1 && input.PageSize <= 100, "page_size", "page size must be between 1 and 100")

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	reviewer := c.Get("user").(*data.User)

	projects, metadata, err := app.models.Projects.GetAllByReviewer(reviewer.ID, input.Page, input.PageSize)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "projects returned successfully",
		"table":    projects,
		"metadata": metadata,
	})
}

func (app *application) getFlaggedProjectsByReviewerHandler(c echo.Context) error {
	var input struct {
		Page     int `json:"page"`
		PageSize int `json:"page_size"`
	}

	v := validator.New()

	input.Page = app.readInt(c.QueryParams(), "page", 1, v)
	input.PageSize = app.readInt(c.QueryParams(), "page_size", 5, v)

	v.Check(input.Page >= 1 && input.PageSize <= 10_000_000, "page", "page must be between 1 and 10000000")
	v.Check(input.PageSize >= 1 && input.PageSize <= 100, "page_size", "page size must be between 1 and 100")

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	reviewer := c.Get("user").(*data.User)

	projects, metadata, err := app.models.Projects.GetAllFlaggedByReviewer(reviewer.ID, input.Page, input.PageSize)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "projects returned successfully",
		"table":    projects,
		"metadata": metadata,
	})
}

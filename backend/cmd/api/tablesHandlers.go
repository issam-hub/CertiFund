package main

import (
	"net/http"
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

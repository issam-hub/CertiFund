package main

import (
	"errors"
	"fmt"
	"net/http"
	"projectx/internal/data"
	"projectx/internal/validator"
	"time"

	"github.com/labstack/echo/v4"
)

func (app *application) createProjectHandler(c echo.Context) error {
	var input struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		FundingGoal float64   `json:"funding_goal"`
		Deadline    time.Time `json:"deadline"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	project := &data.Project{
		Title:       input.Title,
		Description: input.Description,
		FundingGoal: input.FundingGoal,
		Deadline:    input.Deadline,
	}

	v := validator.New()

	if data.ValidateProject(v, project); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	err := app.models.Projects.Insert(project)
	if err != nil {
		return err
	}

	c.Response().Header().Set("Location", fmt.Sprintf("/v1/projects/%d", project.ID))

	return c.JSON(http.StatusCreated, envelope{
		"message": "Project created successfully",
		"project": project,
	})
}

func (app *application) getProjectHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	project, err := app.models.Projects.Get(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Project not found")
		default:
			return err
		}
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Project returned successfully",
		"project": project,
	})
}

func (app *application) updateProjectHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	project, err := app.models.Projects.Get(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Project not found")
		default:
			return err
		}
	}

	var input struct {
		Title       *string    `json:"title"`
		Description *string    `json:"description"`
		FundingGoal *float64   `json:"funding_goal"`
		Deadline    *time.Time `json:"deadline"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if input.Title != nil {
		project.Title = *input.Title
	}
	if input.Description != nil {
		project.Description = *input.Description
	}
	if input.Deadline != nil {
		project.Deadline = *input.Deadline
	}
	if input.FundingGoal != nil {
		project.FundingGoal = *input.FundingGoal
	}

	v := validator.New()

	if data.ValidateProject(v, project); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	err = app.models.Projects.Update(project)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrEditConflict):
			return echo.NewHTTPError(http.StatusConflict, data.ErrEditConflict.Error())
		default:
			return err
		}
	}

	c.Response().Header().Set("Location", fmt.Sprintf("/v1/projects/%d", project.ID))

	return c.JSON(http.StatusCreated, envelope{
		"message": "Project updated successfully",
		"project": project,
	})
}

func (app *application) deleteProjectHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	err = app.models.Projects.Delete(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, data.ErrNoRecordFound.Error())
		default:
			return err
		}
	}

	return c.JSON(http.StatusOK, envelope{"message": "Project deleted successfully"})
}

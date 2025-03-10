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
		Categories  []string  `json:"categories"`
		Deadline    time.Time `json:"deadline"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	user := c.Get("user").(*data.User)

	_, err := app.models.Users.GetByID(user.ID)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "User not found")
		default:
			return err
		}
	}

	project := &data.Project{
		Title:       input.Title,
		Description: input.Description,
		FundingGoal: input.FundingGoal,
		Deadline:    input.Deadline,
		Categories:  input.Categories,
		CreatorID:   user.ID,
	}

	v := validator.New()

	if data.ValidateProject(v, project); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	err = app.models.Projects.Insert(project)
	if err != nil {
		return err
	}

	c.Response().Header().Set("Location", fmt.Sprintf("/v1/projects/%d", project.ID))

	return c.JSON(http.StatusCreated, envelope{
		"message": "Project created successfully",
		"project": project,
	})
}

func (app *application) getProjectsHandler(c echo.Context) error {
	var input struct {
		Title      string
		Categories []string
		data.Filter
	}

	v := validator.New()

	input.Title = c.QueryParam("title")
	input.Categories = app.readCSV(c.QueryParams(), "categories", []string{})
	input.Page = app.readInt(c.QueryParams(), "page", 1, v)
	input.PageSize = app.readInt(c.QueryParams(), "page_size", 5, v)
	input.Sort = app.readString(c.QueryParams(), "sort", "project_id")
	input.SortSafeList = []string{"project_id", "title", "deadline", "funding_goal", "created_at", "-project_id", "-title", "-deadline", "-funding_goal", "-created_at", "-(current_funding*100)/funding_goal"}

	if data.ValidateFilters(v, &input.Filter); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	projects, metaData, err := app.models.Projects.GetAll(input.Title, input.Categories, input.Filter)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "Projects returned successfully",
		"metadata": metaData,
		"projects": projects,
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
		Title          *string    `json:"title,omitempty"`
		Description    *string    `json:"description,omitempty"`
		FundingGoal    *float64   `json:"funding_goal,omitempty"`
		Categories     []string   `json:"categories,omitempty"`
		CurrentFunding *float64   `json:"current_funding,omitempty"`
		Deadline       *time.Time `json:"deadline,omitempty"`
		ProjectImg     *string    `json:"project_img,omitempty"`
		Status         *string    `json:"status,omitempty"`
		Campaign       *string    `json:"campaign,omitempty"`
	}

	if err := c.Bind(&input); err != nil {
		app.logger.Error(err.Error())
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	user := c.Get("user").(*data.User)

	_, err = app.models.Users.GetByID(user.ID)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "User not found")
		default:
			return err
		}
	}

	v := validator.New()

	if input.Title != nil {
		project.Title = *input.Title
	}
	if input.Description != nil {
		project.Description = *input.Description
	}
	if input.Categories != nil {
		project.Categories = input.Categories
	}
	if input.Deadline != nil {
		project.Deadline = *input.Deadline
	}
	if input.FundingGoal != nil {
		project.FundingGoal = *input.FundingGoal
	}
	if input.CurrentFunding != nil {
		project.CurrentFunding = *input.CurrentFunding
	}
	if input.Status != nil {
		project.Status = *input.Status
	}
	if input.Campaign != nil {
		project.Campaign = *input.Campaign
	}
	if input.ProjectImg != nil {
		project.ProjectImg = *input.ProjectImg
	}

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

func (app *application) getProjectsByCreatorHandler(c echo.Context) error {
	user := c.Get("user").(*data.User)

	_, err := app.models.Users.GetByID(user.ID)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "User not found")
		default:
			return err
		}
	}

	projects, err := app.models.Projects.GetAllByCreator(user.ID)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "projects returned successfully",
		"projects": projects,
	})

}

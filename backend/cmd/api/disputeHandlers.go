package main

import (
	"errors"
	"net/http"
	"projectx/internal/data"
	"projectx/internal/validator"

	"github.com/labstack/echo/v4"
)

func (app *application) createDisputeHandler(c echo.Context) error {
	user := c.Get("user").(*data.User)

	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	var input struct {
		Type        string   `json:"type"`
		Description string   `json:"description"`
		Context     string   `json:"context"`
		Evidences   []string `json:"evidences"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	if input.Context == "project" {
		_, err = app.models.Projects.Get(id)
		if err != nil {
			switch {
			case errors.Is(err, data.ErrNoRecordFound):
				return echo.NewHTTPError(http.StatusNotFound, "Project not found")
			default:
				return err
			}
		}
	}

	v := validator.New()

	dispute := &data.Dispute{
		Status:             "pending",
		Description:        input.Description,
		Type:               input.Type,
		Context:            input.Context,
		Evidences:          input.Evidences,
		ReporterID:         user.ID,
		ReportedResourceID: id,
	}

	if data.ValidateDispute(v, dispute); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	err = app.models.Disputes.Insert(*dispute)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Dispute created successfully",
		"dispute": dispute,
	})
}

func (app *application) deleteDisputeHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	dispute, err := app.models.Disputes.Get(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Dispute not found")
		default:
			return err
		}
	}

	err = app.models.Disputes.Delete(dispute.ID)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Dispute deleted successfully",
	})
}

func (app *application) updateDisputeHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	dispute, err := app.models.Disputes.Get(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Dispute not found")
		default:
			return err
		}
	}

	var input struct {
		Status string `json:"status"`
		Note   string `json:"note"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	v := validator.New()
	v.Check(input.Status == "resolved" || input.Status == "rejected", "status", "Status should be either resolved or rejected")
	v.Check(validator.InBetween(input.Note, 10, 500), "note", "Note must be between 10 and 500 characters long")
	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	dispute.Status = input.Status

	err = app.models.Disputes.Update(dispute, input.Note)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrEditConflict):
			return echo.NewHTTPError(http.StatusConflict, data.ErrEditConflict.Error())
		default:
			return err
		}
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Dispute updated successfully",
		"dispute": dispute,
	})
}

package main

import (
	"errors"
	"net/http"
	"projectx/internal/data"

	"github.com/labstack/echo/v4"
)

func (app *application) createCommentHandler(c echo.Context) error {
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

	user := c.Get("user").(*data.User)

	var input struct {
		Content         string `json:"content"`
		ParentCommentID int    `json:"parent_comment_id"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	comment := data.Comment{
		Content:         input.Content,
		UserID:          user.ID,
		ProjectID:       id,
		ParentCommentID: input.ParentCommentID,
	}

	err = app.models.Comments.Insert(&comment)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Comment created successfully",
		"comment": comment,
	})
}

func (app *application) getAllCommentsHandler(c echo.Context) error {
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

	comments, err := app.models.Comments.GetAll(id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "comments returned successfully",
		"comments": comments,
	})
}

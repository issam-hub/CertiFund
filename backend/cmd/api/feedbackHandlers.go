package main

import (
	"errors"
	"net/http"
	"projectx/internal/data"

	"github.com/labstack/echo/v4"
)

func (app *application) LikeProjectHandler(c echo.Context) error {
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

	err = app.models.Feedback.InsertLike(user.ID, id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Project got liked successfully",
	})
}

func (app *application) unlikeProjectHandler(c echo.Context) error {
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

	err = app.models.Feedback.Unlike(user.ID, id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Project got unliked successfully",
	})
}

func (app *application) SaveProjectHandler(c echo.Context) error {
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

	err = app.models.Feedback.InsertSave(user.ID, id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Project got saved successfully",
	})
}

func (app *application) getLikesHandler(c echo.Context) error {
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

	count, err := app.models.Feedback.GetLikes(id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Project got saved successfully",
		"likes":   count,
	})
}

func (app *application) didILikeThisHandler(c echo.Context) error {
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

	didI, err := app.models.Feedback.DidILikeThis(user.ID, id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Did you like this project ?",
		"did_i":   didI,
	})
}

func (app *application) unsaveProjectHandler(c echo.Context) error {
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

	err = app.models.Feedback.Unsave(user.ID, id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Project got unsaved successfully",
	})
}

func (app *application) didISaveThisHandler(c echo.Context) error {
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

	didI, err := app.models.Feedback.DidISaveThis(user.ID, id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Did you save this project ?",
		"did_i":   didI,
	})
}

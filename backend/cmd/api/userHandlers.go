package main

import (
	"errors"
	"log"
	"net/http"
	"os"
	"projectx/internal/data"
	"projectx/internal/validator"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
)

func (app *application) registerUserHandler(c echo.Context) error {
	var input struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user := &data.User{
		Username:  input.Username,
		Email:     input.Email,
		Activated: false,
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

	token, err := app.models.Tokens.New(user.ID, 2*24*time.Hour, data.ScopeActivation)
	if err != nil {
		return err
	}

	envErr := godotenv.Load()
	if envErr != nil {
		log.Fatal("Error loading .env file")
	}

	app.background(func() {
		data := map[string]interface{}{
			"ActivationToken": token.PlainText,
			"Username":        user.Username,
			"Port":            os.Getenv("PORT"),
		}
		err = app.mailer.Send(user.Email, "user_welcome.tmpl", data)
		if err != nil {
			c.Logger().Error(err)
		}
	})

	return c.JSON(http.StatusCreated, envelope{
		"message": "User created successfully",
		"user":    user,
	})
}

func (app *application) deleteUserHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	err = app.models.Users.Delete(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, data.ErrNoRecordFound.Error())
		default:
			return err
		}
	}

	return c.JSON(http.StatusOK, envelope{"message": "User deleted successfully"})
}

func (app *application) activateUserHandler(c echo.Context) error {
	var input struct {
		Token string `query:"token"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	v := validator.New()

	if data.ValidateTokenPlainText(v, input.Token); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	user, err := app.models.Users.GetByToken(data.ScopeActivation, input.Token)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			v.AddError("token", "invalid or expired activation token")
			return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
		default:
			return err
		}
	}

	user.Activated = true

	err = app.models.Users.Update(user)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrEditConflict):
			return echo.NewHTTPError(http.StatusConflict, data.ErrEditConflict.Error())
		default:
			return err
		}
	}

	err = app.models.Tokens.DeleteAllForUser(data.ScopeActivation, user.ID)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, envelope{
		"message": "User activated successfully",
		"user":    user,
	})
}

func (app *application) getUserHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	user, err := app.models.Users.GetByID(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "User not found")
		default:
			return err
		}
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "User returned successfully",
		"user":    user,
	})
}

func (app *application) loginUserHandler(c echo.Context) error {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	v := validator.New()

	data.ValidateEmail(v, input.Email)
	data.ValidPlainText(v, &input.Password)

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	user, err := app.models.Users.GetByEmail(input.Email)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid authentication credentials")
		default:
			return err
		}
	}

	match, err := user.Password.Matches(input.Password)
	if err != nil {
		return err
	}

	if !match {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid authentication credentials")
	}

	token, err := app.models.Tokens.New(user.ID, 24*time.Hour, data.ScopeAuth)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message":    "Authentication token created successfully",
		"auth_token": token,
	})
}

package main

import (
	"errors"
	"net/http"
	"projectx/internal/data"
	"projectx/internal/validator"
	"time"

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
		Role:      "user",
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

	app.background(func() {
		data := map[string]interface{}{
			"ActivationToken": token.PlainText,
			"Username":        user.Username,
			"UserID":          user.ID,
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

func (app *application) createUserHandler(c echo.Context) error {
	var input struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	user := &data.User{
		Username:  input.Username,
		Email:     input.Email,
		Activated: false,
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

	token, err := app.models.Tokens.New(user.ID, 2*24*time.Hour, data.ScopeActivation)
	if err != nil {
		return err
	}

	app.background(func() {
		data := map[string]interface{}{
			"ActivationToken": token.PlainText,
			"Username":        user.Username,
			"UserID":          user.ID,
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

	token, err := app.models.Tokens.New(user.ID, 7*24*time.Hour, data.ScopeAuth)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":    "User activated successfully",
		"user":       user,
		"auth_token": token,
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
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid authentication credentials")
		default:
			return err
		}
	}

	match, err := user.Password.Matches(input.Password)
	if err != nil {
		return err
	}

	if !match {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid authentication credentials")
	}

	token, err := app.models.Tokens.New(user.ID, 7*24*time.Hour, data.ScopeAuth)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message":    "User logged in successfully",
		"auth_token": token,
		"user":       user,
	})
}

func (app *application) logoutUserHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	err = app.models.Users.Logout(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, data.ErrNoRecordFound.Error())
		default:
			return err
		}
	}

	return c.JSON(http.StatusOK, envelope{"message": "User logged out successfully"})
}

func (app *application) resendActivationTokenHandler(c echo.Context) error {
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

	if user.Activated == true {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, errors.New("User already activated"))
	}

	token, err := app.models.Tokens.New(user.ID, 2*24*time.Hour, data.ScopeActivation)
	if err != nil {
		return err
	}

	app.background(func() {
		data := map[string]interface{}{
			"ActivationToken": token.PlainText,
			"Username":        user.Username,
			"UserID":          user.ID,
		}
		err = app.mailer.Send(user.Email, "user_welcome.tmpl", data)
		if err != nil {
			c.Logger().Error(err)
		}
	})

	return c.JSON(http.StatusOK, envelope{"message": "Activation token resent successfully"})
}

func (app *application) whoAmIHandler(c echo.Context) error {
	user := c.Get("user").(*data.User)
	if user == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "You must be autenticated to access this resource")
	}
	return c.JSON(http.StatusOK, envelope{
		"message": "Your identity is revealed successfully",
		"user":    user,
	})
}

func (app *application) updateProfileHandler(c echo.Context) error {
	user := c.Get("user").(*data.User)

	var input struct {
		Username *string `json:"username,omitempty"`
		Email    *string `json:"email,omitempty"`
		ImageUrl *string `json:"image_url,omitempty"`
		Bio      *string `json:"bio,omitempty"`
		Website  *string `json:"website,omitempty"`
		Twitter  *string `json:"twitter,omitempty"`
	}

	if err := c.Bind(&input); err != nil {
		app.logger.Error(err.Error())
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	v := validator.New()

	if input.Username != nil {
		user.Username = *input.Username
	}
	if input.Email != nil {
		user.Email = *input.Email
	}
	if input.ImageUrl != nil {
		user.ImageUrl = *input.ImageUrl
	}
	if input.Bio != nil {
		user.Bio = *input.Bio
	}
	if input.Website != nil {
		user.Website = *input.Website
	}
	if input.Twitter != nil {
		user.Twitter = *input.Twitter
	}

	if data.ValidateProfileUpdate(v, user); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	err := app.models.Users.Update(user)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrDuplicateEmail):
			v.AddError("email", "Email address already exists")
			return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
		case errors.Is(err, data.ErrEditConflict):
			return echo.NewHTTPError(http.StatusConflict, data.ErrEditConflict.Error())
		default:
			return err
		}
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Profile updated successfully",
		"user":    user,
	})
}

func (app *application) changePasswordHandler(c echo.Context) error {
	user := c.Get("user").(*data.User)

	var input struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	match, err := user.Password.Matches(input.OldPassword)
	if err != nil {
		return err
	}

	if !match {
		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid authentication credentials")
	}

	v := validator.New()

	if data.ValidPlainText(v, &input.OldPassword); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	err = user.Password.Set(input.NewPassword)
	if err != nil {
		return err
	}

	err = app.models.Users.Update(user)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrEditConflict):
			return echo.NewHTTPError(http.StatusConflict, data.ErrEditConflict.Error())
		default:
			return err
		}
	}

	return c.JSON(http.StatusCreated, envelope{"message": "Password updated successfully"})
}

func (app *application) deleteAccountHandler(c echo.Context) error {
	user := c.Get("user").(*data.User)

	err := app.models.Users.Delete(user.ID)
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

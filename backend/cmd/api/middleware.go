package main

import (
	"errors"
	"net/http"
	"projectx/internal/data"
	"projectx/internal/validator"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
)

func (app *application) CustomRecover() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			defer func() interface{} {
				if err := recover(); err != nil {
					c.Response().Header().Set("Connection", "close")
					return err
				}
				app.logger.Info("completing background tasks...")
				app.wg.Wait()
				return nil
			}()
			return next(c)
		}
	}
}

func (app *application) Authenticate() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Add("Vary", "Authorization")
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "Missing authentication token")
			}
			headerParts := strings.Split(authHeader, " ")
			if len(headerParts) != 2 || headerParts[0] != "Bearer" {
				c.Response().Header().Set("WWW-Authenticate", "Bearer")
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid authentication token")
			}

			token := headerParts[1]
			v := validator.New()

			if data.ValidateTokenPlainText(v, token); !v.Valid() {
				c.Response().Header().Set("WWW-Authenticate", "Bearer")
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid authentication token")
			}

			user, err := app.models.Users.GetByToken(data.ScopeAuth, token)
			if err != nil {
				switch {
				case errors.Is(err, data.ErrNoRecordFound):
					c.Response().Header().Set("WWW-Authenticate", "Bearer")
					return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired authentication token")
				default:
					return err
				}
			}

			c.Set("user", user)
			return next(c)
		}
	}
}

func (app *application) RequireActivatedUser(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		user := c.Get("user").(*data.User)
		if user == nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "You must be autenticated to access this resource")
		}
		if !user.Activated {
			return echo.NewHTTPError(http.StatusForbidden, "your user account must be activated to access this resource")
		}
		return next(c)
	}
}

func (app *application) RequirePermission(permission string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		fn := func(c echo.Context) error {
			user := c.Get("user").(*data.User)
			permissions, err := app.models.Permissions.GetAllForUser(user.ID)
			if err != nil {
				return err
			}

			if !permissions.Include(permission) {
				return echo.NewHTTPError(http.StatusForbidden, "This account doesn't have the necessary permissions to access this resource")
			}
			return next(c)
		}
		return app.RequireActivatedUser(fn)
	}
}

func (app *application) VerifyProjectOwnership() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := c.Get("user").(*data.User)
			if user.Role == "admin" {
				return next(c)
			}
			projectIDParam := c.Param("id")
			projectID, err := strconv.Atoi(projectIDParam)
			if err != nil {
				return echo.NewHTTPError(http.StatusNotFound, err.Error())
			}

			_, err = app.models.Projects.Get(projectID)
			if err != nil {
				switch {
				case errors.Is(err, data.ErrNoRecordFound):
					return echo.NewHTTPError(http.StatusNotFound, "Project not found")
				default:
					return err
				}
			}

			isOwner, err := app.models.Projects.ProjectOwnership(projectID, user.ID)
			if err != nil {
				return err
			}

			if isOwner {
				return next(c)
			} else {
				return c.JSON(http.StatusForbidden, envelope{"error": "You don't have ownership over this ressource"})
			}
		}
	}
}

func (app *application) VerifyAccountOwnership() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := c.Get("user").(*data.User)
			if user.Role == "admin" {
				return next(c)
			}
			userIDParam := c.Param("id")
			userID, err := strconv.Atoi(userIDParam)
			if err != nil {
				return echo.NewHTTPError(http.StatusNotFound, err.Error())
			}

			_, err = app.models.Users.GetByID(userID)
			if err != nil {
				switch {
				case errors.Is(err, data.ErrNoRecordFound):
					return echo.NewHTTPError(http.StatusNotFound, "User not found")
				default:
					return err
				}
			}

			isOwner := user.ID == userID
			if isOwner {
				return next(c)
			} else {
				return c.JSON(http.StatusForbidden, envelope{"error": "You don't have ownership over this ressource"})
			}
		}
	}
}

func (app *application) VerifyProjectNonOwnership() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := c.Get("user").(*data.User)
			projectIDParam := c.Param("id")
			projectID, err := strconv.Atoi(projectIDParam)
			if err != nil {
				return echo.NewHTTPError(http.StatusNotFound, err.Error())
			}

			project, err := app.models.Projects.Get(projectID)
			if err != nil {
				switch {
				case errors.Is(err, data.ErrNoRecordFound):
					return echo.NewHTTPError(http.StatusNotFound, "Project not found")
				default:
					return err
				}
			}

			isNotOwner := project.CreatorID != user.ID

			if isNotOwner {
				return next(c)
			} else {
				return c.JSON(http.StatusForbidden, envelope{"error": "You can't back yourself"})
			}
		}
	}
}

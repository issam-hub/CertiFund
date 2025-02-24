package main

import (
	"errors"
	"net/http"
	"projectx/internal/data"
	"projectx/internal/validator"
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
			if authHeader != "" {
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
					return echo.NewHTTPError(http.StatusUnauthorized, "Invalid authentication token")
				default:
					return err
				}
			}

			c.Set("user", user)
			return next(c)
		}
	}
}

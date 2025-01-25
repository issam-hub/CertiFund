package main

import (
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

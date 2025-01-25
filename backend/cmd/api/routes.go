package main

import (
	"github.com/labstack/echo/v4"
)

func (app *application) routes(e *echo.Echo) {
	router := e.Group("/v1")
	router.GET("/healthCheck", app.healthCheckHandler)
}

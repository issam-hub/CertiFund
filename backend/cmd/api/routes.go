package main

import (
	"github.com/labstack/echo/v4"
)

func (app *application) routes(e *echo.Echo) {
	router := e.Group("/v1")
	router.GET("/healthCheck", app.healthCheckHandler)

	// project
	router.POST("/projects/create", app.createProjectHandler)
	router.GET("/projects/:id", app.getProjectHandler)
	router.PATCH("/projects/:id", app.updateProjectHandler)
	router.DELETE("/projects/:id", app.deleteProjectHandler)

	// image upload
	router.POST("/projects/image/upload", app.fileUploadHandler)
}

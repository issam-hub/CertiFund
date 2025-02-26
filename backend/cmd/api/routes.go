package main

import (
	"github.com/labstack/echo/v4"
)

func (app *application) routes(e *echo.Echo) {
	authGroup := e.Group("/v1")
	authGroup.Use(app.Authenticate())

	publicGroup := e.Group("/v1")

	publicGroup.GET("/healthCheck", app.healthCheckHandler)

	// project
	authGroup.POST("/projects/create", app.createProjectHandler, app.RequirePermission("projects:create"))
	publicGroup.GET("/projects/:id", app.getProjectHandler)
	authGroup.PATCH("/projects/:id", app.updateProjectHandler, app.RequirePermission("projects:update"))
	authGroup.DELETE("/projects/:id", app.deleteProjectHandler)

	// image upload
	authGroup.POST("/projects/image/upload", app.fileUploadHandler)

	// user
	publicGroup.POST("/users/signup", app.registerUserHandler)
	authGroup.POST("/users/create", app.createUserHandler, app.RequirePermission("users:create"))
	authGroup.DELETE("/users/:id", app.deleteUserHandler, app.RequirePermission("users:delete"))
	publicGroup.GET("/users/activate", app.activateUserHandler)
	authGroup.GET("/users/:id", app.getUserHandler, app.RequirePermission("users:read"))
	publicGroup.POST("/users/login", app.loginUserHandler)
	authGroup.POST("/users/:id", app.logoutUserHandler)

}

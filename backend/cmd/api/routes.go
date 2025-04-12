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
	authGroup.GET("/projects/:id", app.getProjectHandler, app.VerifyProjectOwnership())
	publicGroup.GET("/projects/discover/:id", app.getProjectHandler)
	publicGroup.GET("/projects", app.getProjectsHandler)
	authGroup.PATCH("/projects/:id", app.updateProjectHandler, app.RequirePermission("projects:update"), app.VerifyProjectOwnership())
	authGroup.DELETE("/projects/:id", app.deleteProjectHandler)
	authGroup.GET("/projects/me", app.getProjectsByCreatorHandler)
	publicGroup.GET("/projects/creator/:id", app.getProjectsByCreatorPublicHandler)
	publicGroup.GET("/projects/backer/:id", app.getProjectsByBackerHandler)
	authGroup.GET("/projects/saved", app.getSavedProjectsByCurrentUserHandler)

	// image upload
	authGroup.POST("/projects/image/upload", app.fileUploadHandler)

	// user
	publicGroup.POST("/users/signup", app.registerUserHandler)
	authGroup.POST("/users/create", app.createUserHandler, app.RequirePermission("users:create"))
	authGroup.DELETE("/users/:id", app.deleteUserHandler, app.RequirePermission("users:delete"))
	authGroup.DELETE("/users/delete", app.deleteAccountHandler)
	publicGroup.GET("/users/activate", app.activateUserHandler)
	publicGroup.GET("/users/reactivate/:id", app.resendActivationTokenHandler)
	publicGroup.GET("/users/discover/:id", app.getUserHandler)
	authGroup.GET("/users/:id", app.getUserHandler, app.RequirePermission("users:read"))
	publicGroup.POST("/users/login", app.loginUserHandler)
	authGroup.POST("/users/logout/:id", app.logoutUserHandler)
	authGroup.GET("/users/me", app.whoAmIHandler)
	authGroup.PATCH("/users/update", app.updateProfileHandler)
	authGroup.PATCH("/users/update/:id", app.updateUserHandler, app.RequirePermission("users:update"))
	authGroup.PATCH("/users/passwordChange", app.changePasswordHandler)
	publicGroup.GET("/users/createdBackedCount/:id", app.getBackedCreatedCountHandler)

	// backing
	authGroup.POST("/backing/backIntent/:id", app.createPaymentIntentHandler, app.RequirePermission("backing:create"), app.VerifyProjectNonOwnership())
	authGroup.POST("/backing/backProject/:id", app.recordBackingHandler, app.RequirePermission("backing:create"), app.VerifyProjectNonOwnership())
	publicGroup.GET("/backing/projectBackers/:id", app.backersCountByProjectHandler)
	authGroup.GET("/backing/didIbackIt/:id", app.didIBackThisProjectHandler)
	authGroup.POST("/backing/refund/:id", app.refundHandler, app.RequirePermission("backing:create"))
	authGroup.DELETE("/backing/:id", app.deleteBackingHandler)
	authGroup.PATCH("/backing/:id", app.updateBackingHandler)

	// rewards
	authGroup.POST("/rewards/create/:id", app.createRewardsHandler, app.RequirePermission("rewards:create"))
	authGroup.PUT("/rewards/update/:id", app.updateRewardsHandler, app.RequirePermission("rewards:update"))
	publicGroup.GET("/rewards/:id", app.getAllRewardsHandler)

	// updates
	authGroup.POST("/updates/create/:id", app.createUpdateHandler, app.RequirePermission("updates:create"), app.VerifyProjectOwnership())
	publicGroup.GET("/updates/:id", app.getAllUpdatesHandler)
	authGroup.DELETE("/updates/:id", app.deleteUpdateHandler, app.RequirePermission("updates:delete"))

	// comments
	authGroup.POST("/comments/create/:id", app.createCommentHandler)
	publicGroup.GET("/comments/:id", app.getAllCommentsHandler)

	// stats
	authGroup.GET("/stats/general", app.getStatsHandler)
	authGroup.GET("/stats/overview", app.getProjectsOverviewHandler)
	authGroup.GET("/stats/topProjects", app.getTopFiveProjectsHandler)
	authGroup.GET("/stats/topCreators", app.getTopFiveCreatorsHandlers)
	authGroup.GET("/stats/topBackers", app.getTopFiveBackersHandlers)
	authGroup.GET("/stats/categoriesDist", app.getCategoriesDistributionHandler)
	authGroup.GET("/stats/creatorsNbackers", app.getCreatorsBackersGrowthHandler)
	authGroup.GET("/stats/backingsNrefunds", app.getBackingsRefundsHandler)

	// tables
	authGroup.GET("/tables/projects", app.getProjectsTableHandler)
	authGroup.GET("/tables/users", app.getUsersTableHandler)
	authGroup.GET("/tables/backings", app.getBackingsTableHandler)
	authGroup.GET("/tables/disputes", app.getDisputesTableHandler)

	// disputes
	authGroup.POST("/disputes/create/:id", app.createDisputeHandler)
	authGroup.DELETE("/disputes/:id", app.deleteDisputeHandler)
	authGroup.PATCH("/disputes/:id", app.updateDisputeHandler)

	// feedback
	authGroup.POST("/projects/like/:id", app.LikeProjectHandler)
	authGroup.POST("/projects/unlike/:id", app.unlikeProjectHandler)
	authGroup.POST("/projects/save/:id", app.SaveProjectHandler)
	authGroup.POST("/projects/unsave/:id", app.unsaveProjectHandler)
	publicGroup.GET("/projects/like/:id", app.getLikesHandler)
	authGroup.GET("/projects/didILikeThis/:id", app.didILikeThisHandler)
	authGroup.GET("/projects/didISaveThis/:id", app.didISaveThisHandler)
}

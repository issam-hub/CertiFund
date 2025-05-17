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
	publicGroup.GET("/projects/discover/:id", app.getPublicProjectHandler)
	publicGroup.GET("/projects", app.getProjectsHandler)
	authGroup.PATCH("/projects/:id", app.updateProjectHandler, app.RequirePermission("projects:update"), app.VerifyProjectOwnership())
	authGroup.DELETE("/projects/:id", app.deleteProjectHandler, app.RequirePermission("projects:delete"))
	authGroup.GET("/projects/me", app.getProjectsByCreatorHandler)
	publicGroup.GET("/projects/creator/:id", app.getProjectsByCreatorPublicHandler)
	publicGroup.GET("/projects/backer/:id", app.getProjectsByBackerHandler)
	authGroup.GET("/projects/saved", app.getSavedProjectsByCurrentUserHandler)
	authGroup.POST("/projects/review/:id", app.reviewProjectHandler)
	authGroup.GET("/projects/review/:id", app.getReviewHandler)
	authGroup.GET("/projects/reviewer", app.getProjectsByReviewerHandler)
	authGroup.GET("/projects/flagged/reviewer", app.getFlaggedProjectsByReviewerHandler)

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
	publicGroup.POST("/users/privilegedLogin", app.loginPrivilegedUserHandler)
	authGroup.POST("/users/logout", app.logoutUserHandler)
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
	authGroup.DELETE("/backing/:id", app.deleteBackingHandler, app.RequirePermission("backing:delete"))
	authGroup.PATCH("/backing/:id", app.updateBackingHandler, app.RequirePermission("backing:update"))
	authGroup.GET("/backing/rewards/:id", app.getBackingRewardsHandler, app.RequirePermission("backing:rewards"))

	// rewards
	authGroup.POST("/rewards/create/:id", app.createRewardsHandler, app.RequirePermission("rewards:create"))
	authGroup.PUT("/rewards/update/:id", app.updateRewardsHandler, app.RequirePermission("rewards:update"))
	publicGroup.GET("/rewards/:id", app.getAllRewardsHandler)

	// updates
	authGroup.POST("/updates/create/:id", app.createUpdateHandler, app.RequirePermission("updates:create"), app.VerifyProjectOwnership())
	publicGroup.GET("/updates/:id", app.getAllUpdatesHandler)
	authGroup.DELETE("/updates/:id", app.deleteUpdateHandler, app.RequirePermission("updates:delete"))

	// comments
	authGroup.POST("/comments/create/:id", app.createCommentHandler, app.RequirePermission("comments:create"))
	publicGroup.GET("/comments/:id", app.getAllCommentsHandler)

	// stats
	authGroup.GET("/stats/general", app.getStatsHandler, app.RequirePermission("stats"))
	authGroup.GET("/stats/overview", app.getProjectsOverviewHandler, app.RequirePermission("stats"))
	authGroup.GET("/stats/topProjects", app.getTopFiveProjectsHandler, app.RequirePermission("stats"))
	authGroup.GET("/stats/topCreators", app.getTopFiveCreatorsHandlers, app.RequirePermission("stats"))
	authGroup.GET("/stats/topBackers", app.getTopFiveBackersHandlers, app.RequirePermission("stats"))
	authGroup.GET("/stats/categoriesDist", app.getCategoriesDistributionHandler, app.RequirePermission("stats"))
	authGroup.GET("/stats/creatorsNbackers", app.getCreatorsBackersGrowthHandler, app.RequirePermission("stats"))
	authGroup.GET("/stats/backingsNrefunds", app.getBackingsRefundsHandler, app.RequirePermission("stats"))
	authGroup.GET("/stats/reviewerPerformance", app.getReviewerPerformanceHandler, app.RequirePermission("stats:reviewer"))
	authGroup.GET("/stats/accuracy", app.getAccuracyHandler, app.RequirePermission("stats:expert"))
	authGroup.GET("/stats/reviewerStats", app.getReviewerStatsHandler, app.RequirePermission("stats:reviewer"))
	authGroup.GET("/stats/userStats", app.getUserStatsHandler, app.RequirePermission("stats:user"))
	authGroup.GET("/stats/fundingProgress", app.getFundingProgressHandler, app.RequirePermission("stats:user"))
	authGroup.GET("/stats/liveProjects", app.getLiveProjectStatisticsHandler, app.RequirePermission("stats:user"))
	authGroup.GET("/stats/backedProjects", app.getBackedProjectStatisticsHandler, app.RequirePermission("stats:user"))

	// tables
	authGroup.GET("/tables/projects", app.getProjectsTableHandler)
	authGroup.GET("/tables/pendingProjects", app.getPendingProjectsTableHandler, app.RequirePermission("tables:projects"))
	authGroup.GET("/tables/users", app.getUsersTableHandler, app.RequirePermission("tables:users"))
	authGroup.GET("/tables/backings", app.getBackingsTableHandler, app.RequirePermission("tables:backings"))
	authGroup.GET("/tables/disputes", app.getDisputesTableHandler, app.RequirePermission("tables:disputes"))
	authGroup.GET("/tables/pendingAssessements", app.getPendingAssessementProjectsTableHandler, app.RequirePermission("tables:pendingAssessments"))
	authGroup.GET("/tables/assessed", app.getAssessedProjectsTableHandler, app.RequirePermission("tables:assessed"))
	authGroup.GET("/tables/createdProjects", app.getCreatedProjectsTableHandler, app.RequirePermission("tables:created"))
	authGroup.GET("/tables/userBackings", app.getUserBackingsTableHandler, app.RequirePermission("tables:userBackings"))

	// disputes
	authGroup.POST("/disputes/create/:id", app.createDisputeHandler, app.RequirePermission("disputes:create"))
	authGroup.DELETE("/disputes/:id", app.deleteDisputeHandler, app.RequirePermission("disputes:delete"))
	authGroup.PATCH("/disputes/:id", app.updateDisputeHandler, app.RequirePermission("disputes:update"))

	// feedback
	authGroup.POST("/projects/like/:id", app.LikeProjectHandler, app.RequirePermission("projects:like"))
	authGroup.POST("/projects/unlike/:id", app.unlikeProjectHandler, app.RequirePermission("projects:unlike"))
	authGroup.POST("/projects/save/:id", app.SaveProjectHandler, app.RequirePermission("projects:save"))
	authGroup.POST("/projects/unsave/:id", app.unsaveProjectHandler, app.RequirePermission("projects:unsave"))
	publicGroup.GET("/projects/like/:id", app.getLikesHandler)
	authGroup.GET("/projects/didILikeThis/:id", app.didILikeThisHandler)
	authGroup.GET("/projects/didISaveThis/:id", app.didISaveThisHandler)

	// experts
	authGroup.POST("/experts/create", app.CreateExpertHandler, app.RequirePermission("experts:create"))
	authGroup.POST("/experts/assess/:id", app.assessProjectHandler, app.RequirePermission("experts:assess"))
}

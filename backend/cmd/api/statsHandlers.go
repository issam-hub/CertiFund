package main

import (
	"errors"
	"net/http"
	"projectx/internal/data"

	"github.com/labstack/echo/v4"
)

func (app *application) getStatsHandler(c echo.Context) error {
	stats := &data.Stats{}

	err := app.models.Stats.GetTotalProjectsCount(stats)
	if err != nil {
		return err
	}
	err = app.models.Stats.GetTotalMoneyRaised(stats)
	if err != nil {
		return err
	}
	err = app.models.Stats.GetTotalSuccessfulProjectsCount(stats)
	if err != nil {
		return err
	}
	err = app.models.Stats.GetTotalFailedProjectsCount(stats)
	if err != nil {
		return err
	}
	err = app.models.Stats.GetTotalBackers(stats)
	if err != nil {
		return err
	}
	err = app.models.Stats.GetTotalCreators(stats)
	if err != nil {
		return err
	}
	err = app.models.Stats.GetTotalBackings(stats)
	if err != nil {
		return err
	}
	err = app.models.Stats.GetTotalRefunds(stats)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Stats returned successfully",
		"stats":   stats,
	})
}

func (app *application) getProjectsOverviewHandler(c echo.Context) error {
	projectsOverview, err := app.models.Stats.GetProjectsOverview()
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "Projects overview returned successfully",
		"overview": projectsOverview,
	})

}

func (app *application) getTopFiveProjectsHandler(c echo.Context) error {
	topProjects, err := app.models.Stats.GetTopFiveProjects()
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "Top five projects returned successfully",
		"projects": topProjects,
	})
}

func (app *application) getTopFiveCreatorsHandlers(c echo.Context) error {
	topCreators, err := app.models.Stats.GetTopFiveCreators()
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":  "Top five creators returned successfully",
		"creators": topCreators,
	})
}

func (app *application) getTopFiveBackersHandlers(c echo.Context) error {
	topBackers, err := app.models.Stats.GetTopFiveBackers()
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Top five backers returned successfully",
		"backers": topBackers,
	})
}

func (app *application) getCategoriesDistributionHandler(c echo.Context) error {
	categoriesDist, err := app.models.Stats.CategoriesDistrubtion()
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Categories distribution returned successfully",
		"data":    categoriesDist,
	})
}

func (app *application) getCreatorsBackersGrowthHandler(c echo.Context) error {
	growth, err := app.models.Stats.CreatorsBackersGrowth()
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Creators/Backers growth returned successfully",
		"growth":  growth,
	})
}
func (app *application) getBackingsRefundsHandler(c echo.Context) error {
	data, err := app.models.Stats.BackingsVSRefunds()
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Backings/Refunds returned successfully",
		"data":    data,
	})
}

func (app *application) getBackedCreatedCountHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	_, err = app.models.Users.GetByID(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "User not found")
		default:
			return err
		}
	}

	profileStats, err := app.models.Stats.CreatedBackedProjectsCount(id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":       "Profile stats returned successfully",
		"profile_stats": profileStats,
	})
}

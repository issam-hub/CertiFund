package main

import (
	"errors"
	"net/http"
	"projectx/internal/data"
	"projectx/internal/validator"
	"time"

	"github.com/labstack/echo/v4"
)

type rewardsInput struct {
	Title             string    `json:"title"`
	Description       string    `json:"description"`
	Amount            float64   `json:"amount"`
	EstimatedDelivery time.Time `json:"estimated_delivery"`
	ImageURL          string    `json:"image_url"`
	Includes          []string  `json:"includes"`
}

func (app *application) createRewardsHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	_, err = app.models.Projects.Get(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Project not found")
		default:
			return err
		}
	}

	var input struct {
		Rewards []rewardsInput `json:"rewards"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	rewards := []data.Reward{}
	for _, reward := range input.Rewards {
		realReward := data.Reward{}
		realReward.Title = reward.Title
		realReward.Description = reward.Description
		realReward.Amount = reward.Amount
		realReward.EstimatedDelivery = reward.EstimatedDelivery
		realReward.ImageURL = reward.ImageURL
		realReward.Includes = reward.Includes
		rewards = append(rewards, realReward)
	}

	v := validator.New()

	for index, reward := range rewards {
		data.ValidateReward(v, &reward, int32(index+1))
	}

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	err = app.models.Rewards.InsertAll(rewards, id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Rewards created successfully",
		"rewards": rewards,
	})
}

func (app *application) getAllRewardsHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	_, err = app.models.Projects.Get(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Project not found")
		default:
			return err
		}
	}

	rewards, err := app.models.Rewards.GetAll(id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Rewards returned successfully",
		"rewards": rewards,
	})
}

func (app *application) updateRewardsHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	_, err = app.models.Projects.Get(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Project not found")
		default:
			return err
		}
	}

	var input struct {
		Rewards []rewardsInput `json:"rewards"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	rewards := []data.Reward{}
	for _, reward := range input.Rewards {
		realReward := data.Reward{}
		realReward.Title = reward.Title
		realReward.Description = reward.Description
		realReward.Amount = reward.Amount
		realReward.EstimatedDelivery = reward.EstimatedDelivery
		realReward.ImageURL = reward.ImageURL
		realReward.Includes = reward.Includes
		rewards = append(rewards, realReward)
	}

	v := validator.New()

	for index, reward := range rewards {
		data.ValidateReward(v, &reward, int32(index+1))
	}

	if !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	err = app.models.Rewards.UpdateAll(rewards, id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message": "Rewards updated successfully",
		"rewards": rewards,
	})
}

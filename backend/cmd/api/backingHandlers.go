package main

import (
	"errors"
	"fmt"
	"net/http"
	"projectx/internal/data"
	"projectx/internal/validator"
	"strconv"
	"time"

	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/paymentintent"
	"github.com/stripe/stripe-go/v72/refund"

	"github.com/labstack/echo/v4"
)

func (app *application) createPaymentIntentHandler(c echo.Context) error {
	projectId, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	project, err := app.models.Projects.Get(projectId)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Project not found")
		default:
			return err
		}
	}

	if time.Now().After(project.Deadline) {
		return echo.NewHTTPError(http.StatusNotFound, "Project funding duration is closed")
	}

	var input struct {
		Amount float64 `json:"amount"`
	}
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	backer := c.Get("user").(*data.User)

	v := validator.New()

	if data.ValidateAmount(v, input.Amount); !v.Valid() {
		return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
	}

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(int64(input.Amount)),
		Currency: stripe.String(string(stripe.CurrencyDZD)),
	}

	projectID := strconv.Itoa(projectId)
	backerID := strconv.Itoa(backer.ID)

	params.AddMetadata("project_id", projectID)
	params.AddMetadata("backer_id", backerID)

	pi, err := paymentintent.New(params)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, envelope{
		"message":       "Backing intent is done successfully",
		"client_secret": pi.ClientSecret,
	})
}

func (app *application) recordBackingHandler(c echo.Context) error {
	projectId, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	var input struct {
		PaymentIntentID string `json:"payment_intent_id"`
		PaymentMethod   string `json:"payment_method"`
		Rewards         []int  `json:"rewards"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	pi, err := paymentintent.Get(input.PaymentIntentID, nil)
	if err != nil {
		return err
	}

	backer := c.Get("user").(*data.User)

	backing := data.Backing{
		BackerID:  backer.ID,
		ProjectID: projectId,
	}

	payment := data.Payment{
		Amount:        float64(pi.Amount),
		Status:        string(pi.Status),
		TransactionID: input.PaymentIntentID,
		PaymentMethod: input.PaymentMethod,
	}

	err = app.models.Backing.Insert(&backing, &payment)
	if err != nil {
		return err
	}

	project, err := app.models.Projects.Get(projectId)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Project not found")
		default:
			return err
		}
	}

	if time.Now().After(project.Deadline) {
		return echo.NewHTTPError(http.StatusNotFound, "Project funding duration is closed")
	}

	project.CurrentFunding = project.CurrentFunding + (payment.Amount / 100)

	err = app.models.Projects.Update(project)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrEditConflict):
			return echo.NewHTTPError(http.StatusConflict, data.ErrEditConflict.Error())
		default:
			return err
		}
	}

	if input.Rewards != nil {
		for i, rewardID := range input.Rewards {
			_, err := app.models.Rewards.Get(rewardID)
			if err != nil {
				switch {
				case errors.Is(err, data.ErrNoRecordFound):
					return echo.NewHTTPError(http.StatusNotFound, fmt.Sprintf("Reward %d not found", i))
				default:
					return err
				}
			}
			err = app.models.Rewards.InsertBackingReward(backing.BackingID, rewardID)
			if err != nil {
				return err
			}
		}
	}

	app.background(func() {
		data := map[string]interface{}{
			"TransactionID":   payment.TransactionID,
			"TransactionDate": payment.CreatedAt,
			"PaymentMethod":   "card",
			"Amount":          payment.Amount / 100,
		}
		err = app.mailer.Send(backer.Email, "fund_receipt.tmpl", data)
		if err != nil {
			c.Logger().Error(err)
		}
	})

	return c.JSON(http.StatusCreated, envelope{
		"message":        "Project is backed successfully",
		"backing_id":     backing.BackingID,
		"payment_id":     payment.PaymentID,
		"status":         payment.Status,
		"transaction_id": payment.TransactionID,
	})
}

func (app *application) backersCountByProjectHandler(c echo.Context) error {
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

	backersCount, err := app.models.Backing.GetBackersCountByProject(id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":       "Backers count returned successfully",
		"backers_count": backersCount,
	})
}

func (app *application) didIBackThisProjectHandler(c echo.Context) error {
	backer := c.Get("user").(*data.User)

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

	didIbackIt, err := app.models.Backing.DidIBackProject(backer.ID, id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message":       "Did you back it or not revealed successfully",
		"did_i_back_it": didIbackIt,
	})
}

func (app *application) refundHandler(c echo.Context) error {
	backer := c.Get("user").(*data.User)

	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	project, err := app.models.Projects.Get(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Project not found")
		default:
			return err
		}
	}

	var input struct {
		Reason *string `json:"reason"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	if input.Reason != nil {
		v := validator.New()

		if data.ValidateReason(v, *input.Reason); !v.Valid() {
			return echo.NewHTTPError(http.StatusUnprocessableEntity, v.Errors)
		}
	}

	backingID, err := app.models.Backing.GetBacking(backer.ID, id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "This user didn't back this project")
		default:
			return err
		}
	}

	paymentID, transactionID, err := app.models.Backing.CheckBacking(*backingID)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "This user didn't back this project")
		default:
			return err
		}
	}

	result, err := refund.New(&stripe.RefundParams{
		PaymentIntent: stripe.String(*transactionID),
	})
	if err != nil {
		return err
	}

	refundDate := time.Now()

	originalBackingDate, err := app.models.Backing.Refund(*backingID, *input.Reason, *paymentID, refundDate)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, "Payment not found")
		case errors.Is(err, data.ErrEditConflict):
			return echo.NewHTTPError(http.StatusConflict, data.ErrEditConflict.Error())
		default:
			return err
		}
	}

	project.CurrentFunding = project.CurrentFunding - float64(result.Amount/100)

	err = app.models.Projects.Update(project)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrEditConflict):
			return echo.NewHTTPError(http.StatusConflict, data.ErrEditConflict.Error())
		default:
			return err
		}
	}

	isBackingWithRewards, err := app.models.Rewards.CheckBackingWithRewards(*backingID)
	if err != nil {
		return err
	}

	if isBackingWithRewards {
		err = app.models.Rewards.DeleteBackingReward(*backingID)
		if err != nil {
			return err
		}
	}

	app.background(func() {
		data := map[string]interface{}{
			"RefundID":                result.ID,
			"RefundDate":              refundDate,
			"OriginalTransactionID":   transactionID,
			"OriginalTransactionDate": originalBackingDate,
			"PaymentMethod":           "card",
			"ProjectName":             project.Title,
			"RefundAmount":            result.Amount / 100,
		}
		err = app.mailer.Send(backer.Email, "refund.tmpl", data)
		if err != nil {
			c.Logger().Error(err)
		}
	})

	return c.JSON(http.StatusOK, envelope{"message": "Backing refunded successfully"})
}

func (app *application) deleteBackingHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	err = app.models.Backing.Delete(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrNoRecordFound):
			return echo.NewHTTPError(http.StatusNotFound, data.ErrNoRecordFound.Error())
		default:
			return err
		}
	}

	return c.JSON(http.StatusOK, envelope{"message": "Backing deleted successfully"})
}

func (app *application) updateBackingHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	var input struct {
		Status string `json:"status"`
	}

	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Error while processing data")
	}

	if input.Status != "refunded" && input.Status != "succeeded" {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid status")
	}

	payment := &data.Payment{
		PaymentID: id,
		Status:    input.Status,
	}

	err = app.models.Backing.Update(*payment)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrEditConflict):
			return echo.NewHTTPError(http.StatusConflict, data.ErrEditConflict.Error())
		default:
			return err
		}
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Backing updated successfully",
		"status":  payment.Status,
	})
}

func (app *application) getBackingRewardsHandler(c echo.Context) error {
	id, err := app.readIDParam(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	rewards, err := app.models.Rewards.GetAllByBacking(id)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, envelope{
		"message": "Rewards returned successfully",
		"rewards": rewards,
	})
}

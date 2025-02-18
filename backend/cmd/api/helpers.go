package main

import (
	"errors"
	"net/http"
	"net/url"
	"os"
	"projectx/internal/validator"
	"strconv"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
)

func (app *application) readIDParam(c echo.Context) (int, error) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil && id < 1 {
		return 0, errors.New("invalid id parameter")
	}
	return id, nil
}

type envelope map[string]interface{}

func (app *application) readString(qs url.Values, key, defaultValue string) string {
	s := qs.Get(key)
	if s == "" {
		return defaultValue
	}
	return s
}

func (app *application) readInt(qs url.Values, key string, defaultValue int, v *validator.Validator) int {
	n := qs.Get(key)

	if n == "" {
		return defaultValue
	}
	i, err := strconv.Atoi(n)
	if err != nil {
		v.AddError(key, "must be an integer value")
		return defaultValue
	}
	return i
}

func (app *application) readCSV(qs url.Values, key string, defaultValue []string) []string {
	csv := qs.Get(key)

	if csv == "" {
		return defaultValue
	}
	return strings.Split(csv, ",")
}

func (app *application) background(fn func()) {
	app.wg.Add(1)
	go func() {
		defer app.wg.Done()
		defer func() {
			if err := recover(); err != nil {
				app.logger.Error(err.(string))
			}
		}()

		fn()
	}()
}

func (app *application) fileUploadHandler(c echo.Context) error {
	// Get the file from the request
	file, err := c.FormFile("file")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Failed to get file from request: " + err.Error(),
		})
	}
	envErr := godotenv.Load()
	if envErr != nil {
		return errors.New("Error happened while uploading the image")
	}
	cloud_name := os.Getenv("CLOUD_NAME")
	api_key := os.Getenv("API_KEY")
	api_secret := os.Getenv("API_SECRET")
	cld, err := cloudinary.NewFromParams(
		cloud_name,
		api_key,
		api_secret,
	)
	// Open the file
	src, err := file.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, envelope{
			"error": "Failed to open file: " + err.Error(),
		})
	}
	defer src.Close()

	// Upload to Cloudinary using the opened file
	uploadResult, err := cld.Upload.Upload(
		c.Request().Context(),
		src,
		uploader.UploadParams{
			ResourceType: "auto", // This will automatically detect the resource type
		})

	if err != nil {
		return c.JSON(http.StatusInternalServerError, envelope{
			"error": "Failed to upload to Cloudinary: " + err.Error(),
		})
	}
	// Return the Cloudinary URL
	return c.JSON(http.StatusOK, envelope{
		"message": "Image uploaded successfully",
		"url":     uploadResult.SecureURL,
	})
}

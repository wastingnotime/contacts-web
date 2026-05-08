package bff

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type TelemetryCollector interface {
	RecordTelemetry(event TelemetryEvent, context TelemetryContext) error
}

type HTTPTelemetryCollector struct {
	BaseURL string
	Client  *http.Client
}

func NewHTTPTelemetryCollector(baseURL string, client *http.Client) *HTTPTelemetryCollector {
	if client == nil {
		client = http.DefaultClient
	}

	return &HTTPTelemetryCollector{
		BaseURL: baseURL,
		Client:  client,
	}
}

func (c *HTTPTelemetryCollector) RecordTelemetry(event TelemetryEvent, context TelemetryContext) error {
	body, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("unable to forward telemetry: %w", err)
	}

	request, err := http.NewRequest(http.MethodPost, c.BaseURL+"/telemetry", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("unable to forward telemetry: %w", err)
	}

	request.Header.Set("Accept", "application/json")
	request.Header.Set("Content-Type", "application/json")
	for key, value := range CreateTelemetryHeaders(context) {
		request.Header.Set(key, value)
	}

	response, err := c.client().Do(request)
	if err != nil {
		return fmt.Errorf("unable to forward telemetry: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode/100 != 2 && response.StatusCode != http.StatusAccepted {
		return fmt.Errorf("unable to forward telemetry")
	}

	return nil
}

func (c *HTTPTelemetryCollector) client() *http.Client {
	if c.Client != nil {
		return c.Client
	}

	return http.DefaultClient
}

type noopTelemetryCollector struct{}

func (noopTelemetryCollector) RecordTelemetry(event TelemetryEvent, context TelemetryContext) error {
	return nil
}

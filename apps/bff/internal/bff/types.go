package bff

import (
	"log/slog"

	"go.opentelemetry.io/otel/trace"
)

type ContactViewModel struct {
	ID          string `json:"id"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	PhoneNumber string `json:"phoneNumber"`
}

type ContactTransport struct {
	ID          string `json:"id"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	PhoneNumber string `json:"phone_number"`
}

type ContactDraft struct {
	ID          string `json:"id"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	PhoneNumber string `json:"phoneNumber"`
}

type CreateContactPayload struct {
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	PhoneNumber string `json:"phone_number"`
}

type UpdateContactPayload struct {
	ID          string `json:"id,omitempty"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	PhoneNumber string `json:"phone_number"`
}

type TelemetryContext struct {
	ServiceName string
	FeatureName string
	JourneyName string
	AppVersion  string
	Environment string
	TraceID     string
	SpanID      string
	TraceParent string
}

type TelemetryEvent struct {
	EventName   string `json:"eventName"`
	Path        string `json:"path,omitempty"`
	Method      string `json:"method,omitempty"`
	StatusCode  int    `json:"statusCode,omitempty"`
	Detail      any    `json:"detail"`
	ServiceName string `json:"serviceName"`
	FeatureName string `json:"featureName"`
	JourneyName string `json:"journeyName"`
	AppVersion  string `json:"appVersion"`
	Environment string `json:"environment"`
	TraceID     string `json:"traceId"`
	TraceParent string `json:"traceparent"`
	Timestamp   string `json:"timestamp"`
}

type TelemetrySubmission struct {
	EventName  string         `json:"eventName"`
	Path       string         `json:"path,omitempty"`
	Method     string         `json:"method,omitempty"`
	StatusCode any            `json:"statusCode,omitempty"`
	Detail     map[string]any `json:"detail,omitempty"`
}

type ErrorPayload struct {
	Message string `json:"message"`
	Code    string `json:"code"`
}

type RuntimeConfig struct {
	Host string
	Port int
}

type Dependencies struct {
	BackendGateway     ContactsBackendGateway
	TelemetryCollector TelemetryCollector
	Observability      *RuntimeObservability
}

type RuntimeObservability struct {
	tracer   trace.Tracer
	logger   *slog.Logger
	shutdown func() error
}

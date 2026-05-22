package bff

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

type fakeBackendGateway struct {
	listContactsFn  func(context TelemetryContext) ([]ContactTransport, error)
	createContactFn func(payload CreateContactPayload, context TelemetryContext) (*ContactTransport, error)
	getContactFn    func(contactID string, context TelemetryContext) (ContactTransport, error)
	updateContactFn func(contactID string, payload UpdateContactPayload, context TelemetryContext) (ContactTransport, error)
	deleteContactFn func(contactID string, context TelemetryContext) error
}

func (f fakeBackendGateway) ListContacts(context TelemetryContext) ([]ContactTransport, error) {
	return f.listContactsFn(context)
}

func (f fakeBackendGateway) CreateContact(payload CreateContactPayload, context TelemetryContext) (*ContactTransport, error) {
	return f.createContactFn(payload, context)
}

func (f fakeBackendGateway) GetContact(contactID string, context TelemetryContext) (ContactTransport, error) {
	return f.getContactFn(contactID, context)
}

func (f fakeBackendGateway) UpdateContact(contactID string, payload UpdateContactPayload, context TelemetryContext) (ContactTransport, error) {
	return f.updateContactFn(contactID, payload, context)
}

func (f fakeBackendGateway) DeleteContact(contactID string, context TelemetryContext) error {
	return f.deleteContactFn(contactID, context)
}

type recordingTelemetryCollector struct {
	events   []TelemetryEvent
	contexts []TelemetryContext
}

func (r *recordingTelemetryCollector) RecordTelemetry(event TelemetryEvent, context TelemetryContext) error {
	r.events = append(r.events, event)
	r.contexts = append(r.contexts, context)
	return nil
}

type recordedSpan struct {
	name          string
	traceID       string
	parentTraceID string
	parentSpanID  string
}

type recordingSpanExporter struct {
	mu    sync.Mutex
	spans []recordedSpan
}

func (e *recordingSpanExporter) ExportSpans(_ context.Context, spans []sdktrace.ReadOnlySpan) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	for _, span := range spans {
		parent := span.Parent()
		e.spans = append(e.spans, recordedSpan{
			name:          span.Name(),
			traceID:       span.SpanContext().TraceID().String(),
			parentTraceID: parent.TraceID().String(),
			parentSpanID:  parent.SpanID().String(),
		})
	}

	return nil
}

func (e *recordingSpanExporter) Shutdown(context.Context) error {
	return nil
}

func TestServerRoutesThroughBffBoundary(t *testing.T) {
	backend := fakeBackendGateway{
		listContactsFn: func(context TelemetryContext) ([]ContactTransport, error) {
			if context.ServiceName != "contacts-bff" {
				t.Errorf("expected bff service context, got %#v", context)
			}

			return []ContactTransport{
				{
					ID:          "contact-1",
					FirstName:   "Ada",
					LastName:    "Lovelace",
					PhoneNumber: "5550001",
				},
			}, nil
		},
		createContactFn: func(payload CreateContactPayload, context TelemetryContext) (*ContactTransport, error) {
			if payload.FirstName != "Grace" || payload.LastName != "Hopper" {
				t.Errorf("unexpected create payload: %#v", payload)
			}
			return &ContactTransport{
				ID:          "contact-2",
				FirstName:   payload.FirstName,
				LastName:    payload.LastName,
				PhoneNumber: payload.PhoneNumber,
			}, nil
		},
		getContactFn: func(contactID string, context TelemetryContext) (ContactTransport, error) {
			if contactID != "contact-1" {
				t.Errorf("unexpected contact id: %q", contactID)
			}
			return ContactTransport{
				ID:          "contact-1",
				FirstName:   "Ada",
				LastName:    "Lovelace",
				PhoneNumber: "5550001",
			}, nil
		},
		updateContactFn: func(contactID string, payload UpdateContactPayload, context TelemetryContext) (ContactTransport, error) {
			if contactID != "contact-1" {
				t.Errorf("unexpected contact id: %q", contactID)
			}
			if payload.ID != "contact-1" {
				t.Errorf("expected update payload id, got %#v", payload)
			}
			return ContactTransport{
				ID:          "contact-1",
				FirstName:   payload.FirstName,
				LastName:    payload.LastName,
				PhoneNumber: payload.PhoneNumber,
			}, nil
		},
		deleteContactFn: func(contactID string, context TelemetryContext) error {
			if contactID != "contact-1" {
				t.Errorf("unexpected contact id: %q", contactID)
			}
			return nil
		},
	}
	telemetryCollector := &recordingTelemetryCollector{}

	server := httptest.NewServer(NewServer(Dependencies{
		BackendGateway:     backend,
		TelemetryCollector: telemetryCollector,
	}).Handler())
	defer server.Close()

	telemetryContext := map[string]string{
		"traceparent":             "00-0123456789abcdef0123456789abcdef-0123456789abcdef-01",
		"x-contacts-trace-id":     "0123456789abcdef0123456789abcdef",
		"x-contacts-service-name": "contacts-spa",
		"x-contacts-feature-name": "contacts-web",
		"x-contacts-journey-name": "contacts-web-journey",
		"x-contacts-app-version":  "2026.04.22",
		"x-contacts-environment":  "test",
	}

	healthzResponse := mustDoRequest(t, server, http.MethodGet, "/api/healthz", nil, telemetryContext)
	if healthzResponse.StatusCode != http.StatusOK {
		t.Fatalf("expected healthz success, got %d", healthzResponse.StatusCode)
	}

	telemetryResponse := mustDoRequest(t, server, http.MethodPost, "/api/telemetry", map[string]any{
		"eventName":  "page_view",
		"path":       "/contacts",
		"method":     "GET",
		"statusCode": 200,
		"detail": map[string]any{
			"route": "/",
		},
	}, telemetryContext)
	if telemetryResponse.StatusCode != http.StatusAccepted {
		t.Fatalf("expected telemetry acceptance, got %d", telemetryResponse.StatusCode)
	}

	if len(telemetryCollector.events) != 1 {
		t.Fatalf("expected telemetry collector to record one event, got %d", len(telemetryCollector.events))
	}
	if telemetryCollector.events[0].ServiceName != "contacts-spa" {
		t.Fatalf("expected browser service name in telemetry payload, got %#v", telemetryCollector.events[0])
	}
	if telemetryCollector.contexts[0].ServiceName != "contacts-spa" {
		t.Fatalf("expected browser telemetry context, got %#v", telemetryCollector.contexts[0])
	}

	listResponse := mustDoRequest(t, server, http.MethodGet, "/api/contacts", nil, telemetryContext)
	if listResponse.StatusCode != http.StatusOK {
		t.Fatalf("expected list response, got %d", listResponse.StatusCode)
	}

	createResponse := mustDoRequest(t, server, http.MethodPost, "/api/contacts", map[string]any{
		"id":          "",
		"firstName":   "Grace",
		"lastName":    "Hopper",
		"phoneNumber": "555-0100",
	}, telemetryContext)
	if createResponse.StatusCode != http.StatusCreated {
		t.Fatalf("expected create response, got %d", createResponse.StatusCode)
	}

	getResponse := mustDoRequest(t, server, http.MethodGet, "/api/contacts/contact-1", nil, telemetryContext)
	if getResponse.StatusCode != http.StatusOK {
		t.Fatalf("expected get response, got %d", getResponse.StatusCode)
	}

	updateResponse := mustDoRequest(t, server, http.MethodPut, "/api/contacts/contact-1", map[string]any{
		"id":          "contact-1",
		"firstName":   "Ada",
		"lastName":    "Byron",
		"phoneNumber": "5550009",
	}, telemetryContext)
	if updateResponse.StatusCode != http.StatusOK {
		t.Fatalf("expected update response, got %d", updateResponse.StatusCode)
	}

	deleteResponse := mustDoRequest(t, server, http.MethodDelete, "/api/contacts/contact-1", nil, telemetryContext)
	if deleteResponse.StatusCode != http.StatusNoContent {
		t.Fatalf("expected delete response, got %d", deleteResponse.StatusCode)
	}
}

func TestServerLogsRequestSummaries(t *testing.T) {
	backend := fakeBackendGateway{
		listContactsFn: func(context TelemetryContext) ([]ContactTransport, error) {
			return []ContactTransport{}, nil
		},
	}

	originalWriter := log.Writer()
	originalFlags := log.Flags()
	var logBuffer bytes.Buffer
	log.SetOutput(&logBuffer)
	log.SetFlags(0)
	t.Cleanup(func() {
		log.SetOutput(originalWriter)
		log.SetFlags(originalFlags)
	})

	server := httptest.NewServer(NewServer(Dependencies{
		BackendGateway: backend,
	}).Handler())
	defer server.Close()

	telemetryContext := map[string]string{
		"traceparent":             "00-0123456789abcdef0123456789abcdef-0123456789abcdef-01",
		"x-contacts-trace-id":     "0123456789abcdef0123456789abcdef",
		"x-contacts-service-name": "contacts-spa",
		"x-contacts-feature-name": "contacts-web",
		"x-contacts-journey-name": "contacts-web-journey",
		"x-contacts-app-version":  "2026.04.22",
		"x-contacts-environment":  "test",
	}

	response := mustDoRequest(t, server, http.MethodGet, "/api/contacts", nil, telemetryContext)
	if response.StatusCode != http.StatusOK {
		t.Fatalf("expected list response, got %d", response.StatusCode)
	}

	if !strings.Contains(logBuffer.String(), "contacts-web bff request method=GET path=/api/contacts status=200") {
		t.Fatalf("expected request summary log, got %q", logBuffer.String())
	}
}

func TestServerExportsRequestSpanAndPropagatesTraceContext(t *testing.T) {
	exporter := &recordingSpanExporter{}
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithSpanProcessor(sdktrace.NewSimpleSpanProcessor(exporter)),
	)

	backend := fakeBackendGateway{
		listContactsFn: func(context TelemetryContext) ([]ContactTransport, error) {
			if context.TraceID != "0123456789abcdef0123456789abcdef" {
				t.Fatalf("expected propagated trace id, got %#v", context)
			}
			if context.TraceParent == "" {
				t.Fatalf("expected propagated traceparent, got %#v", context)
			}

			return []ContactTransport{
				{
					ID:          "contact-1",
					FirstName:   "Ada",
					LastName:    "Lovelace",
					PhoneNumber: "5550001",
				},
			}, nil
		},
	}

	server := httptest.NewServer(NewServer(Dependencies{
		BackendGateway: backend,
		Observability: &RuntimeObservability{
			tracer: tracerProvider.Tracer(defaultTelemetryBffName),
			shutdown: func() error {
				return tracerProvider.Shutdown(context.Background())
			},
		},
	}).Handler())
	defer server.Close()

	request, err := http.NewRequest(http.MethodGet, server.URL+"/api/contacts", nil)
	if err != nil {
		t.Fatalf("failed to build request: %v", err)
	}
	request.Header.Set("traceparent", "00-0123456789abcdef0123456789abcdef-0123456789abcdef-01")
	request.Header.Set("x-contacts-trace-id", "0123456789abcdef0123456789abcdef")

	response, err := server.Client().Do(request)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		t.Fatalf("expected success, got %d", response.StatusCode)
	}

	if len(exporter.spans) != 1 {
		t.Fatalf("expected one exported span, got %d", len(exporter.spans))
	}
	if exporter.spans[0].name != "GET /api/contacts" {
		t.Fatalf("unexpected span name: %#v", exporter.spans[0])
	}
	if exporter.spans[0].traceID != "0123456789abcdef0123456789abcdef" {
		t.Fatalf("expected exported trace id to match inbound request, got %#v", exporter.spans[0])
	}
	if exporter.spans[0].parentTraceID != "0123456789abcdef0123456789abcdef" {
		t.Fatalf("expected exported span parent trace id to match inbound trace, got %#v", exporter.spans[0])
	}
	if exporter.spans[0].parentSpanID != "0123456789abcdef" {
		t.Fatalf("expected exported span parent span id to match inbound traceparent, got %#v", exporter.spans[0])
	}
}

func TestServerMapsBackendAuthorizationFailures(t *testing.T) {
	server := httptest.NewServer(NewServer(Dependencies{
		BackendGateway: fakeBackendGateway{
			listContactsFn: func(context TelemetryContext) ([]ContactTransport, error) {
				return nil, NewAPIError("You are not allowed to access contacts right now.", "authorization")
			},
		},
	}).Handler())
	defer server.Close()

	response := mustDoRequest(t, server, http.MethodGet, "/api/contacts", nil, map[string]string{})
	if response.StatusCode != http.StatusForbidden {
		t.Fatalf("expected forbidden status, got %d", response.StatusCode)
	}
}

func mustDoRequest(t *testing.T, server *httptest.Server, method, path string, body any, headers map[string]string) *http.Response {
	t.Helper()

	var requestBody []byte
	if body != nil {
		encoded, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("failed to encode request body: %v", err)
		}
		requestBody = encoded
	}

	request, err := http.NewRequest(method, server.URL+path, bytes.NewReader(requestBody))
	if err != nil {
		t.Fatalf("failed to build request: %v", err)
	}
	if body != nil {
		request.Header.Set("Content-Type", "application/json")
	}
	for key, value := range headers {
		request.Header.Set(key, value)
	}

	response, err := server.Client().Do(request)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer response.Body.Close()

	return response
}

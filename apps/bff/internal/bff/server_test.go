package bff

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"

	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/otel/attribute"
	otelog "go.opentelemetry.io/otel/log"
	sdklog "go.opentelemetry.io/otel/sdk/log"
	sdkresource "go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)

type fakeBackendGateway struct {
	listContactsFn  func(context TelemetryContext) ([]ContactTransport, error)
	createContactFn func(payload CreateContactPayload, context TelemetryContext) (*ContactTransport, error)
	getContactFn    func(contactID string, context TelemetryContext) (ContactTransport, error)
	updateContactFn func(contactID string, payload UpdateContactPayload, context TelemetryContext) (ContactTransport, error)
	deleteContactFn func(contactID string, context TelemetryContext) error
	healthCheckFn   func(context TelemetryContext) error
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

func (f fakeBackendGateway) HealthCheck(context TelemetryContext) error {
	if f.healthCheckFn == nil {
		return nil
	}

	return f.healthCheckFn(context)
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

type recordingLogExporter struct {
	mu      sync.Mutex
	records []sdklog.Record
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

func (e *recordingLogExporter) Export(_ context.Context, records []sdklog.Record) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	for _, record := range records {
		e.records = append(e.records, record.Clone())
	}

	return nil
}

func (e *recordingLogExporter) Shutdown(context.Context) error {
	return nil
}

func (e *recordingLogExporter) ForceFlush(context.Context) error {
	return nil
}

func newTestLogObservability(t *testing.T, exporter sdklog.Exporter) *RuntimeObservability {
	t.Helper()

	resource, err := sdkresource.New(context.Background(),
		sdkresource.WithAttributes(
			attribute.String("service.name", defaultTelemetryBffName),
			attribute.String("service.version", defaultTelemetryAppVersion),
			attribute.String("deployment.environment", defaultTelemetryEnvironment),
		),
	)
	if err != nil {
		t.Fatalf("failed to create log resource: %v", err)
	}

	provider := sdklog.NewLoggerProvider(
		sdklog.WithResource(resource),
		sdklog.WithProcessor(sdklog.NewSimpleProcessor(exporter)),
	)

	t.Cleanup(func() {
		_ = provider.Shutdown(context.Background())
	})

	return &RuntimeObservability{
		tracer: trace.NewNoopTracerProvider().Tracer(defaultTelemetryBffName),
		logger: otelslog.NewLogger(
			defaultTelemetryBffName,
			otelslog.WithLoggerProvider(provider),
		),
		shutdown: func() error {
			return provider.Shutdown(context.Background())
		},
	}
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

	liveResponse := mustDoRequest(t, server, http.MethodGet, "/api/health/live", nil, telemetryContext)
	if liveResponse.StatusCode != http.StatusOK {
		t.Fatalf("expected live health success, got %d", liveResponse.StatusCode)
	}

	readyResponse := mustDoRequest(t, server, http.MethodGet, "/api/health/ready", nil, telemetryContext)
	if readyResponse.StatusCode != http.StatusOK {
		t.Fatalf("expected ready health success, got %d", readyResponse.StatusCode)
	}

	legacyHealthResponse := mustDoRequest(t, server, http.MethodGet, "/api/healthz", nil, telemetryContext)
	if legacyHealthResponse.StatusCode != http.StatusOK {
		t.Fatalf("expected legacy health success, got %d", legacyHealthResponse.StatusCode)
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

func TestServerReadinessDependsOnBackendHealth(t *testing.T) {
	backendHealthChecks := 0
	server := httptest.NewServer(NewServer(Dependencies{
		BackendGateway: fakeBackendGateway{
			healthCheckFn: func(context TelemetryContext) error {
				backendHealthChecks++
				return errors.New("backend unavailable")
			},
		},
	}).Handler())
	defer server.Close()

	response := mustDoRequest(t, server, http.MethodGet, "/api/health/ready", nil, nil)
	if response.StatusCode != http.StatusServiceUnavailable {
		t.Fatalf("expected readiness failure, got %d", response.StatusCode)
	}
	if backendHealthChecks != 1 {
		t.Fatalf("expected one backend health check, got %d", backendHealthChecks)
	}
}

func TestServerExportsRequestSummariesAsOpenTelemetryLogs(t *testing.T) {
	backend := fakeBackendGateway{
		listContactsFn: func(context TelemetryContext) ([]ContactTransport, error) {
			return []ContactTransport{}, nil
		},
	}

	exporter := &recordingLogExporter{}
	observability := newTestLogObservability(t, exporter)

	server := httptest.NewServer(NewServer(Dependencies{
		BackendGateway: backend,
		Observability:  observability,
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

	if len(exporter.records) != 1 {
		t.Fatalf("expected one exported log record, got %d", len(exporter.records))
	}

	record := exporter.records[0]
	if record.Body().AsString() != "contacts-web bff request" {
		t.Fatalf("unexpected log body: %q", record.Body().AsString())
	}
	if record.Resource() == nil {
		t.Fatalf("expected log resource metadata")
	}

	resourceAttrs := map[string]string{}
	for _, kv := range record.Resource().Attributes() {
		resourceAttrs[string(kv.Key)] = kv.Value.AsString()
	}
	if resourceAttrs["service.name"] != "contacts-bff" {
		t.Fatalf("expected BFF service name in log resource, got %#v", resourceAttrs)
	}

	attrs := map[string]otelog.Value{}
	record.WalkAttributes(func(kv otelog.KeyValue) bool {
		attrs[string(kv.Key)] = kv.Value
		return true
	})

	if attrs["method"].AsString() != "GET" {
		t.Fatalf("expected log method attribute, got %#v", attrs)
	}
	if attrs["path"].AsString() != "/api/contacts" {
		t.Fatalf("expected log path attribute, got %#v", attrs)
	}
	if attrs["status"].AsInt64() != 200 {
		t.Fatalf("expected log status attribute, got %#v", attrs)
	}
	if attrs["duration_ms"].Empty() {
		t.Fatalf("expected log duration attribute, got %#v", attrs)
	}
}

func TestRuntimeObservabilityExportsLogsToOtlpHttpCollector(t *testing.T) {
	var (
		mu     sync.Mutex
		paths  []string
		events []string
	)

	collector := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		mu.Lock()
		defer mu.Unlock()

		paths = append(paths, request.URL.Path)
		events = append(events, request.Header.Get("Content-Type"))
		response.WriteHeader(http.StatusAccepted)
	}))
	defer collector.Close()

	t.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", collector.URL)

	observability, err := newRuntimeObservabilityFromEnv()
	if err != nil {
		t.Fatalf("failed to build runtime observability: %v", err)
	}

	observability.Logger().Info("contacts-web bff request",
		"method", "GET",
		"path", "/api/contacts",
		"status", 200,
		"duration_ms", 1,
	)

	if err := observability.Shutdown(); err != nil {
		t.Fatalf("failed to shut down runtime observability: %v", err)
	}

	mu.Lock()
	defer mu.Unlock()

	if len(paths) == 0 {
		t.Fatalf("expected collector to receive at least one otlp request")
	}
	if paths[0] != "/v1/logs" {
		t.Fatalf("expected otlp logs endpoint, got %q", paths[0])
	}
	if len(events) == 0 || events[0] != "application/x-protobuf" {
		t.Fatalf("expected otlp protobuf content type, got %#v", events)
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

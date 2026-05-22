package bff

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/propagation"
	oteltrace "go.opentelemetry.io/otel/trace"
)

type Server struct {
	client             *ContactsWebBffClient
	telemetryCollector TelemetryCollector
	observability      *RuntimeObservability
}

func NewServer(dependencies Dependencies) *Server {
	if dependencies.BackendGateway == nil {
		panic("missing backend gateway for contacts web bff")
	}

	telemetryCollector := dependencies.TelemetryCollector
	if telemetryCollector == nil {
		telemetryCollector = noopTelemetryCollector{}
	}

	return &Server{
		client:             NewContactsWebBffClient(dependencies.BackendGateway),
		telemetryCollector: telemetryCollector,
		observability:      dependencies.Observability,
	}
}

func (s *Server) Handler() http.Handler {
	return http.HandlerFunc(s.serveHTTP)
}

func (s *Server) serveHTTP(response http.ResponseWriter, request *http.Request) {
	path := request.URL.Path
	if !strings.HasPrefix(path, "/api") {
		writeJSON(response, http.StatusNotFound, map[string]string{"message": "Not found."})
		return
	}

	apiPath := strings.TrimPrefix(path, "/api")
	if apiPath == "" {
		apiPath = "/"
	}

	startedAt := time.Now()
	statusCode := http.StatusOK
	var requestErr error
	defer func() {
		logRequestSummary(request.Method, path, statusCode, time.Since(startedAt), requestErr)
	}()

	browserTelemetryContext := ReadTelemetryContextFromHeaders(request.Header)
	parentContext := propagation.TraceContext{}.Extract(request.Context(), propagation.HeaderCarrier(request.Header))
	_, span := s.observability.Tracer().Start(
		parentContext,
		request.Method+" "+path,
		oteltrace.WithAttributes(
			attribute.String("http.request.method", request.Method),
			attribute.String("url.path", path),
		),
	)
	defer span.End()

	spanContext := span.SpanContext()
	bffTelemetryContext := browserTelemetryContext
	bffTelemetryContext.ServiceName = defaultTelemetryBffName
	bffTelemetryContext.TraceID = spanContext.TraceID().String()
	bffTelemetryContext.SpanID = spanContext.SpanID().String()
	bffTelemetryContext.TraceParent = CreateTraceParent(bffTelemetryContext.TraceID, bffTelemetryContext.SpanID, true)

	switch {
	case request.Method == http.MethodGet && apiPath == "/healthz":
		statusCode = http.StatusOK
		span.SetAttributes(attribute.Int("http.response.status_code", http.StatusOK))
		writeJSON(response, http.StatusOK, map[string]string{"status": "ok"})
	case request.Method == http.MethodPost && apiPath == "/telemetry":
		var telemetryErr error
		statusCode, telemetryErr = s.handleTelemetry(response, request, browserTelemetryContext, span)
		requestErr = telemetryErr
	case request.Method == http.MethodGet && apiPath == "/contacts":
		contacts, err := s.client.ListContacts(bffTelemetryContext)
		if err != nil {
			requestErr = err
			statusCode = StatusCodeForError(err)
			s.recordRequestFailure(span, err)
			respondWithError(response, err, "Unable to load contacts.")
			return
		}
		statusCode = http.StatusOK
		span.SetAttributes(attribute.Int("http.response.status_code", http.StatusOK))
		writeJSON(response, http.StatusOK, contacts)
	case request.Method == http.MethodPost && apiPath == "/contacts":
		var draft ContactDraft
		if err := decodeRequestJSON(request.Body, &draft); err != nil {
			apiErr := NewAPIError("The contact data is invalid.", "validation")
			requestErr = apiErr
			statusCode = StatusCodeForError(apiErr)
			s.recordRequestFailure(span, apiErr)
			respondWithError(response, apiErr, "Unable to create contact.")
			return
		}
		contact, err := s.client.CreateContact(draft, bffTelemetryContext)
		if err != nil {
			requestErr = err
			statusCode = StatusCodeForError(err)
			s.recordRequestFailure(span, err)
			respondWithError(response, err, "Unable to create contact.")
			return
		}
		statusCode = http.StatusCreated
		span.SetAttributes(attribute.Int("http.response.status_code", http.StatusCreated))
		writeJSON(response, http.StatusCreated, contact)
	case request.Method == http.MethodGet && strings.HasPrefix(apiPath, "/contacts/"):
		contactID, err := decodeContactID(apiPath)
		if err != nil {
			apiErr := NewAPIError("The contact data is invalid.", "validation")
			requestErr = apiErr
			statusCode = StatusCodeForError(apiErr)
			s.recordRequestFailure(span, apiErr)
			respondWithError(response, apiErr, "Unable to load contact.")
			return
		}
		contact, err := s.client.GetContact(contactID, bffTelemetryContext)
		if err != nil {
			requestErr = err
			statusCode = StatusCodeForError(err)
			s.recordRequestFailure(span, err)
			respondWithError(response, err, "Unable to load contact.")
			return
		}
		statusCode = http.StatusOK
		span.SetAttributes(attribute.Int("http.response.status_code", http.StatusOK))
		writeJSON(response, http.StatusOK, contact)
	case request.Method == http.MethodPut && strings.HasPrefix(apiPath, "/contacts/"):
		contactID, err := decodeContactID(apiPath)
		if err != nil {
			apiErr := NewAPIError("The contact data is invalid.", "validation")
			requestErr = apiErr
			statusCode = StatusCodeForError(apiErr)
			s.recordRequestFailure(span, apiErr)
			respondWithError(response, apiErr, "Unable to update contact.")
			return
		}
		var draft ContactDraft
		if err := decodeRequestJSON(request.Body, &draft); err != nil {
			apiErr := NewAPIError("The contact data is invalid.", "validation")
			requestErr = apiErr
			statusCode = StatusCodeForError(apiErr)
			s.recordRequestFailure(span, apiErr)
			respondWithError(response, apiErr, "Unable to update contact.")
			return
		}
		contact, err := s.client.UpdateContact(contactID, draft, bffTelemetryContext)
		if err != nil {
			requestErr = err
			statusCode = StatusCodeForError(err)
			s.recordRequestFailure(span, err)
			respondWithError(response, err, "Unable to update contact.")
			return
		}
		statusCode = http.StatusOK
		span.SetAttributes(attribute.Int("http.response.status_code", http.StatusOK))
		writeJSON(response, http.StatusOK, contact)
	case request.Method == http.MethodDelete && strings.HasPrefix(apiPath, "/contacts/"):
		contactID, err := decodeContactID(apiPath)
		if err != nil {
			apiErr := NewAPIError("The contact data is invalid.", "validation")
			requestErr = apiErr
			statusCode = StatusCodeForError(apiErr)
			s.recordRequestFailure(span, apiErr)
			respondWithError(response, apiErr, "Unable to delete contact.")
			return
		}
		if err := s.client.DeleteContact(contactID, bffTelemetryContext); err != nil {
			requestErr = err
			statusCode = StatusCodeForError(err)
			s.recordRequestFailure(span, err)
			respondWithError(response, err, "Unable to delete contact.")
			return
		}
		statusCode = http.StatusNoContent
		span.SetAttributes(attribute.Int("http.response.status_code", http.StatusNoContent))
		response.WriteHeader(http.StatusNoContent)
	default:
		statusCode = http.StatusNotFound
		span.SetAttributes(attribute.Int("http.response.status_code", http.StatusNotFound))
		writeJSON(response, http.StatusNotFound, map[string]string{"message": "Not found."})
	}
}

func (s *Server) handleTelemetry(response http.ResponseWriter, request *http.Request, context TelemetryContext, span oteltrace.Span) (int, error) {
	defer request.Body.Close()

	var submission map[string]any
	rawBody, err := io.ReadAll(request.Body)
	if err != nil {
		apiErr := NewAPIError("The contact data is invalid.", "validation")
		respondWithError(response, apiErr, "Unable to process request.")
		return StatusCodeForError(apiErr), apiErr
	}
	submission = map[string]any{}
	if len(bytes.TrimSpace(rawBody)) > 0 {
		decoder := json.NewDecoder(bytes.NewReader(rawBody))
		decoder.UseNumber()
		if err := decoder.Decode(&submission); err != nil {
			apiErr := NewAPIError("The contact data is invalid.", "validation")
			respondWithError(response, apiErr, "Unable to process request.")
			return StatusCodeForError(apiErr), apiErr
		}
	}

	detail := any(submission)
	if rawDetail, ok := submission["detail"]; ok && rawDetail != nil {
		detail = rawDetail
	}

	statusCode := 0
	if rawStatusCode, ok := submission["statusCode"]; ok {
		switch value := rawStatusCode.(type) {
		case float64:
			statusCode = int(value)
		case int:
			statusCode = value
		case json.Number:
			parsed, err := value.Int64()
			if err == nil {
				statusCode = int(parsed)
			}
		}
	}

	eventName, _ := submission["eventName"].(string)
	if strings.TrimSpace(eventName) == "" {
		eventName = "browser_event"
	}

	span.AddEvent("browser.telemetry", oteltrace.WithAttributes(
		attribute.String("browser.event_name", eventName),
		attribute.String("browser.path", stringValue(submission["path"])),
		attribute.String("browser.method", stringValue(submission["method"])),
	))

	telemetry := CreateTelemetryEvent(
		eventName,
		detail,
		stringValue(submission["path"]),
		stringValue(submission["method"]),
		statusCode,
		context,
	)

	_ = s.telemetryCollector.RecordTelemetry(telemetry, context)
	span.SetAttributes(attribute.Int("http.response.status_code", http.StatusAccepted))
	writeJSON(response, http.StatusAccepted, map[string]any{
		"accepted":  true,
		"telemetry": telemetry,
	})
	return http.StatusAccepted, nil
}

func (s *Server) recordRequestFailure(span oteltrace.Span, err error) {
	if span == nil || err == nil {
		return
	}

	span.RecordError(err)
	span.SetStatus(codes.Error, err.Error())
}

func decodeContactID(apiPath string) (string, error) {
	contactID, err := url.PathUnescape(strings.TrimPrefix(apiPath, "/contacts/"))
	if err != nil || strings.TrimSpace(contactID) == "" {
		return "", fmt.Errorf("invalid contact id")
	}

	return contactID, nil
}

func decodeRequestJSON(body io.Reader, target any) error {
	decoder := json.NewDecoder(body)
	decoder.UseNumber()
	if err := decoder.Decode(target); err != nil {
		if errors.Is(err, io.EOF) {
			return fmt.Errorf("empty body")
		}

		return err
	}

	return nil
}

func respondWithError(response http.ResponseWriter, err error, fallbackMessage string) {
	statusCode := StatusCodeForError(err)
	writeJSON(response, statusCode, ErrorPayloadFor(err, fallbackMessage))
}

func writeJSON(response http.ResponseWriter, statusCode int, payload any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(statusCode)

	if statusCode == http.StatusNoContent {
		return
	}

	encoder := json.NewEncoder(response)
	_ = encoder.Encode(payload)
}

func logRequestSummary(method, path string, statusCode int, duration time.Duration, err error) {
	if err != nil {
		log.Printf("contacts-web bff request method=%s path=%s status=%d duration=%s error=%q", method, path, statusCode, duration.String(), err.Error())
		return
	}

	log.Printf("contacts-web bff request method=%s path=%s status=%d duration=%s", method, path, statusCode, duration.String())
}

type Runtime struct {
	server        *http.Server
	listener      net.Listener
	observability *RuntimeObservability
	BaseURL       string
}

func StartRuntimeFromEnv() (*Runtime, error) {
	observability, err := newRuntimeObservabilityFromEnv()
	if err != nil {
		return nil, err
	}

	return StartRuntime(RuntimeConfig{
		Host: GetContactsWebBffHost(),
		Port: GetContactsWebBffPort(),
	}, Dependencies{
		BackendGateway: NewHTTPContactsBackendGateway(
			GetContactsBackendBaseURL(),
			GetContactsBackendAuthSubject(),
			GetContactsBackendAuthRoles(),
			nil,
		),
		TelemetryCollector: NewHTTPTelemetryCollector(GetContactsTelemetryCollectorBaseURL(), nil),
		Observability:      observability,
	})
}

func StartRuntime(config RuntimeConfig, dependencies Dependencies) (*Runtime, error) {
	listener, err := net.Listen("tcp", net.JoinHostPort(config.Host, strconv.Itoa(config.Port)))
	if err != nil {
		return nil, err
	}

	server := &http.Server{
		Handler: NewServer(dependencies).Handler(),
	}

	runtime := &Runtime{
		server:        server,
		listener:      listener,
		observability: dependencies.Observability,
		BaseURL:       fmt.Sprintf("http://127.0.0.1:%d", listener.Addr().(*net.TCPAddr).Port),
	}

	go func() {
		_ = server.Serve(listener)
	}()

	log.Printf("contacts-web bff listening on %s", runtime.BaseURL)

	return runtime, nil
}

func (r *Runtime) Shutdown(ctx context.Context) error {
	if r == nil || r.server == nil {
		return nil
	}

	if err := r.server.Shutdown(ctx); err != nil {
		return err
	}

	if r.observability != nil {
		log.Println("contacts-web bff shutting down")
		return r.observability.Shutdown()
	}

	log.Println("contacts-web bff shutting down")
	return nil
}

func stringValue(value any) string {
	if text, ok := value.(string); ok {
		return text
	}

	return ""
}

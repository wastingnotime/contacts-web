package bff

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

type Server struct {
	client             *ContactsWebBffClient
	telemetryCollector TelemetryCollector
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

	browserTelemetryContext := ReadTelemetryContextFromHeaders(request.Header)
	bffTelemetryContext := CreateChildTelemetryContext(browserTelemetryContext, defaultTelemetryBffName)

	switch {
	case request.Method == http.MethodGet && apiPath == "/healthz":
		writeJSON(response, http.StatusOK, map[string]string{"status": "ok"})
	case request.Method == http.MethodPost && apiPath == "/telemetry":
		s.handleTelemetry(response, request, browserTelemetryContext)
	case request.Method == http.MethodGet && apiPath == "/contacts":
		contacts, err := s.client.ListContacts(bffTelemetryContext)
		if err != nil {
			respondWithError(response, err, "Unable to load contacts.")
			return
		}
		writeJSON(response, http.StatusOK, contacts)
	case request.Method == http.MethodPost && apiPath == "/contacts":
		var draft ContactDraft
		if err := decodeRequestJSON(request.Body, &draft); err != nil {
			respondWithError(response, NewAPIError("The contact data is invalid.", "validation"), "Unable to create contact.")
			return
		}
		contact, err := s.client.CreateContact(draft, bffTelemetryContext)
		if err != nil {
			respondWithError(response, err, "Unable to create contact.")
			return
		}
		writeJSON(response, http.StatusCreated, contact)
	case request.Method == http.MethodGet && strings.HasPrefix(apiPath, "/contacts/"):
		contactID, err := decodeContactID(apiPath)
		if err != nil {
			respondWithError(response, NewAPIError("The contact data is invalid.", "validation"), "Unable to load contact.")
			return
		}
		contact, err := s.client.GetContact(contactID, bffTelemetryContext)
		if err != nil {
			respondWithError(response, err, "Unable to load contact.")
			return
		}
		writeJSON(response, http.StatusOK, contact)
	case request.Method == http.MethodPut && strings.HasPrefix(apiPath, "/contacts/"):
		contactID, err := decodeContactID(apiPath)
		if err != nil {
			respondWithError(response, NewAPIError("The contact data is invalid.", "validation"), "Unable to update contact.")
			return
		}
		var draft ContactDraft
		if err := decodeRequestJSON(request.Body, &draft); err != nil {
			respondWithError(response, NewAPIError("The contact data is invalid.", "validation"), "Unable to update contact.")
			return
		}
		contact, err := s.client.UpdateContact(contactID, draft, bffTelemetryContext)
		if err != nil {
			respondWithError(response, err, "Unable to update contact.")
			return
		}
		writeJSON(response, http.StatusOK, contact)
	case request.Method == http.MethodDelete && strings.HasPrefix(apiPath, "/contacts/"):
		contactID, err := decodeContactID(apiPath)
		if err != nil {
			respondWithError(response, NewAPIError("The contact data is invalid.", "validation"), "Unable to delete contact.")
			return
		}
		if err := s.client.DeleteContact(contactID, bffTelemetryContext); err != nil {
			respondWithError(response, err, "Unable to delete contact.")
			return
		}
		response.WriteHeader(http.StatusNoContent)
	default:
		writeJSON(response, http.StatusNotFound, map[string]string{"message": "Not found."})
	}
}

func (s *Server) handleTelemetry(response http.ResponseWriter, request *http.Request, context TelemetryContext) {
	defer request.Body.Close()

	var submission map[string]any
	rawBody, err := io.ReadAll(request.Body)
	if err != nil {
		respondWithError(response, NewAPIError("The contact data is invalid.", "validation"), "Unable to process request.")
		return
	}
	submission = map[string]any{}
	if len(bytes.TrimSpace(rawBody)) > 0 {
		decoder := json.NewDecoder(bytes.NewReader(rawBody))
		decoder.UseNumber()
		if err := decoder.Decode(&submission); err != nil {
			respondWithError(response, NewAPIError("The contact data is invalid.", "validation"), "Unable to process request.")
			return
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

	telemetry := CreateTelemetryEvent(
		eventName,
		detail,
		stringValue(submission["path"]),
		stringValue(submission["method"]),
		statusCode,
		context,
	)

	_ = s.telemetryCollector.RecordTelemetry(telemetry, context)
	writeJSON(response, http.StatusAccepted, map[string]any{
		"accepted":  true,
		"telemetry": telemetry,
	})
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

type Runtime struct {
	server   *http.Server
	listener net.Listener
	BaseURL  string
}

func StartRuntimeFromEnv() (*Runtime, error) {
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
		server:   server,
		listener: listener,
		BaseURL:  fmt.Sprintf("http://127.0.0.1:%d", listener.Addr().(*net.TCPAddr).Port),
	}

	go func() {
		_ = server.Serve(listener)
	}()

	return runtime, nil
}

func (r *Runtime) Shutdown(ctx context.Context) error {
	if r == nil || r.server == nil {
		return nil
	}

	return r.server.Shutdown(ctx)
}

func stringValue(value any) string {
	if text, ok := value.(string); ok {
		return text
	}

	return ""
}

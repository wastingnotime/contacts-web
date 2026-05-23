package bff

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type ContactsBackendGateway interface {
	ListContacts(context TelemetryContext) ([]ContactTransport, error)
	CreateContact(payload CreateContactPayload, context TelemetryContext) (*ContactTransport, error)
	GetContact(contactID string, context TelemetryContext) (ContactTransport, error)
	UpdateContact(contactID string, payload UpdateContactPayload, context TelemetryContext) (ContactTransport, error)
	DeleteContact(contactID string, context TelemetryContext) error
	HealthCheck(context TelemetryContext) error
}

type HTTPContactsBackendGateway struct {
	BaseURL     string
	AuthSubject string
	AuthRoles   string
	Client      *http.Client
}

func NewHTTPContactsBackendGateway(baseURL, authSubject, authRoles string, client *http.Client) *HTTPContactsBackendGateway {
	if client == nil {
		client = http.DefaultClient
	}

	return &HTTPContactsBackendGateway{
		BaseURL:     baseURL,
		AuthSubject: authSubject,
		AuthRoles:   authRoles,
		Client:      client,
	}
}

func (g *HTTPContactsBackendGateway) client() *http.Client {
	if g.Client != nil {
		return g.Client
	}

	return http.DefaultClient
}

func (g *HTTPContactsBackendGateway) requestHeaders(jsonBody bool, context TelemetryContext) http.Header {
	headers := http.Header{}
	headers.Set("Accept", "application/json")
	headers.Set("x-auth-subject", g.AuthSubject)
	headers.Set("x-auth-roles", g.AuthRoles)
	for key, value := range CreateTelemetryHeaders(context) {
		headers.Set(key, value)
	}
	if jsonBody {
		headers.Set("Content-Type", "application/json")
	}

	return headers
}

func (g *HTTPContactsBackendGateway) ListContacts(context TelemetryContext) ([]ContactTransport, error) {
	response, err := g.doRequest(http.MethodGet, "/contacts", nil, false, context)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode/100 != 2 {
		return nil, mapResponseToAPIError(response.StatusCode, "Unable to load contacts.")
	}

	var payload []ContactTransport
	if err := decodeJSON(response.Body, &payload); err != nil {
		return nil, NewAPIError("Unable to load contacts.", "validation")
	}

	return payload, nil
}

func (g *HTTPContactsBackendGateway) CreateContact(payload CreateContactPayload, context TelemetryContext) (*ContactTransport, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, NewAPIError("Unable to create contact.", "unknown")
	}

	response, err := g.doRequest(http.MethodPost, "/contacts", body, true, context)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode == http.StatusCreated {
		rawBody, err := io.ReadAll(response.Body)
		if err != nil {
			return nil, NewAPIError("Unable to create contact.", "unknown")
		}

		if len(bytes.TrimSpace(rawBody)) == 0 || string(bytes.TrimSpace(rawBody)) == "null" {
			return nil, nil
		}

		var transport ContactTransport
		if err := json.Unmarshal(rawBody, &transport); err != nil {
			return nil, NewAPIError("Unable to create contact.", "validation")
		}

		return &transport, nil
	}

	if response.StatusCode/100 != 2 {
		return nil, mapResponseToAPIError(response.StatusCode, "Unable to create contact.")
	}

	return nil, NewAPIError("Unexpected create-contact response.", "unknown")
}

func (g *HTTPContactsBackendGateway) GetContact(contactID string, context TelemetryContext) (ContactTransport, error) {
	response, err := g.doRequest(http.MethodGet, "/contacts/"+contactID, nil, false, context)
	if err != nil {
		return ContactTransport{}, err
	}
	defer response.Body.Close()

	if response.StatusCode/100 != 2 {
		return ContactTransport{}, mapResponseToAPIError(response.StatusCode, "Unable to load contact.")
	}

	var transport ContactTransport
	if err := decodeJSON(response.Body, &transport); err != nil {
		return ContactTransport{}, NewAPIError("Unable to load contact.", "validation")
	}

	return transport, nil
}

func (g *HTTPContactsBackendGateway) UpdateContact(contactID string, payload UpdateContactPayload, context TelemetryContext) (ContactTransport, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return ContactTransport{}, NewAPIError("Unable to update contact.", "unknown")
	}

	response, err := g.doRequest(http.MethodPut, "/contacts/"+contactID, body, true, context)
	if err != nil {
		return ContactTransport{}, err
	}
	defer response.Body.Close()

	if response.StatusCode/100 != 2 {
		return ContactTransport{}, mapResponseToAPIError(response.StatusCode, "Unable to update contact.")
	}

	var transport ContactTransport
	if err := decodeJSON(response.Body, &transport); err != nil {
		return ContactTransport{}, NewAPIError("Unable to update contact.", "validation")
	}

	return transport, nil
}

func (g *HTTPContactsBackendGateway) DeleteContact(contactID string, context TelemetryContext) error {
	response, err := g.doRequest(http.MethodDelete, "/contacts/"+contactID, nil, false, context)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode == http.StatusNoContent {
		return nil
	}

	if response.StatusCode/100 != 2 {
		return mapResponseToAPIError(response.StatusCode, "Unable to delete contact.")
	}

	return nil
}

func (g *HTTPContactsBackendGateway) HealthCheck(context TelemetryContext) error {
	response, err := g.doRequest(http.MethodGet, "/healthz", nil, false, context)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode/100 != 2 {
		return NewAPIError("Unable to check backend health.", "unknown")
	}

	return nil
}

func (g *HTTPContactsBackendGateway) doRequest(method, path string, body []byte, jsonBody bool, context TelemetryContext) (*http.Response, error) {
	request, err := http.NewRequest(method, g.BaseURL+path, bytes.NewReader(body))
	if err != nil {
		return nil, NewAPIError("Unable to process request.", "unknown")
	}

	request.Header = g.requestHeaders(jsonBody, context)

	response, err := g.client().Do(request)
	if err != nil {
		return nil, NewAPIError("Unable to process request.", "unknown")
	}

	return response, nil
}

func mapResponseToAPIError(statusCode int, fallbackMessage string) error {
	switch statusCode {
	case http.StatusBadRequest:
		return NewAPIError("The contact data is invalid.", "validation")
	case http.StatusForbidden:
		return NewAPIError("You are not allowed to access contacts right now.", "authorization")
	case http.StatusNotFound:
		return NewAPIError("That contact could not be found.", "not_found")
	case http.StatusConflict:
		return NewAPIError("A contact with this data already exists.", "duplicate")
	default:
		return NewAPIError(fallbackMessage, "unknown")
	}
}

func decodeJSON(body io.Reader, target any) error {
	decoder := json.NewDecoder(body)
	if err := decoder.Decode(target); err != nil {
		return err
	}

	return nil
}

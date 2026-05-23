package bff

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHTTPContactsBackendGateway(t *testing.T) {
	telemetryContext := TelemetryContext{
		ServiceName: "contacts-bff",
		FeatureName: "contacts-web",
		JourneyName: "contacts-web-journey",
		AppVersion:  "2026.04.22",
		Environment: "test",
		TraceID:     "0123456789abcdef0123456789abcdef",
		TraceParent: "00-0123456789abcdef0123456789abcdef-0123456789abcdef-01",
	}

	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		if request.Header.Get("x-auth-subject") != "admin-user" {
			t.Errorf("missing auth subject header")
		}
		if request.Header.Get("x-auth-roles") != "admin" {
			t.Errorf("missing auth roles header")
		}
		if request.Header.Get("traceparent") != telemetryContext.TraceParent {
			t.Errorf("missing traceparent header")
		}

		switch {
		case request.Method == http.MethodGet && request.URL.Path == "/contacts":
			writeJSON(response, http.StatusOK, []ContactTransport{
				{
					ID:          "contact-1",
					FirstName:   "Ada",
					LastName:    "Lovelace",
					PhoneNumber: "5550001",
				},
			})
		case request.Method == http.MethodPost && request.URL.Path == "/contacts":
			body, err := io.ReadAll(request.Body)
			if err != nil {
				t.Errorf("expected request body: %v", err)
			}

			var payload map[string]any
			if err := json.Unmarshal(body, &payload); err != nil {
				t.Errorf("expected valid json body: %v", err)
			}

			if payload["first_name"] != "Grace" || payload["last_name"] != "Hopper" || payload["phone_number"] != "555-0100" {
				t.Errorf("unexpected create payload: %#v", payload)
			}

			writeJSON(response, http.StatusCreated, ContactTransport{
				ID:          "contact-2",
				FirstName:   "Grace",
				LastName:    "Hopper",
				PhoneNumber: "555-0100",
			})
		case request.Method == http.MethodGet && request.URL.Path == "/contacts/contact-1":
			writeJSON(response, http.StatusOK, ContactTransport{
				ID:          "contact-1",
				FirstName:   "Ada",
				LastName:    "Lovelace",
				PhoneNumber: "5550001",
			})
		case request.Method == http.MethodPut && request.URL.Path == "/contacts/contact-1":
			body, err := io.ReadAll(request.Body)
			if err != nil {
				t.Errorf("expected request body: %v", err)
			}

			var payload map[string]any
			if err := json.Unmarshal(body, &payload); err != nil {
				t.Errorf("expected valid json body: %v", err)
			}

			if payload["id"] != "contact-1" {
				t.Errorf("expected contact id in update payload, got %#v", payload)
			}

			writeJSON(response, http.StatusOK, ContactTransport{
				ID:          "contact-1",
				FirstName:   "Ada",
				LastName:    "Byron",
				PhoneNumber: "5550009",
			})
		case request.Method == http.MethodDelete && request.URL.Path == "/contacts/contact-1":
			response.WriteHeader(http.StatusNoContent)
		case request.Method == http.MethodGet && request.URL.Path == "/healthz":
			response.WriteHeader(http.StatusOK)
		default:
			t.Errorf("unexpected request: %s %s", request.Method, request.URL.Path)
		}
	}))
	defer server.Close()

	gateway := NewHTTPContactsBackendGateway(server.URL, "admin-user", "admin", server.Client())

	contacts, err := gateway.ListContacts(telemetryContext)
	if err != nil {
		t.Fatalf("expected list contacts to succeed: %v", err)
	}
	if len(contacts) != 1 || contacts[0].ID != "contact-1" {
		t.Fatalf("unexpected contacts payload: %#v", contacts)
	}

	created, err := gateway.CreateContact(CreateContactPayload{
		FirstName:   "Grace",
		LastName:    "Hopper",
		PhoneNumber: "555-0100",
	}, telemetryContext)
	if err != nil {
		t.Fatalf("expected create contact to succeed: %v", err)
	}
	if created == nil || created.ID != "contact-2" {
		t.Fatalf("unexpected create response: %#v", created)
	}

	contact, err := gateway.GetContact("contact-1", telemetryContext)
	if err != nil {
		t.Fatalf("expected get contact to succeed: %v", err)
	}
	if contact.FirstName != "Ada" {
		t.Fatalf("unexpected contact payload: %#v", contact)
	}

	updated, err := gateway.UpdateContact("contact-1", UpdateContactPayload{
		ID:          "contact-1",
		FirstName:   "Ada",
		LastName:    "Byron",
		PhoneNumber: "5550009",
	}, telemetryContext)
	if err != nil {
		t.Fatalf("expected update contact to succeed: %v", err)
	}
	if updated.LastName != "Byron" {
		t.Fatalf("unexpected update response: %#v", updated)
	}

	if err := gateway.DeleteContact("contact-1", telemetryContext); err != nil {
		t.Fatalf("expected delete contact to succeed: %v", err)
	}

	if err := gateway.HealthCheck(telemetryContext); err != nil {
		t.Fatalf("expected health check to succeed: %v", err)
	}
}

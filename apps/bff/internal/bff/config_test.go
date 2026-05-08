package bff

import "testing"

func TestConfigDefaults(t *testing.T) {
	t.Setenv("CONTACTS_WEB_BFF_HOST", "")
	t.Setenv("CONTACTS_WEB_BFF_PORT", "")
	t.Setenv("CONTACTS_BACKEND_BASE_URL", "")
	t.Setenv("CONTACTS_TELEMETRY_COLLECTOR_BASE_URL", "")
	t.Setenv("CONTACTS_BACKEND_AUTH_SUBJECT", "")
	t.Setenv("CONTACTS_BACKEND_AUTH_ROLES", "")

	if got := GetContactsWebBffHost(); got != DefaultContactsWebBffHost {
		t.Fatalf("expected default host %q, got %q", DefaultContactsWebBffHost, got)
	}
	if got := GetContactsWebBffPort(); got != DefaultContactsWebBffPort {
		t.Fatalf("expected default port %d, got %d", DefaultContactsWebBffPort, got)
	}
	if got := GetContactsBackendBaseURL(); got != DefaultContactsBackendBaseURL {
		t.Fatalf("expected default backend base url %q, got %q", DefaultContactsBackendBaseURL, got)
	}
	if got := GetContactsTelemetryCollectorBaseURL(); got != DefaultContactsTelemetryCollectorBaseURL {
		t.Fatalf("expected default telemetry collector base url %q, got %q", DefaultContactsTelemetryCollectorBaseURL, got)
	}
	if got := GetContactsBackendAuthSubject(); got != DefaultContactsBackendAuthSubject {
		t.Fatalf("expected default auth subject %q, got %q", DefaultContactsBackendAuthSubject, got)
	}
	if got := GetContactsBackendAuthRoles(); got != DefaultContactsBackendAuthRoles {
		t.Fatalf("expected default auth roles %q, got %q", DefaultContactsBackendAuthRoles, got)
	}
}

func TestConfigOverrides(t *testing.T) {
	t.Setenv("CONTACTS_WEB_BFF_HOST", "127.0.0.1")
	t.Setenv("CONTACTS_WEB_BFF_PORT", "4123")
	t.Setenv("CONTACTS_BACKEND_BASE_URL", "http://127.0.0.1:9001")
	t.Setenv("CONTACTS_TELEMETRY_COLLECTOR_BASE_URL", "http://127.0.0.1:9002")
	t.Setenv("CONTACTS_BACKEND_AUTH_SUBJECT", "ops-user")
	t.Setenv("CONTACTS_BACKEND_AUTH_ROLES", "admin,auditor")

	if got := GetContactsWebBffHost(); got != "127.0.0.1" {
		t.Fatalf("expected host override, got %q", got)
	}
	if got := GetContactsWebBffPort(); got != 4123 {
		t.Fatalf("expected port override, got %d", got)
	}
	if got := GetContactsBackendBaseURL(); got != "http://127.0.0.1:9001" {
		t.Fatalf("expected backend base url override, got %q", got)
	}
	if got := GetContactsTelemetryCollectorBaseURL(); got != "http://127.0.0.1:9002" {
		t.Fatalf("expected telemetry collector base url override, got %q", got)
	}
	if got := GetContactsBackendAuthSubject(); got != "ops-user" {
		t.Fatalf("expected auth subject override, got %q", got)
	}
	if got := GetContactsBackendAuthRoles(); got != "admin,auditor" {
		t.Fatalf("expected auth roles override, got %q", got)
	}
}

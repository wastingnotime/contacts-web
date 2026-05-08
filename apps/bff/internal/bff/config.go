package bff

import (
	"os"
	"strconv"
)

const (
	DefaultContactsWebBffHost                = "0.0.0.0"
	DefaultContactsWebBffPort                = 4010
	DefaultContactsBackendBaseURL            = "http://127.0.0.1:8010"
	DefaultContactsTelemetryCollectorBaseURL = "http://127.0.0.1:4321"
	DefaultContactsBackendAuthSubject        = "admin-user"
	DefaultContactsBackendAuthRoles          = "admin"
)

func getEnv(name, fallback string) string {
	value := os.Getenv(name)
	if value == "" {
		return fallback
	}

	return value
}

func getEnvInt(name string, fallback int) int {
	value := os.Getenv(name)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}

	return parsed
}

func GetContactsWebBffHost() string {
	return getEnv("CONTACTS_WEB_BFF_HOST", DefaultContactsWebBffHost)
}

func GetContactsWebBffPort() int {
	return getEnvInt("CONTACTS_WEB_BFF_PORT", DefaultContactsWebBffPort)
}

func GetContactsBackendBaseURL() string {
	return getEnv("CONTACTS_BACKEND_BASE_URL", DefaultContactsBackendBaseURL)
}

func GetContactsTelemetryCollectorBaseURL() string {
	return getEnv("CONTACTS_TELEMETRY_COLLECTOR_BASE_URL", DefaultContactsTelemetryCollectorBaseURL)
}

func GetContactsBackendAuthSubject() string {
	return getEnv("CONTACTS_BACKEND_AUTH_SUBJECT", DefaultContactsBackendAuthSubject)
}

func GetContactsBackendAuthRoles() string {
	return getEnv("CONTACTS_BACKEND_AUTH_ROLES", DefaultContactsBackendAuthRoles)
}

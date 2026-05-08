package bff

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
	"time"
)

const (
	defaultTelemetryServiceName = "contacts-spa"
	defaultTelemetryBffName     = "contacts-bff"
	defaultTelemetryFeatureName = "contacts-web"
	defaultTelemetryJourneyName = "contacts-web-journey"
	defaultTelemetryAppVersion  = "dev"
	defaultTelemetryEnvironment = "local"
	defaultTraceFlags           = "01"
)

func randomHex(byteCount int) string {
	if byteCount <= 0 {
		return ""
	}

	buffer := make([]byte, byteCount)
	if _, err := rand.Read(buffer); err != nil {
		for index := range buffer {
			buffer[index] = byte(index*31 + 17)
		}
	}

	return hex.EncodeToString(buffer)
}

func CreateTraceID() string {
	return randomHex(16)
}

func CreateSpanID() string {
	return randomHex(8)
}

func CreateTraceParent(traceID, spanID string, sampled bool) string {
	flags := "00"
	if sampled {
		flags = defaultTraceFlags
	}

	return "00-" + traceID + "-" + spanID + "-" + flags
}

func CreateContactsTelemetryContext() TelemetryContext {
	traceID := CreateTraceID()
	spanID := CreateSpanID()

	return TelemetryContext{
		ServiceName: defaultTelemetryServiceName,
		FeatureName: defaultTelemetryFeatureName,
		JourneyName: defaultTelemetryJourneyName,
		AppVersion:  defaultTelemetryAppVersion,
		Environment: defaultTelemetryEnvironment,
		TraceID:     traceID,
		SpanID:      spanID,
		TraceParent: CreateTraceParent(traceID, spanID, true),
	}
}

func ReadTelemetryContextFromHeaders(headers http.Header) TelemetryContext {
	traceParent := headers.Get("traceparent")
	if traceParent == "" {
		traceID := CreateTraceID()
		spanID := CreateSpanID()
		traceParent = CreateTraceParent(traceID, spanID, true)
	}

	parts := strings.Split(traceParent, "-")
	traceID := ""
	if len(parts) > 1 {
		traceID = parts[1]
	}
	if headerTraceID := headers.Get("x-contacts-trace-id"); headerTraceID != "" {
		traceID = headerTraceID
	}
	if traceID == "" {
		traceID = CreateTraceID()
	}

	return TelemetryContext{
		ServiceName: headerOrDefault(headers, "x-contacts-service-name", defaultTelemetryServiceName),
		FeatureName: headerOrDefault(headers, "x-contacts-feature-name", defaultTelemetryFeatureName),
		JourneyName: headerOrDefault(headers, "x-contacts-journey-name", defaultTelemetryJourneyName),
		AppVersion:  headerOrDefault(headers, "x-contacts-app-version", defaultTelemetryAppVersion),
		Environment: headerOrDefault(headers, "x-contacts-environment", defaultTelemetryEnvironment),
		TraceID:     traceID,
		TraceParent: traceParent,
	}
}

func CreateChildTelemetryContext(parent TelemetryContext, serviceName string) TelemetryContext {
	if serviceName == "" {
		serviceName = defaultTelemetryBffName
	}

	traceID := parent.TraceID
	if traceID == "" {
		traceID = CreateTraceID()
	}
	spanID := CreateSpanID()

	return TelemetryContext{
		ServiceName: serviceName,
		FeatureName: parent.FeatureName,
		JourneyName: parent.JourneyName,
		AppVersion:  parent.AppVersion,
		Environment: parent.Environment,
		TraceID:     traceID,
		SpanID:      spanID,
		TraceParent: CreateTraceParent(traceID, spanID, true),
	}
}

func CreateTelemetryHeaders(context TelemetryContext) map[string]string {
	resolved := context
	if resolved.ServiceName == "" {
		resolved.ServiceName = defaultTelemetryServiceName
	}
	if resolved.FeatureName == "" {
		resolved.FeatureName = defaultTelemetryFeatureName
	}
	if resolved.JourneyName == "" {
		resolved.JourneyName = defaultTelemetryJourneyName
	}
	if resolved.AppVersion == "" {
		resolved.AppVersion = defaultTelemetryAppVersion
	}
	if resolved.Environment == "" {
		resolved.Environment = defaultTelemetryEnvironment
	}
	if resolved.TraceID == "" {
		resolved.TraceID = CreateTraceID()
	}
	if resolved.TraceParent == "" {
		resolved.TraceParent = CreateTraceParent(resolved.TraceID, CreateSpanID(), true)
	}

	return map[string]string{
		"traceparent":             resolved.TraceParent,
		"x-contacts-service-name": resolved.ServiceName,
		"x-contacts-feature-name": resolved.FeatureName,
		"x-contacts-journey-name": resolved.JourneyName,
		"x-contacts-app-version":  resolved.AppVersion,
		"x-contacts-environment":  resolved.Environment,
		"x-contacts-trace-id":     resolved.TraceID,
	}
}

func CreateTelemetryEvent(eventName string, detail any, path string, method string, statusCode int, context TelemetryContext) TelemetryEvent {
	resolved := context
	if resolved.ServiceName == "" {
		resolved.ServiceName = defaultTelemetryServiceName
	}
	if resolved.FeatureName == "" {
		resolved.FeatureName = defaultTelemetryFeatureName
	}
	if resolved.JourneyName == "" {
		resolved.JourneyName = defaultTelemetryJourneyName
	}
	if resolved.AppVersion == "" {
		resolved.AppVersion = defaultTelemetryAppVersion
	}
	if resolved.Environment == "" {
		resolved.Environment = defaultTelemetryEnvironment
	}
	if resolved.TraceID == "" {
		resolved.TraceID = CreateTraceID()
	}
	if resolved.TraceParent == "" {
		resolved.TraceParent = CreateTraceParent(resolved.TraceID, CreateSpanID(), true)
	}

	return TelemetryEvent{
		EventName:   eventName,
		Path:        path,
		Method:      method,
		StatusCode:  statusCode,
		Detail:      detail,
		ServiceName: resolved.ServiceName,
		FeatureName: resolved.FeatureName,
		JourneyName: resolved.JourneyName,
		AppVersion:  resolved.AppVersion,
		Environment: resolved.Environment,
		TraceID:     resolved.TraceID,
		TraceParent: resolved.TraceParent,
		Timestamp:   time.Now().UTC().Format(time.RFC3339Nano),
	}
}

func headerOrDefault(headers http.Header, name, fallback string) string {
	if value := headers.Get(name); value != "" {
		return value
	}

	return fallback
}

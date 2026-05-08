package bff

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	sdkresource "go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)

func newNoopRuntimeObservability() *RuntimeObservability {
	return &RuntimeObservability{
		tracer: trace.NewNoopTracerProvider().Tracer(defaultTelemetryBffName),
	}
}

func newRuntimeObservabilityFromEnv() (*RuntimeObservability, error) {
	otlpEndpoint := strings.TrimSpace(getEnv("OTEL_EXPORTER_OTLP_ENDPOINT", ""))
	if otlpEndpoint == "" {
		return newNoopRuntimeObservability(), nil
	}

	parsed, err := url.Parse(otlpEndpoint)
	if err != nil {
		return nil, fmt.Errorf("invalid OTEL_EXPORTER_OTLP_ENDPOINT: %w", err)
	}

	endpoint := parsed.Host
	if endpoint == "" {
		endpoint = parsed.Path
	}
	if endpoint == "" {
		return nil, fmt.Errorf("invalid OTEL_EXPORTER_OTLP_ENDPOINT: missing host")
	}

	urlPath := parsed.Path
	if urlPath == "" || urlPath == "/" {
		urlPath = "/v1/traces"
	}

	exporter, err := otlptracehttp.New(context.Background(),
		otlptracehttp.WithEndpoint(endpoint),
		otlptracehttp.WithURLPath(urlPath),
		otlptracehttp.WithInsecure(),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to create trace exporter: %w", err)
	}

	resource, err := sdkresource.New(context.Background(),
		sdkresource.WithAttributes(
			attribute.String("service.name", defaultTelemetryBffName),
			attribute.String("service.version", defaultTelemetryAppVersion),
			attribute.String("deployment.environment", defaultTelemetryEnvironment),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to create trace resource: %w", err)
	}

	provider := sdktrace.NewTracerProvider(
		sdktrace.WithResource(resource),
		sdktrace.WithBatcher(exporter),
	)

	return &RuntimeObservability{
		tracer: provider.Tracer(defaultTelemetryBffName),
		shutdown: func() error {
			return provider.Shutdown(context.Background())
		},
	}, nil
}

func (o *RuntimeObservability) Tracer() trace.Tracer {
	if o == nil || o.tracer == nil {
		return trace.NewNoopTracerProvider().Tracer(defaultTelemetryBffName)
	}

	return o.tracer
}

func (o *RuntimeObservability) Shutdown() error {
	if o == nil || o.shutdown == nil {
		return nil
	}

	return o.shutdown()
}

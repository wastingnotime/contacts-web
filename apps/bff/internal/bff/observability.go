package bff

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/url"
	"strings"

	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	sdklog "go.opentelemetry.io/otel/sdk/log"
	sdkresource "go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)

var noopRuntimeLogger = slog.New(slog.NewTextHandler(io.Discard, nil))

func newNoopRuntimeObservability() *RuntimeObservability {
	return &RuntimeObservability{
		tracer: trace.NewNoopTracerProvider().Tracer(defaultTelemetryBffName),
		logger: noopRuntimeLogger,
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

	resource, err := sdkresource.New(context.Background(),
		sdkresource.WithAttributes(
			attribute.String("service.name", defaultTelemetryBffName),
			attribute.String("service.version", defaultTelemetryAppVersion),
			attribute.String("deployment.environment", defaultTelemetryEnvironment),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to create telemetry resource: %w", err)
	}

	tracePath := parsed.Path
	if tracePath == "" || tracePath == "/" {
		tracePath = "/v1/traces"
	}
	traceExporter, err := otlptracehttp.New(context.Background(),
		otlptracehttp.WithEndpoint(endpoint),
		otlptracehttp.WithURLPath(tracePath),
		otlptracehttp.WithInsecure(),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to create trace exporter: %w", err)
	}
	traceProvider := sdktrace.NewTracerProvider(
		sdktrace.WithResource(resource),
		sdktrace.WithBatcher(traceExporter),
	)

	logPath := parsed.Path
	if logPath == "" || logPath == "/" {
		logPath = "/v1/logs"
	}
	logExporter, err := otlploghttp.New(context.Background(),
		otlploghttp.WithEndpoint(endpoint),
		otlploghttp.WithURLPath(logPath),
		otlploghttp.WithInsecure(),
	)
	if err != nil {
		_ = traceProvider.Shutdown(context.Background())
		return nil, fmt.Errorf("unable to create log exporter: %w", err)
	}
	logProvider := sdklog.NewLoggerProvider(
		sdklog.WithResource(resource),
		sdklog.WithProcessor(sdklog.NewBatchProcessor(logExporter)),
	)

	return &RuntimeObservability{
		tracer: traceProvider.Tracer(defaultTelemetryBffName),
		logger: otelslog.NewLogger(
			defaultTelemetryBffName,
			otelslog.WithLoggerProvider(logProvider),
		),
		shutdown: func() error {
			traceErr := traceProvider.Shutdown(context.Background())
			logErr := logProvider.Shutdown(context.Background())
			if traceErr != nil {
				return traceErr
			}
			return logErr
		},
	}, nil
}

func (o *RuntimeObservability) Tracer() trace.Tracer {
	if o == nil || o.tracer == nil {
		return trace.NewNoopTracerProvider().Tracer(defaultTelemetryBffName)
	}

	return o.tracer
}

func (o *RuntimeObservability) Logger() *slog.Logger {
	if o == nil || o.logger == nil {
		return noopRuntimeLogger
	}

	return o.logger
}

func (o *RuntimeObservability) Shutdown() error {
	if o == nil || o.shutdown == nil {
		return nil
	}

	return o.shutdown()
}

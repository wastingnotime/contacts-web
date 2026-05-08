# Implementation: Restore Go BFF Request Tracing

## Summary

Restored the missing BFF trace span after the Python-to-Go migration.

## Changes

- added an OpenTelemetry runtime helper for the Go BFF
- extracted incoming W3C `traceparent` context before starting the request span
- started a real request span for every `/api` request and exported it through OTLP when `OTEL_EXPORTER_OTLP_ENDPOINT` is configured
- derived downstream BFF telemetry context from the live request span so backend calls continue the same trace
- recorded browser telemetry as a span event on the BFF request span
- captured request status and error status on the exported span
- added a deterministic test that verifies the exported span and the propagated backend trace ID

## Validation

- `go test ./apps/bff/...`

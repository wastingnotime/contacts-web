# BFF OTel Context And Metrics Implementation

## Summary

Implemented the BFF-side observability follow-up for the Axiom 2-dataset protocol alignment campaign.

The BFF now:

- extracts W3C `traceparent` context from incoming browser-facing requests before starting request spans
- continues trace context into the BFF-to-API telemetry context
- records request count, request latency, and error count metrics through OpenTelemetry instruments
- records dependency latency for calls to `axiom-exp-contacts`
- exports metrics to the collector `/v1/metrics` path when `OTEL_EXPORTER_OTLP_ENDPOINT` is configured

## Boundary

Browser telemetry remains best-effort and still enters through the BFF. The browser does not receive Axiom credentials or dataset-routing configuration.

The BFF exports OpenTelemetry to the shared collector. Axiom dataset routing remains an infrastructure concern.

## Verification

Commands run:

```bash
npm test -- --run tests/bff/contactsWebBffServer.test.ts tests/contracts/httpContactsApiClient.test.js
npm test
npm run build
```

Results:

- focused telemetry tests passed with 6 tests
- full Vitest suite passed with 57 tests
- production web build completed successfully

## Notes

The local `node_modules/@opentelemetry` tree had root-owned files, so package metadata was updated with `npm install --package-lock-only --ignore-scripts` after a normal install attempt failed on local filesystem permissions.

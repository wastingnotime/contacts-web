# Implementation: Browser Telemetry Through The BFF

## Summary

The browser-facing `/api/telemetry` route in the BFF now records browser telemetry as a BFF span event while the BFF itself owns the exported request span for downstream propagation.

## Changes

- added a BFF-side OTLP trace provider so the BFF request span is exported to the shared collector
- made the BFF request span the trace root for backend propagation
- kept the browser telemetry acceptance at `202` so telemetry remains best-effort from the browser's point of view
- recorded browser telemetry as a span event on the BFF request span
- kept the best-effort collector relay path in place for the browser telemetry payload
- updated the BFF tests to assert BFF-owned trace context and span events

## Validation

- `npx vitest run tests/bff/config.test.ts tests/bff/contactsWebBffServer.test.ts tests/bff/httpContactsBackendGateway.test.ts tests/contracts/httpContactsApiClient.test.js tests/contracts/createContactsApiClient.test.js`

# Telemetry Contract

The telemetry contract defines what the browser reports about interaction, routing, and failure conditions.

## Stable Semantics

- telemetry context includes trace IDs, span IDs, service name, feature name, journey name, app version, and environment
- request headers carry `traceparent` and `x-contacts-*` metadata
- bootstrap records an initial `page_view`
- route changes record `route_change`
- telemetry events can be posted through the BFF endpoint at `/telemetry`
- BFF runtime logs can be exported as OTLP logs through the shared collector when observability is enabled
- telemetry should describe the user-visible runtime, not hidden component mechanics

## Current Repository Surfaces

- `src/shared/telemetry/contactsTelemetry.js`
- `src/client/api/httpContactsApiClient.js`
- `src/client/bootstrap/bootstrapContactsApp.jsx`
- `tests/contracts/httpContactsApiClient.test.js`

## Boundary Rule

Telemetry should describe the user-visible runtime, not hidden component mechanics.

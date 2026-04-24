# Observability Pipeline Implementation

Implemented the minimum observability pipeline slice for `contacts-web`.

## Scope

- added a shared telemetry context helper under `src/shared/telemetry/`
- propagated trace and metadata headers from the browser client into the BFF request path
- made the BFF own the exported request trace and forward that BFF trace context to the backend gateway
- added a `/api/telemetry` ingestion path on the BFF server
- recorded browser page-view telemetry through the BFF as a BFF span event instead of directly to the backend
- recorded browser route-change telemetry from the SPA shell through the same BFF path
- kept the SPA, BFF, and backend testable as separate layers while still joining them by shared telemetry metadata and trace context

## Validation

- `npm test`
- `npm run build`

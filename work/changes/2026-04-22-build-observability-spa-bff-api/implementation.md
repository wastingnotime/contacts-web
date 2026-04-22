# Observability Pipeline Implementation

Implemented the minimum observability pipeline slice for `contacts-web`.

## Scope

- added a shared telemetry context helper under `src/shared/telemetry/`
- propagated trace and metadata headers from the browser client into the BFF
- forwarded the same telemetry context from the BFF to the backend gateway
- added a `/api/telemetry` ingestion path on the BFF server
- recorded browser page-view telemetry through the BFF instead of directly to the backend
- kept the SPA, BFF, and backend testable as separate layers while still joining them by shared telemetry metadata

## Validation

- `npm test`
- `npm run build`


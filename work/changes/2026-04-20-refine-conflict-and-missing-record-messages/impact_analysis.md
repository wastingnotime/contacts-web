# Impact Analysis

## Purpose

Document the architectural pressure created by making duplicate and missing-record responses explicit before implementation begins.

## Main Tension

The browser already receives backend error codes for duplicate and missing records, but the user-facing copy is not yet deliberately shaped around those cases, even with the BFF in the request path.

That creates a focused implementation pressure:

- duplicate creates should read as a clear conflict state
- missing edit or delete targets should read as a clear missing-record state
- existing authorization, validation, and pending-state behavior should stay intact

## Contract Pressure

The backend contract does not need to change. The browser just needs to translate the existing error categories into clearer user-facing copy while preserving the BFF-mediated request path.

The next slice should therefore establish:

- a shared contacts error-message boundary that keeps `duplicate` and `not_found` distinct
- explicit browser copy for create, edit, and delete cases that hit those responses
- tests that prove the intended messages surface deterministically

## Areas Impacted

- `src/client/contracts/contactErrors.js`
- client pages that render create, edit, and delete failures
- client tests under `tests/client/`

## Refine Decision

Keep the conflict and missing-record messages local and small:

- no new error taxonomy
- no backend changes
- no route redesign
- no change to the BFF request boundary

## Follow-Up

- build the duplicate and missing-record messaging into the shared contacts error helper
- verify the affected create, edit, and delete paths with deterministic client tests

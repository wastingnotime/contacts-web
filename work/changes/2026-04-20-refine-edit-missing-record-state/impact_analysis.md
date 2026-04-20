# Impact Analysis

## Purpose

Document the architectural pressure created by making the edit route's missing-record state explicit before implementation begins.

## Main Tension

The edit page already loads contact data and already knows when the target contact is missing, but it still renders that case like a generic failure.

That creates a focused implementation pressure:

- the browser should distinguish a stale edit route from a transient load or validation problem
- the page should provide a clear way back to the list
- existing submit and error handling should remain intact

## Contract Pressure

The backend contract does not need to change. The browser just needs a more deliberate missing-record presentation for the edit load path.

The next slice should therefore establish:

- a dedicated missing-record state on the edit route
- an obvious back-to-list action when the target contact is gone
- tests that prove the route state is rendered deterministically

## Areas Impacted

- `src/client/pages/EditContactPage.jsx`
- client tests under `tests/client/`

## Refine Decision

Keep the missing-record route state local and small:

- no global error manager
- no backend changes
- no route redesign

## Follow-Up

- build a dedicated edit-route missing-record state
- verify the stale-route path with deterministic client tests

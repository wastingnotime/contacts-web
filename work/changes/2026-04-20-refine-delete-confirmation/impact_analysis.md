# Impact Analysis

## Purpose

Document the architectural pressure created by adding delete confirmation before implementation begins.

## Main Tension

Delete is currently immediate. That makes the workflow fast, but it also makes accidental destructive clicks too easy.

That creates a focused implementation pressure:

- the browser needs a confirmation state before it calls the backend
- cancel must be a true no-op with no backend request
- confirm must preserve the existing delete contract and error handling

## Contract Pressure

The backend contract does not need to change. The browser just needs a deliberate step before it uses the existing delete method.

The next slice should therefore establish:

- a local confirmation state per contact row
- a confirm/cancel flow
- tests that prove cancel does not delete and confirm does
- the current implementation already uses inline row-level confirm and cancel actions

## Areas Impacted

- `src/client/pages/ContactsListPage.jsx`
- frontend client tests under `tests/`

## Refine Decision

Keep the confirmation local and small:

- no global modal framework
- no backend changes
- no undo semantics

## Follow-Up

- build the delete confirmation state into the list page
- verify both confirmation and cancellation paths with deterministic tests

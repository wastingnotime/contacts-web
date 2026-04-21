# Slice: Solid Contacts Isolated Mock Transport

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice replaces the custom backend-free path with an explicit MSW-backed mock transport boundary so isolated mode uses the same HTTP-facing client shape as live mode while remaining deterministic and backend-free.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- MSW-powered browser mock transport for isolated mode
- MSW-powered node test server for deterministic client tests

Early-phase rule:

- `build` should make isolated mode use a real mock transport boundary instead of a bespoke in-memory client
- `build` should not change the live contacts backend contract
- live contract interaction should remain covered by the existing HTTP API client path and contract tests

## Architecture Mode

- frontend-first client/server split
- explicit transport adapter between UI state and backend payloads
- selectable runtime mode: live backend or isolated mock transport

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- isolated mode is a development and testability path, not a replacement for the live contract

## Discovery Scope

Included in this slice:

- start an MSW worker in isolated browser mode
- expose the same contacts HTTP routes through deterministic mock handlers
- support deterministic contact fixtures across list, create, edit, and delete workflows
- keep the live backend path available and unchanged

Contract map for this slice:

- isolated mode still uses `ContactsApiClient`-shaped HTTP requests
- isolated mode routes those requests to mock handlers instead of the live backend
- live mode continues to use the existing HTTP client and backend base URL
- the mode boundary stays explicit so test and development paths do not drift together

Excluded from this slice:

- changes to backend persistence or authorization
- changes to contact business rules
- login, session storage, or claims handling
- search, sorting controls, filtering, and pagination
- release or expose work

## Why This Slice Next

The current isolated mode works, but it does not yet express the mock transport boundary directly.

This slice resolves the next pressure:

- isolated mode should look and behave like transport, not like a second client implementation
- browser development should be able to reuse the same HTTP-facing adapter surface as live mode
- tests should validate the isolated mock boundary without a live backend

The slice keeps the rest of the client architecture intact:

- live contacts behavior remains the default product path
- explicit transport mapping still exists
- testability improves without redefining backend truth

Starting with a larger offline architecture would be heavier than needed.
Starting with a custom mock client would keep the transport boundary implicit.

## Use-Case Contract

### Use Case: `StartContactsMockTransport`

Input:

- isolated mode active in the browser or test harness

Success result:

- MSW intercepts contacts HTTP requests
- the UI can load and mutate contacts deterministically without a live backend

Failure conditions:

- mock transport fails to start
- the mock transport does not intercept requests consistently

### Use Case: `ResetContactsMockTransportState`

Input:

- test or runtime reset between isolated-mode runs

Success result:

- mock contacts return to the deterministic seed state

Failure conditions:

- mock state leaks between runs
- a prior test changes later test outcomes

### Contract Map: `ContactsApiClient`

Methods:

- `list_contacts()`
- `create_contact(draft)`
- `get_contact(contact_id)`
- `update_contact(contact_id, draft)`
- `delete_contact(contact_id)`

Expected backend inputs and outputs:

- live mode continues to use the existing HTTP client
- isolated mode continues to exercise the same request shapes against mock handlers
- mock responses should mirror the current contacts contract closely enough for UI work and deterministic tests

Failure surface:

- mock handler mismatch
- transport startup failure
- accidental live backend calls while isolated mode is active
- live transport mismatch remains a separate contract test concern

## Main Business Rules

- isolated mock transport must be deterministic
- isolated mock transport must not depend on a live backend
- live backend behavior must remain explicit and separate
- mock transport should support UI development and specification, not redefine contacts truth

## Client Model Shape Hypothesis

Expected initial concepts:

- mock transport startup
- deterministic MSW handlers
- shared isolated fixture state
- runtime mode selection

Possible supporting concepts if useful during build:

- a browser worker startup seam
- a test server startup seam
- reusable contacts fixture helpers and reset hooks

The slice should avoid introducing a heavy state-management system unless it clarifies behavior materially.

## Required Ports

- `ContactsApiClient`
  - live contacts requests in live mode
  - identical HTTP-facing calls in isolated mode
- `MockTransport`
  - browser worker and node test server boundaries for isolated mode
- reset boundary
  - restore deterministic fixture state between runs

Optional ports:

- local preview tooling for UI inspection

## Interface Expectations

The browser interface should continue to include:

- contacts list
- create contact
- edit contact
- delete contact

The interface should make these states explicit:

- live mode active
- isolated mode active
- deterministic mock data visible in isolated mode

## Initial Test Plan

Client tests should specify:

- isolated mode renders current workflows with mock transport active
- isolated mode uses deterministic mock responses
- mock state resets between tests
- live mode still uses the existing contacts API client
- mode boundaries are visible and not ambiguous

Contract-focused tests should specify:

- live mode still uses the existing client contract
- isolated mode does not call the live backend client
- mock transport responds with the expected HTTP-shaped payloads

## Scenario Definition

Scenario name:

- `web_user_develops_and_inspects_contacts_ui_without_backend`

Scenario steps:

1. start the UI in isolated mode
2. open the contacts list
3. inspect edge states or interact with a contact form
4. verify the UI behaves deterministically without backend setup

## Done Criteria

- isolated mode is explicit
- isolated mode uses a real mock transport boundary
- isolated mode is deterministic
- live backend behavior remains separate
- UI development and edge-state inspection work without backend setup

## Notes For Build

- keep the mode boundary visible
- do not let isolated mocks become the source of business truth
- preserve the live contacts API client path

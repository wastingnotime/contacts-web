# Slice: Solid Contacts Isolated Mode

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice adds an explicit isolated mode so the contacts UI can be exercised without a live backend during development, edge-state inspection, and deterministic testing.
The current implementation already exposes that isolated mode through the app bootstrap and MSW-backed transport path.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- deterministic mock transport boundary for isolated mode

Early-phase rule:

- `build` should add a backend-free isolated path for UI iteration
- `build` should not change the live contacts backend contract
- live contract interaction should remain covered by the existing API client path and contract tests

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

- expose an explicit isolated mode for UI-only interaction
- provide deterministic mock responses for the current contacts workflows
- keep the existing live backend path available
- support edge-state inspection without backend setup

Contract map for this slice:

- isolated mode uses mock transport and does not call the live contacts backend
- live mode continues to use the existing contacts API client
- the mode boundary stays explicit so test and development paths do not drift together

Excluded from this slice:

- changes to backend persistence or authorization
- changes to contact business rules
- login, session storage, or claims handling
- search, sorting controls, filtering, and pagination
- release or expose work

## Why This Slice Next

The repository now has a clear signal that backend-free UI iteration is valuable.

This slice resolves the next pressure:

- UI work should not always require a live backend
- edge states should be easy to inspect deterministically
- mock-driven iteration should stay separated from the real backend contract

The slice keeps the rest of the client architecture intact:

- live contacts behavior remains the default product path
- explicit transport mapping still exists
- testability improves without redefining backend truth

Starting with a full production offline mode would be heavier than needed.
Starting with ad hoc mocks would make the boundary too easy to blur.

## Use-Case Contract

### Use Case: `SelectContactsRuntimeMode`

Input:

- user or test intent to run the UI in live or isolated mode

Success result:

- the UI selects either the live backend path or the isolated mock path explicitly

Failure conditions:

- mode selection cannot be resolved
- the selected mode is ambiguous or hidden from the UI/test harness

### Use Case: `ServeDeterministicContactsMocks`

Input:

- isolated mode active

Success result:

- contacts list, create, edit, and delete workflows can run against mock responses
- edge states are reproducible across runs

Failure conditions:

- mock responses diverge across runs
- mock transport leaks into the live backend path

### Contract Map: `ContactsApiClient`

Methods:

- `list_contacts()`
- `create_contact(draft)`
- `update_contact(contact_id, draft)`
- `delete_contact(contact_id)`

Expected backend inputs and outputs:

- live mode continues to use the existing contacts API client
- isolated mode substitutes deterministic mock responses for the same workflows

Failure surface:

- mode selection ambiguity
- accidental live backend calls while isolated mode is active
- transport or contract mismatch in live mode

## Main Business Rules

- isolated mode must be deterministic
- isolated mode must not depend on a live backend
- live backend behavior must remain explicit and separate
- mock behavior must support UI development and specification, not redefine contacts truth

## Client Model Shape Hypothesis

Expected initial concepts:

- runtime mode selection
- isolated transport adapter
- deterministic contacts fixtures
- mode-aware UI bootstrapping

Possible supporting concepts if useful during build:

- a local environment flag or startup configuration
- an MSW-backed mock transport layer

The slice should avoid introducing a heavy environment system unless it clarifies behavior materially.

## Required Ports

- `ContactsApiClient`
  - live contacts requests in live mode
- mock transport boundary
  - deterministic isolated-mode responses

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

- isolated mode renders the current workflows without a live backend
- isolated mode uses deterministic mock responses
- live mode still uses the existing contacts API client
- mode boundaries are visible and not ambiguous

Contract-focused tests should specify:

- live mode still uses the existing client contract
- isolated mode does not call the live backend client

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
- isolated mode is deterministic
- live backend behavior remains separate
- UI development and edge-state inspection work without backend setup

## Notes For Build

- keep the mode boundary visible
- do not let isolated mocks become the source of business truth
- preserve the live contacts API client path
- related follow-on slices now exist for MSW transport, startup failure handling, runtime smoke coverage, and fixture alignment

# Slice: Solid Contacts Isolated Mode Smoke Test

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice adds a deterministic smoke test for the real isolated-mode transport path so the MSW-backed boot and CRUD behavior are exercised together.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- isolated-mode transport boundary
- MSW-backed browser or test transport

Early-phase rule:

- `build` should verify the isolated runtime path with a real transport-backed smoke test
- `build` should not change the live contacts backend contract
- `build` should not replace focused unit tests for the page and contract layers

## Architecture Mode

- frontend-first client/server split
- explicit HTTP transport adapter
- end-to-end smoke coverage over the isolated path

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- the smoke test exists to protect the isolated bootstrap boundary and its MSW-backed contract path

## Discovery Scope

Included in this slice:

- run the isolated app path through the real contacts API client
- verify the seeded list loads through MSW
- verify create, edit, and delete still work through the isolated transport path
- keep the smoke coverage deterministic

Contract map for this slice:

- isolated mode continues to use the HTTP-facing client shape
- MSW intercepts the contacts HTTP requests during the smoke test
- the smoke test should not depend on the stub-only unit test helpers

Excluded from this slice:

- changes to backend persistence or authorization
- changes to contact business rules
- live-mode bootstrap changes
- release or expose work

## Why This Slice Next

The isolated runtime already has unit coverage, but the end-to-end path still deserves a small smoke test that proves the worker-backed transport boundary behaves as a whole.

This slice resolves the next pressure:

- isolated mode needs a single high-confidence scenario that exercises the real transport boundary
- unit tests alone do not prove the bootstrap, fetch, and CRUD path work together
- the smoke test should stay small and deterministic so it does not become a second test suite

Starting with broader browser automation would be heavier than needed.
Starting with only app stub tests would miss the transport boundary that isolated mode was built to protect.

## Use-Case Contract

### Use Case: `SmokeTestIsolatedContactsRuntime`

Input:

- isolated mode booted against the MSW-backed contacts transport

Success result:

- the seeded list loads
- the user can create, edit, and delete contacts through the same runtime path
- the isolated mode keeps behaving deterministically across runs

Failure conditions:

- the seeded list does not load
- the smoke path cannot create, edit, or delete
- the test bypasses the real isolated transport boundary

### Contract Map: `ContactsApiClient`

Methods:

- `list_contacts()`
- `create_contact(draft)`
- `get_contact(contact_id)`
- `update_contact(contact_id, draft)`
- `delete_contact(contact_id)`

Expected backend inputs and outputs:

- the smoke test uses the real client against the isolated transport boundary
- MSW continues to provide deterministic seeded contact responses

## Main Business Rules

- isolated mode must remain deterministic
- isolated mode must exercise the real transport shape
- the smoke test should stay focused on the bootstrap and CRUD boundary

## Client Model Shape Hypothesis

Expected initial concepts:

- an isolated-mode smoke test
- real contacts API client usage inside the test
- deterministic seed assertions for list, create, edit, and delete

Possible supporting concepts if useful during build:

- a helper that mounts the app in isolated mode
- a smoke-test flow that reuses the existing interaction helpers

The slice should avoid introducing a heavy browser-automation framework unless it clarifies behavior materially.

## Required Ports

- isolated runtime bootstrap
- MSW-backed contacts transport
- deterministic client test harness

## Interface Expectations

The browser interface should continue to include:

- contacts list
- create contact
- edit contact
- delete contact

The smoke test should make these states explicit:

- isolated list loads
- isolated create works
- isolated edit works
- isolated delete works

## Initial Test Plan

Client tests should specify:

- isolated mode boots against the real transport boundary
- list data loads from seeded MSW contacts
- create, edit, and delete remain functional in the smoke path

## Scenario Definition

Scenario name:

- `web_user_walks_the_isolated_contacts_runtime`

Scenario steps:

1. boot the app in isolated mode
2. load the seeded contacts list
3. create, edit, and delete a contact
4. verify the runtime remains deterministic

## Done Criteria

- isolated mode has a real transport-backed smoke test
- the smoke test exercises the bootstrap and CRUD path together
- the smoke test stays deterministic

## Notes For Build

- keep the smoke test small and focused
- reuse the existing app interactions instead of introducing a new automation layer

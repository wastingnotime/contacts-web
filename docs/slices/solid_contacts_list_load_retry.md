# Slice: Solid Contacts List Load Retry

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice makes the list-load failure state recoverable with an explicit retry action.
The current implementation already exposes the retry action from the list error banner.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- HTTP backend contract represented as an external server boundary
- deterministic client-side test doubles for backend interaction during build

Early-phase rule:

- `build` should expose a retry path when the contacts list fails to load
- `build` should not change backend transport, claims, or login behavior
- backend interaction should remain covered by mocked or recording client adapters and focused contract tests

## Architecture Mode

- frontend-first client/server split
- explicit transport adapter between UI state and backend payloads
- visible retry behavior for a failed list fetch

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- the list should let the user retry a failed load without leaving the page

## Discovery Scope

Included in this slice:

- show a retry action when the initial contacts list fetch fails
- keep the error message visible while the user chooses to retry
- preserve the existing create, edit, and delete workflows
- keep the list fetch deterministic under test

Contract map for this slice:

- list retry is a browser action over the existing list request
- successful retry reuses the same list contact contract
- the current implementation already keeps retry local to the list banner

Excluded from this slice:

- auth UX such as login, token storage, or session renewal
- search, sorting controls, filtering, and pagination
- richer contact fields beyond first name, last name, and phone number
- backend persistence or release/expose work

## Why This Slice Next

The list already tells the user that loading failed, but it does not give them a recovery action.

This slice resolves the next pressure:

- a failed list fetch should not force a full page refresh
- retry should stay local to the page and deterministic in tests
- the change should not spill into form or delete workflows

The slice keeps the rest of the client architecture intact:

- the list page still owns collection loading
- the existing API client still performs the request
- only the local retry action becomes explicit

Starting with a global retry bus would be heavier than needed.
Starting with backend polling would shift responsibility away from the browser.

## Use-Case Contract

### Use Case: `RetryContactsListLoad`

Input:

- failed initial contacts list request

Success result:

- the browser retries the list request from the same page
- the list updates normally if the backend succeeds on retry

Failure conditions:

- the retry action cannot be rendered
- the retry action does not call the list request again

### Contract Map: `ContactsApiClient`

Methods:

- `list_contacts()`

Expected backend inputs and outputs:

- the retry reuses the existing list contacts request
- the backend response semantics do not change

Failure surface:

- authorization failure
- transport or unexpected contract mismatch

## Main Business Rules

- list failure must be recoverable
- retry should stay on the same page
- backend transport mapping remains explicit and isolated

## Client Model Shape Hypothesis

Expected initial concepts:

- list load error state
- retry action
- refetch action

Possible supporting concepts if useful during build:

- the existing `createResource` refetch function
- a visible retry button in the error banner

The slice should avoid introducing a heavy retry framework unless it clarifies behavior materially.

## Required Ports

- `ContactsApiClient`
  - list contacts

Optional port:

- none required beyond the existing request-claims and transport boundaries

## Interface Expectations

The browser interface should continue to include:

- a contacts list page at `/`

The interface should make these states explicit:

- loading contacts
- load failure
- retry action
- list recovery

## Initial Test Plan

Client tests should specify:

- initial list failure shows an error and a retry action
- retry calls the list request again
- retry success updates the list without changing the route

Contract-focused tests should specify:

- retry uses the same list contract as initial load
- the retry path is local and does not affect backend semantics

## Scenario Definition

Scenario name:

- `web_user_retries_failed_contacts_list_load`

Scenario steps:

1. open the contacts list
2. simulate an initial load failure
3. click retry
4. verify the list recovers when the backend succeeds

## Done Criteria

- list load failure is recoverable
- retry is deterministic
- the browser still uses the existing backend contract

## Notes For Build

- keep the retry action local to the list error banner
- do not introduce a global request manager
- preserve the existing delete and form workflows

# Slice: Solid Contacts Edit Missing Record State

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice makes the edit route show a dedicated missing-record state when the contact no longer exists.
The current implementation already renders a dedicated missing-record state for stale edit routes.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- HTTP backend contract represented as an external server boundary
- deterministic client-side test doubles for backend interaction during build

Early-phase rule:

- `build` should expose a dedicated state when the edit target contact is missing
- `build` should not change backend transport, claims, or login behavior
- backend interaction should remain covered by mocked or recording client adapters and focused contract tests

## Architecture Mode

- frontend-first client/server split
- explicit transport adapter between UI state and backend payloads
- visible stale-route handling for edit workflows

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- the edit route should tell the user when the target record is gone

## Discovery Scope

Included in this slice:

- show a dedicated missing-record state when the edit target cannot be loaded
- keep the back-to-list escape available
- preserve validation, submit pending, and update failure behavior
- keep the route deterministic under test

Contract map for this slice:

- missing edit record is a browser-visible stale-route state
- the user can return to the list without changing backend semantics
- the current implementation already renders a dedicated panel for the stale route

Excluded from this slice:

- auth UX such as login, token storage, or session renewal
- search, sorting controls, filtering, and pagination
- richer contact fields beyond first name, last name, and phone number
- backend persistence or release/expose work

## Why This Slice Next

The edit page already knows when the loaded contact is missing, but it still falls back to a generic error banner.

This slice resolves the next pressure:

- stale edit routes should not feel like a silent backend failure
- the browser should guide the user back to the list
- the change should remain local to the edit workflow

The slice keeps the rest of the client architecture intact:

- the edit page still owns record loading and form submission
- the existing API client still performs the request
- only the stale-route presentation becomes more explicit

Starting with a full not-found recovery framework would be heavier than needed.
Starting with backend route rewrites would shift responsibility away from the browser.

## Use-Case Contract

### Use Case: `ShowEditMissingRecordState`

Input:

- edit route requests a contact that no longer exists

Success result:

- the browser shows a dedicated missing-record state
- the user can return to the list from that state

Failure conditions:

- the missing-record state is not distinguishable from a generic failure

### Contract Map: `ContactsApiClient`

Methods:

- `get_contact(contact_id)`

Expected backend inputs and outputs:

- edit load continues to use the existing get-contact request
- not-found remains an existing backend response shape

Failure surface:

- not found
- authorization failure
- transport or unexpected contract mismatch

## Main Business Rules

- missing edit records must be visible
- back to list should remain available
- backend transport mapping remains explicit and isolated

## Client Model Shape Hypothesis

Expected initial concepts:

- missing edit route state
- back-to-list action
- stale route copy

Possible supporting concepts if useful during build:

- the existing `createResource` error state
- an empty-state style panel for stale routes

The slice should avoid introducing a heavy recovery framework unless it clarifies behavior materially.

## Required Ports

- `ContactsApiClient`
  - get contact

Optional port:

- none required beyond the existing request-claims and transport boundaries

## Interface Expectations

The browser interface should continue to include:

- an edit contact page at `/edit/:id`

The interface should make these states explicit:

- loading contact
- missing contact
- edit form
- edit failure

## Initial Test Plan

Client tests should specify:

- loading an absent contact shows a dedicated missing-record state
- the missing-record state provides a back-to-list action
- the edit form still renders normally for existing contacts

Contract-focused tests should specify:

- the missing-record route state is local and does not affect backend semantics
- the edit load still uses the same get-contact contract

## Scenario Definition

Scenario name:

- `web_user_sees_missing_edit_target_state`

Scenario steps:

1. open the edit route for a missing contact
2. verify the browser explains the record is gone
3. return to the list

## Done Criteria

- missing edit records are explicit
- navigation back to the list is obvious
- the browser still uses the existing backend contract

## Notes For Build

- keep the missing-record state local to the edit page
- do not introduce a global error manager
- preserve the submit and retry behavior already present

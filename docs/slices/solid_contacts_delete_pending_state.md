# Slice: Solid Contacts Delete Pending State

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice makes the in-flight delete state explicit after confirmation so the browser shows that the delete request is actually underway.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- HTTP backend contract represented as an external server boundary
- deterministic client-side test doubles for backend interaction during build

Early-phase rule:

- `build` should extend the current delete confirmation flow with an explicit pending state
- `build` should not change backend transport, claims, or login behavior
- backend interaction should remain covered by mocked or recording client adapters and focused contract tests

## Architecture Mode

- frontend-first client/server split
- explicit transport adapter between UI state and backend payloads
- visible in-flight state for destructive workflow requests

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- delete should show a clear pending state while the backend request is running

## Discovery Scope

Included in this slice:

- show a pending state after delete confirmation
- keep the confirmation and cancel flow intact
- disable repeat delete actions while the request is in flight
- preserve existing backend error handling

Contract map for this slice:

- confirmation remains a browser action before delete is sent
- delete pending is a browser state while the backend request is running
- cancel remains unavailable once delete is already in flight
- delete success and failure continue to use the existing backend contract

Excluded from this slice:

- auth UX such as login, token storage, or session renewal
- search, sorting controls, filtering, and pagination
- richer contact fields beyond first name, last name, and phone number
- backend persistence or release/expose work

## Why This Slice Next

The delete confirmation step now makes the action deliberate, but the user still needs to know when the backend request is actually running.

This slice resolves the next pressure:

- pending requests should not look like a stalled UI
- the user should see that confirmation has turned into real work
- the change stays local to the list workflow and does not require backend redesign

The slice keeps the rest of the client architecture intact:

- the list page still owns delete behavior
- the existing API client still performs the request
- only the local pending state becomes more explicit

Starting with a spinner system or a global request queue would be heavier than needed.
Starting with backend retry logic would shift responsibility away from the browser.

## Use-Case Contract

### Use Case: `ShowDeletePendingState`

Input:

- confirmed delete intent for a contact row

Success result:

- the browser shows that delete is in progress
- repeat delete actions are disabled while the request is running

Failure conditions:

- the pending state cannot be rendered
- the pending state cannot be cleared after completion

### Use Case: `ClearDeletePendingState`

Input:

- completed delete request

Success result:

- the pending state closes after success or failure

Failure conditions:

- pending state remains stuck after request completion

### Contract Map: `ContactsApiClient`

Methods:

- `delete_contact(contact_id)`

Expected backend inputs and outputs:

- confirmed delete continues to use the existing contacts API client
- delete remains a hard delete operation

Failure surface:

- authorization failure
- not found
- transport or unexpected contract mismatch

## Main Business Rules

- delete pending must be visible
- repeat delete actions should be disabled while the request is running
- cancel is no longer relevant once delete is in flight
- backend transport mapping remains explicit and isolated

## Client Model Shape Hypothesis

Expected initial concepts:

- delete confirmation state
- delete pending state
- delete cancel/confirm actions

Possible supporting concepts if useful during build:

- a `pendingDeleteContactId` signal
- a `deleteInProgress` boolean derived from the pending contact id

The slice should avoid introducing a heavy loading system unless it clarifies behavior materially.

## Required Ports

- `ContactsApiClient`
  - delete contact

Optional port:

- none required beyond the existing request-claims and transport boundaries

## Interface Expectations

The browser interface should continue to include:

- a contacts list page at `/`

The interface should make these states explicit:

- delete confirmation visible
- delete pending visible
- delete success
- delete failure

## Initial Test Plan

Client tests should specify:

- confirmed delete shows a pending state before completion
- delete actions are disabled while the request is in flight
- pending state clears after success or failure

Contract-focused tests should specify:

- confirmed delete still uses the existing client contract
- the pending state is local and does not affect backend request semantics

## Scenario Definition

Scenario name:

- `web_user_sees_pending_state_during_contact_delete`

Scenario steps:

1. open the contacts list
2. trigger delete on a contact and confirm it
3. verify a pending delete state is visible
4. complete the request and verify the pending state clears

## Done Criteria

- delete in-flight work is visible
- delete remains deterministic
- the browser still uses the existing backend contract

## Notes For Build

- keep the pending state local to the list item
- do not introduce a global request loader
- preserve the confirmation and error handling already added

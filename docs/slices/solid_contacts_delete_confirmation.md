# Slice: Solid Contacts Delete Confirmation

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice adds an explicit confirmation step before deleting a contact so destructive actions stay deliberate in the Solid browser client.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- HTTP backend contract represented as an external server boundary
- deterministic client-side test doubles for backend interaction during build

Early-phase rule:

- `build` should extend the existing contacts list workflow with a confirmation step
- `build` should not change backend transport, claims, or login behavior
- backend interaction should remain covered by mocked or recording client adapters and focused contract tests

## Architecture Mode

- frontend-first client/server split
- explicit transport adapter between UI state and backend payloads
- inline workflow confirmation for destructive actions

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- delete should remain a deliberate two-step browser action

## Discovery Scope

Included in this slice:

- require confirmation before deleting a contact
- allow cancellation before the backend delete request is sent
- keep the existing list, create, edit, and claims boundaries unchanged
- preserve explicit backend error handling after confirmation

Contract map for this slice:

- delete confirmation happens in the browser before the `DELETE` request is issued
- canceling confirmation does not call the backend
- confirmed delete continues to use the existing `ContactsApiClient`
- backend `403`, `404`, and unexpected delete failures remain visible

Excluded from this slice:

- auth UX such as login, token storage, or session renewal
- search, sorting controls, filtering, and pagination
- richer contact fields beyond first name, last name, and phone number
- backend persistence or release/expose work

## Why This Slice Next

Delete is currently direct and easy to trigger. That is acceptable for a narrow admin surface only if the browser makes the destructive intent obvious.

This slice resolves the next pressure:

- accidental delete clicks should not immediately remove a contact
- a confirmation step gives the user one more chance to back out
- the change is local to the list workflow and does not require backend redesign

The slice keeps the rest of the client architecture intact:

- list remains the entry point
- create and edit remain unchanged
- the delete request still uses the existing API client and error mapping boundary

Starting with undo or archival semantics would overreach because the backend contract is already a hard delete.
Starting with richer modal infrastructure would add complexity without changing the business meaning.

## Use-Case Contract

### Use Case: `RequestDeleteContactConfirmation`

Input:

- delete intent for a contact row

Success result:

- the browser shows a confirmation state for that contact

Failure conditions:

- confirmation UI cannot be rendered
- contact identity cannot be tracked reliably

### Use Case: `ConfirmDeleteContact`

Input:

- confirmed delete intent for a contact row

Success result:

- the backend delete request is sent
- the contact is removed from the visible list on success

Failure conditions:

- backend returns authorization failure
- backend returns not found
- backend returns an unexpected failure

### Use Case: `CancelDeleteContact`

Input:

- cancel intent while delete confirmation is visible

Success result:

- the confirmation state closes
- no backend request is sent

Failure conditions:

- cancel state cannot be cleared

### Contract Map: `ContactsApiClient`

Methods:

- `delete_contact(contact_id)`

Expected backend inputs and outputs:

- confirmed delete continues to use the existing contacts API client
- delete remains a direct hard delete operation

Failure surface:

- authorization failure
- not found
- transport or unexpected contract mismatch

## Main Business Rules

- delete is deliberate and requires confirmation
- canceling delete does not call the backend
- backend transport mapping remains explicit and isolated
- auth and error handling remain visible

## Client Model Shape Hypothesis

Expected initial concepts:

- delete confirmation state per contact row
- delete cancel action
- delete confirm action

Possible supporting concepts if useful during build:

- a small `pendingDeleteContactId` signal
- a small `deleteConfirmationContactId` signal

The slice should avoid introducing a heavy modal system unless it clarifies behavior materially.

## Required Ports

- `ContactsApiClient`
  - delete contact
- route/navigation boundary
  - keep the list route as the entry point

Optional port:

- none required beyond the existing request-claims and transport boundaries

## Interface Expectations

The browser interface should continue to include:

- a contacts list page at `/`

The interface should make these states explicit:

- delete confirmation visible
- delete canceled
- delete confirmed
- delete failure

## Initial Test Plan

Client tests should specify:

- clicking delete first shows confirmation
- canceling confirmation does not call the backend
- confirming delete calls the backend and refreshes the list
- delete authorization and not-found failures remain visible

Contract-focused tests should specify:

- confirmed delete still uses the existing client contract
- canceling delete does not reach the backend client

## Scenario Definition

Scenario name:

- `web_user_confirms_or_cancels_contact_delete`

Scenario steps:

1. open the contacts list
2. trigger delete on a contact
3. verify the browser asks for confirmation
4. cancel once and verify no delete request is sent
5. confirm on a second attempt and verify the contact is removed

## Done Criteria

- delete is no longer immediate
- cancel keeps the contact intact
- confirm removes the contact through the existing backend client
- the behavior remains deterministic and testable

## Notes For Build

- keep the confirmation UI small and local to the list item
- do not change the backend delete contract
- preserve existing authorization and not-found error handling
- update tests to assert both cancel and confirm paths

# Slice: Solid Contacts Conflict And Missing Record Messages

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice makes duplicate and missing-record responses explicit in the browser copy instead of leaving them as generic backend messages.
The current implementation keeps duplicate and missing-record copy local to the shared error helper and the affected workflow pages, with the browser still reaching the contract through the BFF boundary.
The same copy is reused on the live BFF-backed path and the isolated mock path.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- BFF-mediated backend contract boundary
- deterministic client-side test doubles for backend interaction during build

Early-phase rule:

- `build` should translate duplicate and missing-record errors into clearer browser states without changing the BFF-backed request path
- `build` should not change backend transport, claims, or login behavior
- backend interaction should remain covered by mocked or recording client adapters and focused contract tests

## Architecture Mode

- frontend-first client/BFF/backend split
- explicit transport adapter between UI state and backend payloads
- visible conflict and missing-record feedback for form and delete workflows

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- create, edit, and delete should show deliberate copy when the backend reports a duplicate or missing record, regardless of the BFF request hop

## Discovery Scope

Included in this slice:

- show a clear duplicate message when create rejects an existing contact
- show a clear missing-record message when edit or delete targets no longer exist
- keep validation, authorization, and pending handling intact
- preserve the existing request boundaries
- keep the browser-facing copy distinct from the transport-level failure semantics
- keep the duplicate and missing-record copy stable across both runtime modes

Contract map for this slice:

- duplicate remains a browser-visible conflict state
- not-found remains a browser-visible missing-record state
- success and failure continue to use the existing backend contract

Excluded from this slice:

- auth UX such as login, token storage, or session renewal
- search, sorting controls, filtering, and pagination
- richer contact fields beyond first name, last name, and phone number
- backend persistence or release/expose work

## Why This Slice Next

The browser already receives `duplicate` and `not_found` responses, but the copy is still too close to a raw backend message.

This slice resolves the next pressure:

- conflict cases should read like deliberate browser states, not incidental errors
- missing-record cases should tell the user the record is gone or stale
- the change stays local to the shared error boundary and affected pages

The slice keeps the rest of the client architecture intact:

- the pages still own routing and workflow composition
- the existing API client still performs the request
- only the local error copy becomes more explicit

Starting with a new validation framework would be heavier than needed.
Starting with backend schema changes would shift responsibility away from the browser.

## Use-Case Contract

### Use Case: `ShowDuplicateContactState`

Input:

- create request rejected because the contact already exists

Success result:

- the browser shows a conflict message that clearly indicates the contact already exists

Failure conditions:

- the duplicate state is not distinguishable from a generic failure

### Use Case: `ShowMissingContactState`

Input:

- edit or delete request targets a contact that no longer exists

Success result:

- the browser shows a missing-record message that clearly indicates the contact is gone or stale

Failure conditions:

- the missing-record state is not distinguishable from a generic failure

### Contract Map: `ContactsApiClient`

Methods:

- `create_contact(draft)`
- `update_contact(contact_id, draft)`
- `delete_contact(contact_id)`

Expected backend inputs and outputs:

- confirmed create, update, and delete continue to use the existing contacts API client
- duplicate and missing-record responses remain part of the existing contract

Failure surface:

- validation failure
- authorization failure
- not found
- duplicate
- transport or unexpected contract mismatch

## Main Business Rules

- duplicate must be visible as a conflict state
- not-found must be visible as a missing-record state
- backend transport mapping remains explicit and isolated

## Client Model Shape Hypothesis

Expected initial concepts:

- duplicate contact message
- missing contact message
- shared error-message boundary

Possible supporting concepts if useful during build:

- the existing `getContactErrorMessage` helper
- page-level alerts that preserve the browser copy

The slice should avoid introducing a heavy error taxonomy unless it clarifies behavior materially.

## Required Ports

- `ContactsApiClient`
  - create contact
  - update contact
  - delete contact

Optional port:

- none required beyond the existing request-claims and transport boundaries

## Interface Expectations

The browser interface should continue to include:

- a create contact page at `/new`
- an edit contact page at `/edit/:id`
- a contacts list page at `/`

The interface should make these states explicit:

- duplicate contact
- missing contact for edit
- missing contact for delete

## Initial Test Plan

Client tests should specify:

- create duplicate shows a clear conflict message
- edit missing-record shows a clear missing-record message
- delete missing-record shows a clear missing-record message

Contract-focused tests should specify:

- the shared error mapping keeps `duplicate` and `not_found` distinct
- the error copy is local and does not affect backend request semantics

## Scenario Definition

Scenario name:

- `web_user_sees_duplicate_or_missing_record_message`

Scenario steps:

1. submit a duplicate contact on the create page
2. edit a missing contact or delete a missing contact
3. verify the browser copy explains the state clearly

## Done Criteria

- duplicate is explicit
- missing-record states are explicit
- the browser still uses the existing backend contract

## Notes For Build

- keep the error copy local to the shared helper
- do not introduce a global error taxonomy
- preserve the validation and pending handling already present

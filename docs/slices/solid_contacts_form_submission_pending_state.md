# Slice: Solid Contacts Form Submission Pending State

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice makes create and edit form submission state explicit while the backend request is in flight.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- HTTP backend contract represented as an external server boundary
- deterministic client-side test doubles for backend interaction during build

Early-phase rule:

- `build` should expose the existing submit-in-flight state on create and edit forms
- `build` should not change backend transport, claims, or login behavior
- backend interaction should remain covered by mocked or recording client adapters and focused contract tests

## Architecture Mode

- frontend-first client/server split
- explicit transport adapter between UI state and backend payloads
- visible in-flight state for form submission workflows

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- create and edit should show a clear pending state while the backend request is running

## Discovery Scope

Included in this slice:

- show a pending state after create submit starts
- show a pending state after edit submit starts
- keep validation and failure handling intact
- disable repeat submit actions while the request is in flight

Contract map for this slice:

- submit pending is a browser state while the backend request is running
- create and edit continue to use the existing contacts API client
- success and failure continue to use the existing backend contract

Excluded from this slice:

- auth UX such as login, token storage, or session renewal
- search, sorting controls, filtering, and pagination
- richer contact fields beyond first name, last name, and phone number
- backend persistence or release/expose work

## Why This Slice Next

The create and edit forms already block repeated submits, but the workflow still feels silent while the request is in flight.

This slice resolves the next pressure:

- pending submits should not look like a stalled UI
- the user should see that form submission has started real backend work
- the change stays local to the form workflows and does not require backend redesign

The slice keeps the rest of the client architecture intact:

- create and edit pages still own submit behavior
- the existing API client still performs the request
- only the local submit pending state becomes more explicit

Starting with a global loading system would be heavier than needed.
Starting with backend retry logic would shift responsibility away from the browser.

## Use-Case Contract

### Use Case: `ShowFormSubmissionPendingState`

Input:

- submitted create or edit draft

Success result:

- the browser shows that submission is in progress
- repeat submit actions are disabled while the request is running

Failure conditions:

- the pending state cannot be rendered
- the pending state cannot be cleared after completion

### Use Case: `ClearFormSubmissionPendingState`

Input:

- completed create or edit request

Success result:

- the pending state closes after success or failure

Failure conditions:

- pending state remains stuck after request completion

### Contract Map: `ContactsApiClient`

Methods:

- `create_contact(draft)`
- `update_contact(contact_id, draft)`

Expected backend inputs and outputs:

- confirmed create and update continue to use the existing contacts API client
- submit remains the existing create or update operation

Failure surface:

- validation failure
- authorization failure
- not found
- duplicate
- transport or unexpected contract mismatch

## Main Business Rules

- form submit pending must be visible
- repeat submit actions should be disabled while the request is running
- backend transport mapping remains explicit and isolated

## Client Model Shape Hypothesis

Expected initial concepts:

- create submission pending state
- edit submission pending state
- submit disable/enable actions

Possible supporting concepts if useful during build:

- a `isSubmitting` signal already shared by each form page
- a visible pending message rendered beside the submit action

The slice should avoid introducing a heavy loading system unless it clarifies behavior materially.

## Required Ports

- `ContactsApiClient`
  - create contact
  - update contact

Optional port:

- none required beyond the existing request-claims and transport boundaries

## Interface Expectations

The browser interface should continue to include:

- a create contact page at `/new`
- an edit contact page at `/edit/:id`

The interface should make these states explicit:

- create submit pending
- edit submit pending
- create success
- edit success
- create failure
- edit failure

## Initial Test Plan

Client tests should specify:

- create submit shows a pending state before completion
- edit submit shows a pending state before completion
- repeat submit actions are disabled while the request is in flight
- pending state clears after success or failure

Contract-focused tests should specify:

- create and edit still use the existing client contract
- the pending state is local and does not affect backend request semantics

## Scenario Definition

Scenario name:

- `web_user_sees_pending_state_during_contact_submit`

Scenario steps:

1. open the create contact page
2. submit a valid contact draft
3. verify a pending submit state is visible
4. complete the request and verify the pending state clears

## Done Criteria

- create and edit submit work is visible
- create and edit remain deterministic
- the browser still uses the existing backend contract

## Notes For Build

- keep the pending state local to each form page
- do not introduce a global request loader
- preserve the validation and error handling already present

# Slice: Solid Contacts Authorization Failure States

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice makes authorization failures visible and consistent across the Solid browser client without introducing login UX or changing the backend contract boundary.
The current implementation already treats `403` as a distinct browser-visible state across the contacts workflows.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- HTTP backend contract represented as an external server boundary
- deterministic client-side test doubles for backend interaction during build

Early-phase rule:

- `build` should keep the existing contacts client and add a shared authorization-failure mapping boundary
- `build` should not introduce login, session storage, or token refresh workflows
- backend interaction should remain covered by mocked or recording client adapters and focused contract tests

## Architecture Mode

- frontend-first client/server split
- explicit transport adapter between UI state and backend payloads
- shared failure-mapping helper for backend request categories

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own auth identity providers or backend authorization policy
- the browser should present `403` as a distinct user-facing state instead of collapsing it into generic loading or save failure messaging

## Discovery Scope

Included in this slice:

- surface authorization failure distinctly on list, create, edit, and delete workflows
- reuse the existing `ContactsApiClient` and transport mapping boundary
- add a shared helper for translating backend error categories into browser-facing messages
- keep request claims and transport naming unchanged

Contract map for this slice:

- backend `403` responses remain distinct from validation, duplicate, and not-found failures
- list load, create, edit, and delete each render an authorization-specific message when the backend rejects the request
- the browser remains login-free and claims continue to be a request boundary concern
- diagnostic runtime routes such as `/healthz` and `/events` remain outside the browser workflow

Excluded from this slice:

- auth UX such as login, token storage, or session renewal
- search, sorting controls, filtering, and pagination
- richer contact fields beyond first name, last name, and phone number
- backend persistence or release/expose work

## Why This Slice Next

The backend contract already distinguishes authorization from validation and not-found behavior, but the browser still treats some request paths too generically.

This slice resolves the next pressure:

- users need to know when the request failed because the backend denied access
- generic load or save failures hide the difference between transport problems and policy problems
- the browser already has the backend claims boundary, so it should now present those claims-related failures explicitly

The slice keeps the rest of the client architecture intact:

- list remains the entry point
- create, edit, and delete reuse the same request boundary
- only error mapping changes, not the route model or transport model

Starting with login UX would overreach because the backend contract does not require it.
Starting with more transport changes would mix concerns that already have stable boundaries.

## Use-Case Contract

### Use Case: `RenderAuthorizationFailureForListLoad`

Input:

- backend list request returns `403`

Success result:

- the list page shows a clear authorization message instead of a generic load error

Failure conditions:

- backend returns another explicit failure category
- backend returns an unexpected failure shape that cannot be mapped

### Use Case: `RenderAuthorizationFailureForContactMutation`

Input:

- backend create, update, or delete request returns `403`

Success result:

- the current form or list view shows a clear authorization message
- the browser remains on the current workflow state so the user can recover

Failure conditions:

- backend returns another explicit failure category
- backend returns an unexpected failure shape that cannot be mapped

### Contract Map: `ContactsApiClient`

Methods:

- `list_contacts()`
- `create_contact(draft)`
- `get_contact(contact_id)`
- `update_contact(contact_id, draft)`
- `delete_contact(contact_id)`

Expected backend inputs and outputs:

- backend requests continue to include request claims
- `403` remains a first-class error code in the client error model
- other explicit failure categories remain unchanged

Failure surface:

- authorization failure
- request validation failure
- not found
- duplicate or conflict failure
- transport or unexpected contract mismatch

## Main Business Rules

- authorization failure must be visible and distinct
- login or session handling remains out of scope
- request claims remain explicit and configurable
- backend transport mapping remains explicit and isolated
- the browser must not silently collapse authorization failure into generic failure

## Client Model Shape Hypothesis

Expected initial concepts:

- a shared error-message helper for contacts requests
- browser-facing error messages keyed by request category
- page-level authorization failure state for list and mutation views

Possible supporting concepts if useful during build:

- a small `contactRequestErrorMessage` module
- a general `isAuthorizationError` helper

The slice should avoid introducing a heavy error taxonomy unless it clarifies behavior materially.

## Required Ports

- `ContactsApiClient`
  - list contacts
  - create contact
  - get contact
  - update contact
  - delete contact
- shared error-message boundary
  - map backend response categories into browser-facing messages

Optional port:

- none required beyond the existing request-claims and transport boundaries

## Interface Expectations

The browser interface should continue to include:

- a contacts list page at `/`
- a create-contact page at `/new`
- an edit-contact page at `/edit/:id`

The interface should make these states explicit:

- authorization failure on list load
- authorization failure on create
- authorization failure on edit
- authorization failure on delete

## Initial Test Plan

Client tests should specify:

- list load `403` is rendered distinctly
- create `403` is rendered distinctly
- edit `403` is rendered distinctly
- delete `403` is rendered distinctly
- existing validation, duplicate, and not-found messaging continues to work

Contract-focused tests should specify:

- the client error mapping preserves `403` as authorization
- the browser-facing helper uses the authorization category consistently

## Scenario Definition

Scenario name:

- `web_user_sees_authorization_failure_across_contacts_workflows`

Scenario steps:

1. boot the frontend with the backend claims boundary in place
2. trigger a `403` on the list route and verify the authorization message
3. trigger a `403` on create, edit, and delete paths and verify each remains distinct
4. confirm other explicit backend failures still surface correctly

## Done Criteria

- authorization failures are visibly distinct on all contacts workflows
- the browser still has no login or session UX
- the error-mapping boundary is shared and testable
- the implementation stays narrow and keeps transport mapping intact

## Notes For Build

- keep the error mapping helper small and explicit
- do not rewrite the contacts API client unless the helper truly requires it
- update page tests to assert authorization-specific messaging
- preserve the existing claims boundary and transport boundary

## Notes For Later Phases

- later auth UX can still be added if the product needs actual user login
- future slices can refine unsafe delete behavior or richer error taxonomy if real usage shows that `403` needs more context

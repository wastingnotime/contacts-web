# Slice: Solid Contacts Edit And Delete With Shared Contract Mapping

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice extends the Solid browser client with edit and delete workflows while reusing the contract-mapping boundary already established for list and create.
The current implementation reuses the same transport mapper, request-claims boundary, and error mapping for list, create, edit, and delete.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- HTTP backend contract represented as an external server boundary
- deterministic client-side test doubles for backend interaction during build

Early-phase rule:

- `build` should extend the existing browser runtime and adapter boundary
- `build` should not duplicate backend rules from `contacts-v2`
- backend interaction should remain covered by mocked or recording client adapters and focused contract tests

## Architecture Mode

- frontend-first client/server split
- explicit transport adapter between UI state and backend payloads
- route-level composition over small workflow-specific client models

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or authoritative contact validation
- the adapter boundary should continue to isolate backend naming, auth semantics, and response categories from page components

## Discovery Scope

Included in this slice:

- edit an existing contact from a list or detail route
- delete an existing contact from the list or detail route
- fetch one contact into an edit form when route identity changes
- map UI contact fields to backend transport fields explicitly
- keep path ID authoritative for update requests
- surface authorization, validation, not-found, and duplicate-style failures clearly
- reuse the same transport mapper and request-status model from the list/create slice

Contract map for this slice:

- UI model fields remain `camelCase`: `firstName`, `lastName`, `phoneNumber`
- backend transport fields remain `snake_case`: `first_name`, `last_name`, `phone_number`
- update requests may include `id` for mismatch validation, but the path ID remains authoritative
- delete requests are identified solely by path ID
- the adapter must preserve backend `400`, `403`, `404`, and `409` categories when mapping user-visible failures
- diagnostic runtime routes such as `/healthz` and `/events` remain outside the browser workflow

Excluded from this slice:

- auth UX such as login, token storage, or session renewal
- search, sorting controls, filtering, and pagination
- richer contact fields beyond first name, last name, and phone number
- optimistic updates unless build proves they are necessary to keep the slice coherent
- backend persistence or release/expose work

## Why This Slice Next

This slice is the smallest follow-on that proves the contract map can support the rest of the CRUD surface without widening the browser architecture too early.

It resolves the next set of tensions:

- the browser currently has explicit list/create pressure, but edit and delete are still only semantic promises
- the backend already exposes get/update/delete semantics, so the browser contract should cover those routes before broader UX work appears
- path-authoritative update identity and hard delete semantics need explicit browser behavior, not just backend tests
- auth and not-found responses must remain visible in the UI rather than collapsing into generic failure handling

The slice keeps list/create behavior intact and reuses the same adapter boundary:

- list remains the entry point
- create remains the primary way to introduce new contacts
- edit and delete add route coverage and failure mapping without introducing a new transport layer

Starting with a separate auth-login slice would overreach because the backend contract already defines admin claims but not a browser login flow.
Starting with search or pagination would dilute the contract work that still needs to land on the CRUD paths.

## Use-Case Contract

### Use Case: `LoadContactForEdit`

Input:

- route intent for `/contacts/:id` or `/edit/:id`

Success result:

- one contact mapped into the edit form
- form state remains coherent when the route identity changes

Failure conditions:

- backend get request fails
- backend returns not found
- backend returns a contract shape the adapter cannot map safely

### Use Case: `UpdateContactFromWebForm`

Input:

- `firstName`
- `lastName`
- `phoneNumber`
- route contact ID
- optional body `id` when the adapter or form needs to carry it

Success result:

- contact is sent through the contract adapter using backend transport field names
- user returns to a coherent post-submit state
- the list or detail state reflects the updated contact

Failure conditions:

- required UI fields are blank
- body ID and route ID mismatch
- backend rejects the request as invalid
- backend rejects the request as duplicate or conflicting
- backend is unavailable or returns an unexpected failure

### Use Case: `DeleteContactFromList`

Input:

- route contact ID

Success result:

- contact is removed through the backend adapter
- list state updates coherently after deletion

Failure conditions:

- backend returns not found
- backend rejects the request as unauthorized
- backend is unavailable or returns an unexpected failure

### Contract Map: `ContactsApiClient`

Methods:

- `list_contacts()`
- `create_contact(draft)`
- `get_contact(contact_id)`
- `update_contact(contact_id, draft)`
- `delete_contact(contact_id)`

Expected backend inputs and outputs:

- `get_contact(contact_id)` receives a single backend contact object with `snake_case` fields
- `update_contact(contact_id, draft)` sends `snake_case` fields and may validate a body ID against the path ID
- `delete_contact(contact_id)` returns no body on success
- `get_contact` and `update_contact` return `404` when the record is missing

Failure surface:

- request validation failure
- authorization failure
- not found
- duplicate or conflict failure
- transport or unexpected contract mismatch

### Contract Map: `ContactTransportMapper`

UI to backend:

- `firstName` -> `first_name`
- `lastName` -> `last_name`
- `phoneNumber` -> `phone_number`
- optional body `id` -> `id`

Backend to UI:

- `id` -> `id`
- `first_name` -> `firstName`
- `last_name` -> `lastName`
- `phone_number` -> `phoneNumber`

Error mapping:

- `400` -> validation or invalid payload feedback
- `403` -> authorization or access denied feedback
- `404` -> missing contact feedback
- `409` -> duplicate or conflict feedback
- unexpected shapes -> adapter failure visible to the user instead of silent coercion

## Main Business Rules

- the browser continues to use experience-language field names internally
- backend transport mapping remains explicit and isolated
- list remains the default route entrypoint
- edit and delete should reuse the same adapter boundary as list and create
- update keeps the path ID authoritative
- delete remains deliberate and visible
- the browser must not silently discard user work on failed update
- auth concerns remain explicit and should not be collapsed into a generic page-level error bucket

## Client Model Shape Hypothesis

Expected initial concepts:

- `ContactViewModel`
- `ContactDraft`
- `ContactsApiClient`
- `ContactTransportMapper`
- `EditContactState`
- `DeleteContactState`
- route-level page states for list, create, edit, and delete confirmation or action feedback
- request status variants for loading, empty, success, validation failure, not-found failure, duplicate failure, auth failure, and unexpected failure

Possible supporting concepts if useful during build:

- request-status enum or state object
- error model that distinguishes validation, duplicate, not-found, and generic backend failures

The slice should avoid introducing a heavy client domain model unless it clarifies behavior materially.

## Required Ports

- `ContactsApiClient`
  - list contacts
  - create contact
  - get contact
  - update contact
  - delete contact
- `ContactTransportMapper`
  - map backend contact payloads into UI contact models
  - map UI contact drafts into backend update payloads
  - map backend error shapes into user-facing categories when possible
- route/navigation boundary
  - move between list, edit, and delete workflows deterministically
- auth-claim boundary
  - obtain or proxy claims for backend requests without hard-coding page-level assumptions

Optional port:

- clock or scheduler seam only if needed for deterministic UI state testing

## Interface Expectations

The browser interface should include:

- a contacts list page at `/`
- an edit-contact page or route state at `/edit/:id` or `/contacts/:id`
- a delete action from the list or a detail view
- one shared layout shell only if it stays minimal

The interface should make these states explicit:

- loading one contact for edit
- edit form idle
- edit form submitting
- edit form validation failure
- missing-contact feedback
- delete pending
- delete failure
- authorization failure

## Initial Test Plan

Client tests should specify:

- route identity changes refetch the contact for edit
- the edit form renders returned contact data using UI naming, not backend transport naming
- update sends a snake_case backend payload through the adapter
- body ID mismatches are surfaced clearly as validation failures
- delete removes the contact and updates the visible list coherently
- not-found responses from get/update/delete remain visible to the user
- authorization failure is surfaced distinctly from validation failure

Contract-focused tests should specify:

- backend contact payloads in `snake_case` are mapped to UI models in `camelCase`
- UI drafts in `camelCase` are mapped to backend update payloads in `snake_case`
- body and path IDs are validated as a distinct contract concern
- unknown payload shapes fail clearly instead of being accepted silently
- backend error categories are preserved rather than collapsed into a single generic failure

## Scenario Definition

Scenario name:

- `web_user_edits_and_deletes_contact`

Scenario steps:

1. open the contacts list route against a backend stub that already contains one contact
2. navigate to the edit route for that contact
3. verify the edit form loads the current backend data using UI field names
4. submit a valid update and confirm the adapter sends snake_case transport fields
5. submit an update with a mismatched body ID and verify the validation failure is visible
6. delete the contact from the list or detail route
7. verify the list updates coherently after delete
8. repeat edit or delete with unauthorized and not-found stub responses and verify recoverable failure states

## Done Criteria

- the repository contains a second executable Solid-based slice that reuses the established contract boundary
- browser routes for edit and delete are explicit and testable
- update and delete flows preserve backend error categories visibly
- the contract mapper remains the single place where transport naming is translated
- the implementation remains narrow enough that broader auth UX or search work can be added later without reworking the client architecture

## Notes For Build

- keep the API client thin and focused on contact endpoints used in this slice only
- do not collapse transport mapping into UI components
- keep auth handling at the boundary, not hidden inside page components
- prefer clear not-found and authorization feedback over clever routing redirects
- record any route naming or delete-flow deviations in `decisions.md` or implementation notes rather than hiding them in code

## Notes For Later Phases

- a later slice can add auth UX if the browser needs actual login or session handling
- search and pagination should wait until edit and delete prove the base client architecture
- later `living` should capture whether direct delete from the list needs stronger safety behavior

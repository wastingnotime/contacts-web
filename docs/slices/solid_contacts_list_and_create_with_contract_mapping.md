# Slice: Solid Contacts List And Create With Contract Mapping

## Purpose

Define the first executable vertical slice for `contacts-web`.

This slice should establish the new frontend direction explicitly while staying narrow enough to build deterministically from an empty repository.
The current implementation keeps this slice as the base list/create contract-mapping boundary for the Solid browser client, with the browser now calling through the BFF instead of reaching the contacts backend directly.
The list/create seam now lives inside the BFF-backed browser delivery path rather than in the SPA alone.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- Node.js plus TypeScript web BFF runtime
- HTTP backend contract represented behind the BFF boundary
- local deterministic test doubles for backend interaction during build

Early-phase rule:

- `build` should implement the browser runtime and the contract adapter in this repository, routed through the BFF boundary
- `build` should not implement or copy backend business logic from `contacts-v2`
- backend interaction should be validated through mocked or recording client adapters and focused contract tests rather than a full deployed backend

## Architecture Mode

- frontend-first client/BFF/backend split
- explicit transport adapter between UI state and backend payloads, with the BFF owning the browser-facing delivery seam
- thin route-level workflow composition over reusable domain-light client models

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own contact persistence or authoritative domain validation
- the transport boundary must be explicit so backend naming and error-shape drift do not leak into every component, even though the browser now reaches that contract through the BFF

## Discovery Scope

Included in this slice:

- bootstrap the repository as a Solid-based web application
- list contacts on the home route
- show an empty state when no contacts exist
- navigate from the list route to a create-contact route
- create one contact through the backend adapter
- map UI contact fields to backend transport fields explicitly
- represent loading, success, and failure states for list and create flows
- keep the BFF as the browser's delivery boundary for contacts requests
- keep the BFF-backed seam reusable by later edit/delete flows

Contract map for this slice:

- UI model fields use `camelCase`: `firstName`, `lastName`, `phoneNumber`
- backend transport fields use `snake_case`: `first_name`, `last_name`, `phone_number`
- the adapter must map list payloads from backend transport objects into UI contact view models
- the adapter must map create drafts from UI form state into backend create payloads
- the adapter must treat auth as an explicit request concern rather than hiding it in page components
- the adapter should surface backend `400`, `403`, `404`, and `409` failures as distinct user-facing states when possible
- health checks are a runtime concern, not a UI state concern

Excluded from this slice:

- edit existing contact
- delete contact
- detail route fetching
- auth UX such as login, token storage, or session renewal
- search, sorting controls, filtering, and pagination
- destructive-action confirmation patterns
- richer contact fields beyond first name, last name, and phone number
- optimistic updates unless build proves they are necessary to keep the slice coherent

## Why This Slice Next

This is the smallest slice that resolves the main tensions discovered during `extract`:

- it commits the repository to Solid in executable form rather than leaving that only in semantics
- it introduces the backend contract adapter where camelCase UI language and snake_case backend transport already diverge
- it gives the repository a real browser-facing workflow without prematurely expanding to full CRUD
- it creates a concrete base for later edit, delete, auth, and richer error-handling slices

The contract map is intentionally narrow:

- it covers only list and create behavior
- it treats edit/delete as future reuse of the same adapter boundary rather than as separate transport systems
- it keeps the browser-facing state model small enough to test deterministically

Starting with architecture-document cleanup alone would still leave the implementation boundary undefined.
Starting with full CRUD would widen scope before the transport seam and route conventions are proven.

## Use-Case Contract

### Use Case: `LoadContactListView`

Input:

- route intent for the home contacts page

Success result:

- contact collection mapped into UI view models
- explicit empty state when the collection is empty

Failure conditions:

- backend list request fails
- backend returns a contract shape the adapter cannot map safely

### Use Case: `CreateContactFromWebForm`

Input:

- `firstName`
- `lastName`
- `phoneNumber`

Success result:

- contact is sent to the backend through the contract adapter
- user is returned to a coherent post-submit state
- resulting list view reflects the created contact, either by refetch or by well-defined local state update

Failure conditions:

- required UI fields are blank
- backend rejects the request as invalid
- backend rejects the request as duplicate
- backend is unavailable or returns an unexpected failure

### Contract Map: `ContactsApiClient`

Methods:

- `list_contacts()`
- `create_contact(draft)`

Expected backend inputs and outputs:

- `list_contacts()` receives backend contact objects with `snake_case` fields
- `create_contact(draft)` sends `snake_case` fields and receives a created contact object
- create responses may include an identifier and can be used to return the app to a coherent list state

Failure surface:

- request validation failure
- authorization failure
- not found is not expected for list/create, but the adapter should still preserve the category for future routes
- duplicate create failure
- transport or unexpected contract mismatch

### Contract Map: `ContactTransportMapper`

UI to backend:

- `firstName` -> `first_name`
- `lastName` -> `last_name`
- `phoneNumber` -> `phone_number`

Backend to UI:

- `id` -> `id`
- `first_name` -> `firstName`
- `last_name` -> `lastName`
- `phone_number` -> `phoneNumber`

Error mapping:

- `400` -> validation or invalid payload feedback
- `403` -> authorization or access denied feedback
- `409` -> duplicate contact feedback
- unexpected shapes -> adapter failure visible to the user instead of silent coercion

## Main Business Rules

- the browser uses experience-language field names internally: `firstName`, `lastName`, `phoneNumber`
- backend transport mapping is explicit and isolated: UI models must not be forced to use raw backend payload naming directly
- the list route is the default navigation entrypoint
- the empty state must still offer a path to create the first contact
- create must not silently discard user input on failure
- the first slice must prefer clear, deterministic user feedback over optimistic behavior
- auth concerns remain explicit and should not be collapsed into a generic page-level error bucket
- the browser should treat the BFF as the request boundary, not the contacts backend itself

## Client Model Shape Hypothesis

Expected initial concepts:

- `ContactViewModel`
- `ContactDraft`
- `ContactTransportMapper`
- `ContactsApiClient` or equivalent backend gateway
- route-level page states for list and create
- request status variants for loading, empty, success, validation failure, duplicate failure, auth failure, and unexpected failure

Possible supporting concepts if useful during build:

- request-status enum or state object
- error model that distinguishes validation, duplicate, and generic backend failures

The slice should avoid introducing a heavy client domain model unless it clarifies behavior materially.

## Required Ports

- `ContactsApiClient`
  - list contacts
  - create contact
- `ContactTransportMapper`
  - map backend list payloads into UI contact models
  - map UI contact drafts into backend create payloads
  - map backend error shapes into user-facing categories when possible
- route/navigation boundary
  - move between list and create views deterministically
- auth-claim boundary
  - obtain or proxy claims for backend requests without hard-coding page-level assumptions

Optional port:

- clock or scheduler seam only if needed for deterministic UI state testing

## Interface Expectations

The initial browser interface should include:

- a contacts list page at `/`
- a create-contact page or route state at `/new`
- one shared layout shell only if it stays minimal

The interface should make these states explicit:

- initial loading
- empty list
- loaded list
- create form idle
- create form submitting
- create form validation or backend failure
- authorization failure
- duplicate failure

## Initial Test Plan

Client tests should specify:

- the home route requests contacts and renders an empty state when none exist
- the home route renders returned contacts using UI naming, not backend transport naming
- the empty state offers navigation to create a contact
- the create route validates required fields before sending a request
- create sends a snake_case backend payload through the adapter
- backend validation or duplicate failure keeps the user on the form with visible feedback
- authorization failure is surfaced distinctly from validation failure
- successful create returns the user to a coherent list state

Contract-focused tests should specify:

- backend list payloads in `snake_case` are mapped to UI models in `camelCase`
- UI drafts in `camelCase` are mapped to backend create payloads in `snake_case`
- unknown payload shapes fail clearly instead of being accepted silently
- backend error categories are preserved rather than collapsed into a single generic failure

## Scenario Definition

Scenario name:

- `web_user_lists_and_creates_contact`

Scenario steps:

1. open the contacts home route against an empty backend stub
2. verify the empty state is shown
3. navigate to the create-contact route
4. attempt submit with blank fields and verify visible validation
5. submit valid contact data
6. verify the adapter sends the backend payload using `snake_case`
7. verify the app returns to a coherent list state and shows the new contact
8. repeat create with a duplicate or invalid backend stub response and verify the form remains recoverable

## Done Criteria

- the repository contains one executable Solid-based slice rather than only starter documents
- browser routes for list and create are explicit and testable
- the backend contract adapter exists as a named boundary
- list and create flows are covered by deterministic tests
- the slice keeps failure handling visible instead of assuming every mutation succeeds
- the implementation remains narrow enough that edit and delete can be added later without reworking the basic client architecture

## Notes For Build

- prefer plain, explicit component and adapter names over framework-heavy abstraction
- keep the API client thin and focused on contact endpoints used in this slice only
- do not collapse transport mapping into UI components
- if a shared store is introduced, it should stay small and workflow-focused rather than becoming a generic app-state container
- update root architecture guidance only as much as needed to stop contradicting the selected Solid frontend direction
- keep auth handling at the boundary, not hidden inside page components

## Notes For Later Phases

- the next likely slice is edit contact with the same contract-mapping boundary
- delete should wait until the list and error-feedback model are proven
- auth can be added later once the base browser-to-backend seam is stable enough to carry it cleanly

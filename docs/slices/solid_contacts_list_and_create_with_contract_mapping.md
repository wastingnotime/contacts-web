# Slice: Solid Contacts List And Create With Contract Mapping

## Purpose

Define the first executable vertical slice for `contacts-web`.

This slice should establish the new frontend direction explicitly while staying narrow enough to build deterministically from an empty repository.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- HTTP backend contract represented as an external server boundary
- local deterministic test doubles for backend interaction during build

Early-phase rule:

- `build` should implement the browser runtime and the contract adapter in this repository
- `build` should not implement or copy backend business logic from `contacts-v2`
- backend interaction should be validated through mocked or recording client adapters and focused contract tests rather than a full deployed backend

## Architecture Mode

- frontend-first client/server split
- explicit transport adapter between UI state and backend payloads
- thin route-level workflow composition over reusable domain-light client models

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own contact persistence or authoritative domain validation
- the transport boundary must be explicit so backend naming and error-shape drift do not leak into every component

## Discovery Scope

Included in this slice:

- bootstrap the repository as a Solid-based web application
- list contacts on the home route
- show an empty state when no contacts exist
- navigate from the list route to a create-contact route
- create one contact through the backend adapter
- map UI contact fields to backend transport fields explicitly
- represent loading, success, and failure states for list and create flows

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

## Main Business Rules

- the browser uses experience-language field names internally: `firstName`, `lastName`, `phoneNumber`
- backend transport mapping is explicit and isolated: UI models must not be forced to use raw backend payload naming directly
- the list route is the default navigation entrypoint
- the empty state must still offer a path to create the first contact
- create must not silently discard user input on failure
- the first slice must prefer clear, deterministic user feedback over optimistic behavior

## Client Model Shape Hypothesis

Expected initial concepts:

- `ContactViewModel`
- `ContactDraft`
- `ContactTransportMapper`
- `ContactsApiClient` or equivalent backend gateway
- route-level page states for list and create

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

## Initial Test Plan

Client tests should specify:

- the home route requests contacts and renders an empty state when none exist
- the home route renders returned contacts using UI naming, not backend transport naming
- the empty state offers navigation to create a contact
- the create route validates required fields before sending a request
- create sends a snake_case backend payload through the adapter
- backend validation or duplicate failure keeps the user on the form with visible feedback
- successful create returns the user to a coherent list state

Contract-focused tests should specify:

- backend list payloads in `snake_case` are mapped to UI models in `camelCase`
- UI drafts in `camelCase` are mapped to backend create payloads in `snake_case`
- unknown payload shapes fail clearly instead of being accepted silently

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

## Notes For Later Phases

- the next likely slice is edit contact with the same contract-mapping boundary
- delete should wait until the list and error-feedback model are proven
- auth can be added later once the base browser-to-backend seam is stable enough to carry it cleanly

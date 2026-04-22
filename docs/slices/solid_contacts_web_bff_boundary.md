# Slice: Solid Contacts Web BFF Boundary

## Purpose

Define the web delivery boundary for `contacts-web` so the Solid SPA talks to a TypeScript web BFF instead of directly to the backend API.

This slice establishes the web BFF as a separate runtime boundary inside the repository and routes the browser contact delivery path through it, while keeping contact business rules in the external backend.

It refines the browser -> TypeScript BFF -> backend shape for the current contacts experience.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser SPA runtime
- Node.js plus TypeScript web BFF runtime
- external `contacts-v2` API
- deterministic test doubles for SPA-to-BFF and BFF-to-backend interaction

Early-phase rule:

- `build` should make the SPA talk to the web BFF instead of directly to the backend API
- `build` should make the web BFF own request aggregation, claims plumbing, and backend contract adaptation
- `build` should implement the BFF in TypeScript with runtime validation at the boundary
- `build` should not move domain rules, persistence, or backend authorization policy into the repository

## Architecture Mode

- browser/SPA/TypeScript-BFF/backend split
- explicit delivery adapter between the SPA and the contacts backend
- web-specific BFF boundary inside the same repository as the SPA

Interpretation:

- this repository owns browser behavior, route semantics, request aggregation, and user-visible feedback
- this repository does not own contact persistence or authoritative domain validation
- the BFF must isolate backend naming, claims semantics, and response categories from SPA components
- TypeScript is used where the contract boundary is most valuable: request validation, response shaping, and backend mapping

## Discovery Scope

Included in this slice:

- create a separate SPA runtime boundary and web BFF runtime boundary in the repository shape
- route the current browser contact list, create, edit, and delete flows through the web BFF instead of direct backend access
- add a TypeScript BFF server entrypoint and a typed gateway layer
- keep backend contract mapping explicit in the BFF
- preserve user-visible CRUD behavior while shifting delivery responsibility out of the SPA
- keep claims handling explicit in the BFF boundary without introducing login UX

Contract map for this slice:

- SPA-facing requests use browser-oriented shapes
- BFF-facing backend requests use the contacts backend transport contract
- the BFF preserves backend `400`, `403`, `404`, and `409` categories when mapping user-facing failures
- the BFF may aggregate backend calls when that simplifies browser delivery
- BFF request/response validation should be enforced with TypeScript types plus runtime checks at the adapter boundary
- health checks remain a backend/runtime concern, not a SPA state concern

Excluded from this slice:

- auth UX such as login, token storage, or session renewal
- search, sorting controls, filtering, and pagination
- richer contact fields beyond first name, last name, and phone number
- backend persistence or backend domain redesign
- no SPA-wide TypeScript migration

## Why This Slice Next

The architecture and decisions now say the repository owns a web BFF, not just a browser client.

This slice resolves the next structural pressure:

- the SPA should stop being the only delivery surface in the repo
- request aggregation and backend adaptation need a dedicated home
- future feature slices can then build against a stable SPA/BFF boundary instead of mixing those concerns into UI code
- the BFF needs stronger boundary safety than the SPA because it translates contracts, so TypeScript belongs there first
- the implemented shape should remain explicit: browser -> BFF -> backend, with the browser never calling the backend directly

Starting with more UI features would widen scope without fixing the delivery boundary.
Starting with a separate BFF repo would violate the current ownership decision.

## Use-Case Contract

### Use Case: `LoadContactListThroughWebBff`

Input:

- route intent for the contacts list page

Success result:

- browser receives contact collection data through the BFF
- BFF maps backend transport data into browser-facing shapes
- empty state remains explicit when no contacts exist
- the BFF validates the upstream payload shape before exposing it to the SPA

Failure conditions:

- backend list request fails
- backend returns a contract shape the BFF cannot map safely
- BFF runtime validation rejects an unexpected payload shape

### Use Case: `CreateContactThroughWebBff`

Input:

- `firstName`
- `lastName`
- `phoneNumber`

Success result:

- browser submits create intent to the BFF
- BFF forwards the request to the backend with explicit transport mapping
- user returns to a coherent post-submit state
- the BFF validates the outgoing create payload before sending it upstream

Failure conditions:

- required browser fields are blank
- backend rejects the request as invalid
- backend rejects the request as duplicate
- backend is unavailable or returns an unexpected failure
- BFF runtime validation rejects the request before it reaches the backend

### Use Case: `EditContactThroughWebBff`

Input:

- `contactId`
- `firstName`
- `lastName`
- `phoneNumber`

Success result:

- browser loads an existing contact through the BFF
- browser submits an update through the BFF
- BFF forwards the request to the backend with explicit transport mapping
- user returns to a coherent post-submit state

Failure conditions:

- contact cannot be loaded
- required browser fields are blank
- backend rejects the request as invalid
- backend rejects the request as duplicate
- backend is unavailable or returns an unexpected failure
- BFF runtime validation rejects the request before it reaches the backend

### Use Case: `DeleteContactThroughWebBff`

Input:

- `contactId`

Success result:

- browser issues a delete intent through the BFF
- BFF forwards the delete to the backend
- the list view remains coherent after deletion

Failure conditions:

- contact cannot be found
- backend rejects the delete request
- backend is unavailable or returns an unexpected failure
- BFF runtime validation rejects the request before it reaches the backend

### Contract Map: `WebBffContactsGateway`

Responsibilities:

- receive browser-facing list, create, edit, and delete requests
- call the contacts backend through an explicit adapter
- preserve backend failure categories
- keep browser-facing payloads separate from backend transport payloads
- validate request and response shapes at runtime using TypeScript-friendly schemas or equivalent guards

Expected backend inputs and outputs:

- backend contact payloads continue to use `snake_case`
- create responses may include an identifier and can be used to return the app to a coherent list state
- request claims remain explicit and configurable at the BFF boundary
- the BFF may centralize contact contract types for use by its own code and any shared browser-facing shapes

Failure surface:

- request validation failure
- authorization failure
- not found is expected for edit/delete, and the adapter should preserve the category clearly
- duplicate create failure
- transport or unexpected contract mismatch
- invalid schema or malformed payload rejection before data reaches SPA components

## Main Business Rules

- the SPA and BFF are separate concerns in this repository
- the browser uses delivery-facing shapes, not raw backend transport payloads
- the BFF is the explicit boundary for request aggregation and claims plumbing
- backend transport mapping is explicit and isolated
- the browser must not silently collapse authorization failure into generic failure
- TypeScript is justified in the BFF because this is the contract translation boundary, not a generic utility layer
- the browser must not call the backend API directly for the contacts workflows in this slice

## Client Model Shape Hypothesis

Expected initial concepts:

- `ContactsWebClient`
- `WebBffContactsGateway`
- `ContactsBackendGateway`
- `ContactsRequestClaims`
- `ContactTransportMapper`
- route-level SPA page states for list, create, edit, and delete confirmation
- request status variants for loading, empty, success, validation failure, duplicate failure, auth failure, and unexpected failure
- shared contract types for contacts payloads and gateway results

Possible supporting concepts if useful during build:

- a small request-options helper shared by the web BFF contact gateway
- a config module that pairs BFF routing and backend base URL values
- a runtime schema helper for validating upstream payloads and local request objects

The slice should avoid introducing auth session models or identity-provider abstractions.
The slice should avoid a full SPA TypeScript conversion or a broad shared package migration.

## Required Ports

- `WebBffContactsGateway`
  - list contacts
  - create contact
- `ContactsWebBffClient`
  - get contact
  - update contact
  - delete contact
- `ContactsBackendGateway`
  - list contacts from the backend API
  - create contact against the backend API
  - get contact from the backend API
  - update contact against the backend API
  - delete contact from the backend API
- `ContactTransportMapper`
  - map backend list payloads into browser-facing contact models
  - map browser contact drafts into backend create payloads
  - map backend error shapes into user-facing categories when possible
- claims boundary
  - obtain or proxy claims for backend requests without hard-coding page-level assumptions

Optional port:

- environment configuration seam if needed to keep local and future routing values separate

## Interface Expectations

The browser interface should continue to include:

- a contacts list page at `/`
- a create-contact page at `/new`
- an edit-contact page at `/edit/:id`

The interface should make these states explicit:

- loading
- create success
- validation failure
- duplicate or not-found failures
- authorization failure

## Initial Test Plan

SPA tests should specify:

- browser pages call the web BFF boundary rather than the backend API directly
- list, create, edit, and delete remain coherent through the BFF boundary

BFF tests should specify:

- browser-facing list/create/edit/delete requests are mapped to backend transport requests
- backend failure categories remain preserved
- request claims remain explicit at the BFF boundary

Contract-focused tests should specify:

- backend transport mapping stays isolated in the BFF
- the BFF client preserves backend error categories
- browser-facing request shapes do not leak backend transport naming directly
- TypeScript types or schema definitions keep the contract shape explicit inside the BFF

## Scenario Definition

Scenario name:

- `web_user_manages_contacts_through_web_bff`

Scenario steps:

1. open the contacts list in the browser
2. receive list data through the web BFF
3. navigate to create contact
4. submit a new contact through the web BFF
5. open an existing contact for editing through the web BFF
6. submit an updated contact through the web BFF
7. delete a contact through the web BFF
8. observe coherent post-submit behavior without direct backend coupling in the SPA

## Done Criteria

- the repository has a clear SPA/BFF boundary in architecture docs
- the BFF owns backend contract adaptation for list/create/edit/delete flows
- the SPA no longer needs direct backend API access for the contacts workflows in this slice
- tests distinguish SPA behavior from BFF behavior
- the BFF is implemented in TypeScript with runtime shape validation at the contract boundary
- the slice remains free of login UX, persistence logic, and backend domain redesign

## EGD Follow-Up Pressure

The current build is acceptable, but the expectation review exposed two follow-up pressures that should drive the next slice rather than being absorbed quietly into this one:

- claims/session handling is still config-backed in the BFF and should be made more explicit if the web channel needs real request identity
- the direct BFF server process would benefit from one stronger edit/delete server-path scenario so the runtime evidence matches the full CRUD boundary

Those are follow-up concerns, not failures of the current slice.

# Slice: Solid Contacts Backend Claims Injection

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice keeps the existing Solid browser client and contract-mapping boundary, but makes backend request claims explicit so the local backend contract can be exercised end to end without introducing login UX.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- HTTP backend contract represented as an external server boundary
- deterministic client-side test doubles for backend interaction during build

Early-phase rule:

- `build` should add a boundary for request claims and preserve the existing transport adapter shape
- `build` should not introduce login, session storage, or token refresh workflows
- backend interaction should remain covered by mocked or recording client adapters and focused contract tests

## Architecture Mode

- frontend-first client/server split
- explicit transport adapter between UI state and backend payloads
- explicit request-claims boundary for backend calls

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own auth identity providers or backend authorization policy
- the adapter boundary should continue to isolate backend naming, claims semantics, and response categories from page components

## Discovery Scope

Included in this slice:

- attach explicit request claims to backend API calls
- make the request-claims source configurable for local and future environments
- surface authorization failures clearly when the backend rejects a request
- reuse the existing `ContactsApiClient` and `ContactTransportMapper`
- keep list/create/edit/delete workflows unchanged apart from claim plumbing

Contract map for this slice:

- UI model fields remain `camelCase`
- backend transport fields remain `snake_case`
- the backend expects claims-like headers for admin access
- the adapter must preserve backend `403` categories when mapping user-visible failures
- claims are a request concern, not a browser login workflow
- diagnostic runtime routes such as `/healthz` and `/events` remain outside the browser workflow

Excluded from this slice:

- auth UX such as login, token storage, or session renewal
- search, sorting controls, filtering, and pagination
- richer contact fields beyond first name, last name, and phone number
- backend persistence or release/expose work

## Why This Slice Next

The current frontend implementation already understands the backend resource contract, but the backend itself rejects anonymous CRUD requests.

This slice resolves the next pressure:

- the local frontend endpoint can only be exercised successfully if the request path includes the backend's required claim headers
- adding login UX now would overreach because the backend contract only requires claims, not a user session flow
- keeping claims explicit preserves the adapter boundary and avoids burying authorization behavior inside page components

The slice keeps the existing browser workflow intact:

- list remains the entry point
- create remains the primary write flow
- edit and delete continue to reuse the same contract mapper
- claims plumbing is added once at the request boundary rather than duplicated across pages

Starting with a full auth screen would widen scope without changing the backend contract.
Starting with backend-side auth redesign would violate repository boundaries.

## Use-Case Contract

### Use Case: `PrepareBackendRequestClaims`

Input:

- environment or configuration-provided claim values

Success result:

- request headers are produced for backend calls
- the claim source remains explicit and overrideable

Failure conditions:

- claim configuration is missing or invalid
- claim values cannot be represented in the expected header format

### Use Case: `ExecuteContactsApiRequestWithClaims`

Input:

- contacts API request
- request claims

Success result:

- the request is sent with the expected claim headers
- backend authorization succeeds for admin-level requests

Failure conditions:

- backend returns `403`
- backend returns other explicit contract failures
- backend or transport is unavailable

### Contract Map: `ContactsApiClient`

Methods:

- `list_contacts()`
- `create_contact(draft)`
- `get_contact(contact_id)`
- `update_contact(contact_id, draft)`
- `delete_contact(contact_id)`

Expected backend inputs and outputs:

- every request includes claims headers from the boundary
- backend contact payloads continue to use `snake_case`
- backend failures continue to map into explicit response categories

Failure surface:

- authorization failure
- request validation failure
- not found
- duplicate or conflict failure
- transport or unexpected contract mismatch

## Main Business Rules

- claims are required for backend contacts requests in local development
- the browser does not own login or token management in this slice
- request claims remain explicit and configurable
- backend transport mapping remains explicit and isolated
- the browser must not silently collapse authorization failure into generic failure

## Client Model Shape Hypothesis

Expected initial concepts:

- `ContactsApiClient`
- `ContactsRequestClaims`
- `ContactsRequestClaimsProvider`
- environment-backed claim config
- request headers helpers

Possible supporting concepts if useful during build:

- a small request-options helper shared by the contacts API client
- a config module that pairs API base URL and request claims

The slice should avoid introducing auth session models or identity-provider abstractions.

## Required Ports

- `ContactsApiClient`
  - list contacts
  - create contact
  - get contact
  - update contact
  - delete contact
- request-claims boundary
  - provide request headers for backend calls

Optional port:

- environment configuration seam if needed to keep local and future claim values separate

## Interface Expectations

The browser interface should continue to include:

- a contacts list page at `/`
- a create-contact page at `/new`
- an edit-contact page at `/edit/:id`

The interface should make these states explicit:

- authorization failure
- loading
- create/edit success
- duplicate or not-found failures

## Initial Test Plan

Client tests should specify:

- backend calls include explicit claim headers
- local default claims are present in the request boundary
- override values can be supplied through environment configuration
- authorization failures remain visible to the user
- existing list/create/edit/delete behavior still works with the claims boundary in place

Contract-focused tests should specify:

- every request method in the API client passes claims headers
- the request-claims helper produces the expected headers from configuration
- backend error categories remain preserved

## Scenario Definition

Scenario name:

- `web_user_calls_contacts_backend_with_admin_claims`

Scenario steps:

1. boot the frontend against the configured backend base URL
2. verify the request boundary includes admin claims on contacts API calls
3. load the contacts list from the backend
4. create, edit, and delete a contact through the backend contract
5. verify authorization failures remain distinct when claims are incorrect or absent

## Done Criteria

- the browser client sends explicit claim headers with contacts API calls
- the request-claims boundary is configurable and testable
- the local frontend can exercise the backend contract without adding login UX
- the implementation keeps authorization handling separate from transport mapping and page components

## Notes For Build

- keep the API client thin and focused on contacts endpoints
- do not collapse claim handling into page-level conditionals
- keep the claims source configurable but simple
- preserve the existing edit/create/delete tests and extend them only as needed to prove claim plumbing

## Notes For Later Phases

- login or real session handling can come later if the product needs it
- if the backend auth contract changes, update the request-claims boundary rather than scattering header strings throughout the client
- later `living` should capture whether the static claim boundary is enough or whether a real user identity flow becomes necessary

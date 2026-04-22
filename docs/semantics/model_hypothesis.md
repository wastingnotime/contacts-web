# Model Hypothesis

## Purpose

This document captures the current model hypothesis for the target domain.

Use it during `extract`, `refine`, and `build` to define vocabulary, boundaries, use cases, and slice candidates.

---

## Extracted From

- stakeholder request on 2026-04-14 describing this repository as `contacts-web`
- naming reference: `/home/henrique/repos/bitbucket/solareclipseglasses/management/references/axiom_interface_naming_reference.md`
- frozen legacy repository: `/home/henrique/repos/github/wastingnotime/contacts`
- current backend repository: `/home/henrique/repos/github/wastingnotime/contacts-v2`
- primary evidence inventory: `work/sources/contacts_web_reference_inventory.md`
- backend contract inventory: `work/sources/contacts_v2_api_contract_inventory.md`
- isolated mode note from `/home/henrique/Downloads/isolated_mode.md` describing a backend-free UI iteration path
- integrated local mode note from `/home/henrique/Downloads/integrated_local_mode.md` describing a multi-service local development and integration path
- BFF architecture summary from `/home/henrique/Downloads/bff-architecture-summary.md` describing a web-specific delivery adapter for `contacts-web`
- BFF architecture summary inventory: `work/sources/bff_architecture_summary_inventory.md`

## Current Hypothesis

`contacts-web` is the web experience surface for the `contacts` domain. Its near-term responsibility is to let a human user perform contact workflows through a browser while keeping the business source of truth in the backend.

The BFF summary adds a second delivery-layer pressure: the repository may need to house both the Solid SPA and a web-specific BFF, with the BFF acting as a delivery adapter between browser interactions and the backend API.

This repository is not the backend domain owner. It is the browser-facing interface that presents contact workflows, route transitions, form state, and API interaction against a contacts backend. The current backend reference is `contacts-v2`.

The extracted evidence suggests the initial workflow remains narrow on purpose:

- list contacts
- create a contact
- load one contact for editing
- update a contact
- delete a contact

The current backend contract from `contacts-v2` is a narrow admin CRUD API with explicit transport and auth rules:

- `GET /healthz` returns a simple health payload
- `POST /contacts` creates a contact and returns `201` with a `Location` header
- `GET /contacts` lists all contacts
- `GET /contacts/{id}` fetches one contact
- `PUT /contacts/{id}` updates one contact
- `DELETE /contacts/{id}` deletes one contact
- the runtime also exposes `GET /events` as a diagnostic event log surface
- request payloads use `snake_case` field names: `first_name`, `last_name`, and `phone_number`
- update payloads may include `id`, but the path ID is authoritative and mismatches are rejected
- create rejects exact duplicates of normalized `first_name`, `last_name`, and `phone_number`
- phone numbers are normalized before storage and empty normalized values are rejected
- all CRUD routes require admin claims; non-admin claims receive `403`
- missing records return `404`
- validation failures return `400`
- duplicate creates return `409`
- the runtime listens on `0.0.0.0:8010` by default

The historical UI implemented that workflow in Mithril plus Redux. The current direction for this repository is to preserve the workflow while intentionally changing the web stack to Solid.

The BFF summary suggests the repository may also need a separate web app boundary inside the same repo, so SPA behavior and delivery-adapter behavior can evolve together without becoming one mixed component tree.

The isolated mode note adds a second pressure on the repository: the frontend should be easy to exercise without a live backend when the goal is UI iteration, edge-state inspection, or deterministic testing. That suggests an intentional local mode with mock API behavior and no backend dependency may be useful as an evaluation and development path, provided it stays separate from the contacts backend contract.

The integrated local mode note adds a complementary pressure: the frontend should also be easy to exercise with real local service interaction when the goal is contract validation, flow debugging, or integration testing. That suggests a second intentional local mode that runs the frontend with a seeded backend and local database through Docker Compose, while still keeping it separate from the external production backend contract.

## Repository Role

- provide the primary web interface for the `contacts` experience domain
- translate contact workflows into browser routes, form interactions, and backend API calls
- preserve user-facing behavior separately from backend implementation details
- validate how the `contacts` experience should feel on the web before introducing broader product scope
- map the current frontend-friendly contract to the backend's snake_case HTTP shape without leaking transport details into UI state
- host a web-specific BFF alongside the SPA when delivery concerns need a separate boundary

## Boundary And Relationships

### In Scope

- browser routes and navigation
- list, form, and detail-edit interaction states
- request/response mapping between UI models and backend contract models
- user-visible validation and error handling
- optimistic or non-optimistic mutation flow decisions
- empty, loading, success, and failure states
- web-specific BFF response shaping, request aggregation, and auth/session handling

### Out Of Scope

- backend persistence rules
- backend authorization implementation
- deployment or runtime concerns owned by the backend repository
- control-plane concerns that belong to `axiom-*` interfaces
- domain rules that must remain owned by the backend API

### Upstream / Downstream Relationship

- `contacts-v2` currently acts as the backend/API reference
- `contacts-web` should consume backend capabilities rather than re-own CRUD business rules
- the web app may shape request payloads, validation messages, and interaction flow, but domain invariants ultimately need a backend authority
- the web app likely needs a named adapter boundary between UI models and the `contacts-v2` HTTP contract

## Core Concepts

- `Contact`: the user-facing record shown in lists and forms
- `ContactId`: opaque identifier used by routes and backend requests
- `ContactName`: currently represented as `firstName` and `lastName` in the legacy UI and as `first_name` and `last_name` in the current backend
- `PhoneNumber`: required user-entered phone value with likely future normalization pressure
- `ContactListView`: route state that shows all known contacts
- `ContactFormView`: route state that creates or edits one contact
- `BackendContract`: the HTTP API consumed by the web app
- `AuthClaims`: request headers or session-derived claims that determine whether the backend will authorize the action
- `WebBFF`: a web-specific delivery adapter that can aggregate API calls and shape responses for the SPA

## Observed Workflow Shape

From the legacy web reference:

- the home route lists contacts
- the empty state still promotes contact creation
- `/new` opens insert mode
- `/edit/:id` opens edit mode
- edit mode fetches the selected contact when route identity changes
- form submission returns the user to the list route
- delete is triggered from the list view

The current model assumes these flows still matter even though the implementation stack will change.

## Candidate Use Cases

- open the contacts list in the browser
- see an empty state when no contacts exist
- start creating a new contact from the list view
- submit a new contact to the backend
- open an existing contact for editing
- update an existing contact and return to the list
- delete a contact from the list
- recover from backend validation, not-found, or conflict responses
- adapt backend field naming differences into stable UI behavior

## Key Interface Pressures

- the naming reference explicitly selects `contacts-web` as an experience-domain web surface
- the same naming reference explicitly recommends Solid for `contacts-web`
- the legacy implementation is valuable as workflow evidence, but not as stack direction
- the backend lineage is moving from legacy camelCase payloads toward `contacts-v2` snake_case payloads
- the web app likely needs an anti-corruption boundary between UI language and backend transport language
- the backend now has explicit response semantics for auth, validation, missing records, duplicates, and health checks
- the repo may benefit from a backend-free isolated mode for faster UI development and deterministic edge-state inspection
- the repo may also benefit from an integrated local mode that runs the frontend against a locally orchestrated seeded backend for contract and flow validation
- testability pressure may justify a mock-driven mode that exercises pages and states without depending on the contacts backend
- the repo may also need a web-specific BFF boundary so SPA code does not absorb transport orchestration directly

## Likely UI State Model

- collection state for listed contacts
- current contact state for edit mode
- insert versus edit mode state
- request status state such as idle, loading, submitting, succeeded, failed
- user-visible error state scoped to route or form
- isolated-mode state that selects between live backend behavior and deterministic mock behavior
- integrated-local-mode state that selects a full local service stack for real interaction and integration testing
- BFF boundary state that decides which concerns belong in the web adapter versus the SPA

## Unresolved Tensions And Ambiguities

- The naming reference frames `contacts-web` as a product-facing experience surface, while `contacts-v2` currently models a narrow admin-oriented backend. The intended user role of this web app is still ambiguous.
- The legacy UI uses camelCase fields, while `contacts-v2` exposes snake_case fields. The repository will need an explicit mapping decision.
- The legacy UI redirects immediately after submit and does not show mutation failures clearly. It is not yet decided whether that interaction should be preserved.
- The repository still carries starter-era Python monolith architecture guidance, which does not match the user-stated Solid frontend direction.
- The backend contract for auth is present in `contacts-v2`, but the extracted web evidence does not yet define login, session, or token-handling expectations for this repository.
- The current extracted workflow has no search, sort, filtering, pagination, or richer contact fields.
- The list currently deletes directly from the index view; confirmation, undo, or safer destructive interaction is not yet defined.
- The exact ownership of validation is unresolved: the browser may validate for usability, but authoritative rejection must remain aligned with the backend.
- The backend exposes a diagnostic `/events` route, but it is not yet clear whether the web app should treat it as a contract dependency or ignore it as an internal runtime aid.
- The repository does not yet define whether backend-free isolated mode is a first-class development/test path or only an ad hoc local convenience.
- If isolated mode becomes explicit, the boundary between live contract tests and mock-driven UI tests needs to stay clear so the two modes do not drift into one another.
- The repository does not yet define how an integrated local mode should relate to the isolated mode, the live backend contract, or the existing local dev command surface.
- If integrated local mode becomes explicit, the boundary between real local service validation and external backend authority needs to stay clear so the two modes do not drift into one another.
- The BFF summary introduces a SPA-versus-BFF boundary, but the current repository documents do not yet define which delivery concerns stay in the SPA and which move into the web adapter.

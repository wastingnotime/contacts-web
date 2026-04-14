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

## Current Hypothesis

`contacts-web` is the web experience surface for the `contacts` domain. Its near-term responsibility is to let a human user perform contact workflows through a browser while keeping the business source of truth in the backend.

This repository is not the backend domain owner. It is the browser-facing interface that presents contact workflows, route transitions, form state, and API interaction against a contacts backend. The current backend reference is `contacts-v2`.

The extracted evidence suggests the initial workflow remains narrow on purpose:

- list contacts
- create a contact
- load one contact for editing
- update a contact
- delete a contact

The historical UI implemented that workflow in Mithril plus Redux. The current direction for this repository is to preserve the workflow while intentionally changing the web stack to Solid.

## Repository Role

- provide the primary web interface for the `contacts` experience domain
- translate contact workflows into browser routes, form interactions, and backend API calls
- preserve user-facing behavior separately from backend implementation details
- validate how the `contacts` experience should feel on the web before introducing broader product scope

## Boundary And Relationships

### In Scope

- browser routes and navigation
- list, form, and detail-edit interaction states
- request/response mapping between UI models and backend contract models
- user-visible validation and error handling
- optimistic or non-optimistic mutation flow decisions
- empty, loading, success, and failure states

### Out Of Scope

- backend persistence rules
- backend authorization implementation
- deployment or runtime concerns owned by the backend repository
- control-plane concerns that belong to `axiom-*` interfaces

### Upstream / Downstream Relationship

- `contacts-v2` currently acts as the backend/API reference
- `contacts-web` should consume backend capabilities rather than re-own CRUD business rules
- the web app may shape request payloads, validation messages, and interaction flow, but domain invariants ultimately need a backend authority

## Core Concepts

- `Contact`: the user-facing record shown in lists and forms
- `ContactId`: opaque identifier used by routes and backend requests
- `ContactName`: currently represented as `firstName` and `lastName` in the legacy UI and as `first_name` and `last_name` in the current backend
- `PhoneNumber`: required user-entered phone value with likely future normalization pressure
- `ContactListView`: route state that shows all known contacts
- `ContactFormView`: route state that creates or edits one contact
- `BackendContract`: the HTTP API consumed by the web app

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

## Likely UI State Model

- collection state for listed contacts
- current contact state for edit mode
- insert versus edit mode state
- request status state such as idle, loading, submitting, succeeded, failed
- user-visible error state scoped to route or form

## Unresolved Tensions And Ambiguities

- The naming reference frames `contacts-web` as a product-facing experience surface, while `contacts-v2` currently models a narrow admin-oriented backend. The intended user role of this web app is still ambiguous.
- The legacy UI uses camelCase fields, while `contacts-v2` exposes snake_case fields. The repository will need an explicit mapping decision.
- The legacy UI redirects immediately after submit and does not show mutation failures clearly. It is not yet decided whether that interaction should be preserved.
- The repository still carries starter-era Python monolith architecture guidance, which does not match the user-stated Solid frontend direction.
- The backend contract for auth is present in `contacts-v2`, but the extracted web evidence does not yet define login, session, or token-handling expectations for this repository.
- The current extracted workflow has no search, sort, filtering, pagination, or richer contact fields.
- The list currently deletes directly from the index view; confirmation, undo, or safer destructive interaction is not yet defined.
- The exact ownership of validation is unresolved: the browser may validate for usability, but authoritative rejection must remain aligned with the backend.

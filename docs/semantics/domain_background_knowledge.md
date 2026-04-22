# Domain Background Knowledge

## Purpose

This document captures broad background knowledge about the target domain.

It is not the repository's extracted glossary. It is reference material distilled from books, articles, standards, external systems, or other domain sources.

Use it mainly during expectation-gap detection.

---

## Extracted Baseline Context

This repository is the web interface for the `contacts` experience domain. The extracted baseline combines three different kinds of evidence:

- interface naming and stack direction from the Axiom naming reference
- concrete user workflow evidence from the frozen legacy `contacts` repository
- current backend boundary evidence from `contacts-v2`
- BFF delivery-adapter guidance from the 2026-04-22 architecture summary

That means evaluation should distinguish carefully between:

- enduring workflow meaning
- legacy implementation accidents
- current direction for the new web surface

## Interface Background

The naming reference establishes a structural split:

- `axiom-*` is for platform administration and control-plane interfaces
- `{domain}-*` is for user-facing experience-domain interfaces

Under that framing, `contacts-web` should be treated as a contacts-domain web surface, not as an `axiom` admin console. This matters because evaluation should reject accidental drift toward control-plane naming or responsibilities.

The same reference chooses Solid as the current technology direction for `contacts-web`. That should be treated as implementation guidance, not business truth, but it does explain why the new repository should preserve workflows instead of preserving the legacy Mithril code structure.

The BFF summary adds another implementation-direction signal: if `contacts-web` owns a web-specific BFF, the repository should keep delivery concerns separate from the SPA and treat the BFF as a channel-specific adapter rather than a second source of domain truth.

The observability strategy adds a telemetry-direction signal: if `contacts-web` spans SPA, BFF, and API delivery layers, the repository should treat traces, metrics, and logs as one correlated system rather than three isolated streams. The browser should not send telemetry directly to a token-bearing destination; the pipeline should be collector-based and layer-aware.

## Common Expectations For Contact Web Apps

- users expect a clear list of contacts
- users expect a simple create and edit flow
- users expect destructive actions to be understandable and reversible or at least deliberate
- users expect validation errors to be visible near the action they just took
- users expect the UI to stay coherent when backend data is missing, stale, or rejected
- users often expect names and phone numbers to be more complicated than a trivial demo model admits

## Frontend-Specific Background

For a browser-facing contacts interface, correctness is not only about backend responses. It also includes:

- route semantics that match user intent
- stable mapping between URL, loaded record, and visible form state
- clear loading and empty states
- predictable post-submit behavior
- error recovery that does not silently discard user work
- transport-model mapping when backend field names differ from UI language
- deterministic isolated modes that let the UI be inspected without a live backend
- integrated local modes that run the frontend with local services, seeded data, and real service interaction for contract validation and flow debugging

Even a narrow CRUD frontend needs explicit choices for these behaviors or it will feel broken despite a correct backend.

For a web-specific BFF, the same principle applies at the delivery layer:

- the BFF should aggregate backend calls when that simplifies browser interaction
- the BFF should adapt backend responses to UI shape without redefining business rules
- auth/session handling belongs in the BFF only when it is required for the web channel
- the BFF should not become shared infrastructure for other channels

For observability across SPA, BFF, and API, the same principle applies to telemetry:

- traces should capture causality across the full request path
- metrics should describe latency, error rate, and dependency behavior without overloading logs
- logs should provide context for failures without becoming a high-volume substitute for traces or metrics
- the browser should emit user-experience signals, the BFF should emit orchestration signals, and the API should emit business and resource signals
- shared metadata such as service name, environment, version, feature, and journey should be consistent enough to join across layers

## Testability Background

Frontend testability improves when UI behavior can be separated from live transport concerns.

An isolated mode typically helps when the team wants:

- fast iteration on routes, forms, and edge states
- deterministic rendering and interaction checks
- component inspection without backend setup
- mock API responses that are stable across runs

An integrated local mode typically helps when the team wants:

- the frontend and backend to run locally together
- seeded data to make end-to-end behavior reproducible
- contract and flow validation against real service interaction

The important boundary is that isolated-mode mocks should support UI development and specification, not quietly become a second source of business truth.

For a BFF-enabled repository, that same boundary should also separate:

- SPA-only preview and interaction checks
- BFF contract mapping tests
- full local integration against the backend API

For observability, the same boundary should also separate:

- browser-facing telemetry capture
- BFF-side telemetry export and enrichment
- backend-side telemetry export and enrichment
- any collector or gateway that sits between public browser traffic and private telemetry destinations

## Backend-Contract Background

The legacy repository and `contacts-v2` expose similar CRUD intent but not identical contracts.

Observed differences already matter for frontend evaluation:

- legacy API and UI use `firstName`, `lastName`, and `phoneNumber`
- `contacts-v2` uses `first_name`, `last_name`, and `phone_number`
- `contacts-v2` adds auth expectations and richer error signaling than the legacy browser app modeled
- the backend may return not-found, validation, authorization, or duplicate responses that the old UI did not treat distinctly
- the backend currently exposes a simple health route, a diagnostic event route, and stable CRUD resource routes under `/contacts`
- create returns `201 Created` and a `Location` header, which the web app can use for route transitions or confirmations
- update treats the path ID as authoritative and rejects mismatched body IDs
- phone values are normalized on the backend, so the UI should not assume verbatim persistence of formatting characters
- auth is claims-based in the current runtime, so the web app needs a deliberate plan for how claims are supplied or proxied
- a single end-to-end user journey may need to produce one distributed trace, correlated logs, and aggregated metrics across SPA, BFF, and API
- browser telemetry should not embed permanent service credentials or bypass the collector path

This repository therefore likely needs a contract-mapping layer rather than letting backend transport naming leak directly into every component.

The BFF summary suggests that contract-mapping pressure may be more explicit than a simple client API wrapper: the repository may want a dedicated web BFF that owns browser-facing aggregation, auth/session plumbing, and response adaptation.

## Standard Artifacts Or Outputs The Domain Often Implies

- contacts list page
- new-contact page or route state
- edit-contact page or route state
- form validation messages
- loading and empty states
- mutation feedback after create, update, and delete
- transport adapters between UI models and backend payloads
- auth claim plumbing or a deliberate abstraction over it
- mock transport or isolated-mode fixtures for UI-only iteration
- web BFF route or adapter boundary for browser-specific delivery concerns
- a telemetry collector or ingress path for browser, BFF, and API observability

## Industry Language Worth Preserving

- contact
- contact list
- create contact
- edit contact
- delete contact
- empty state
- validation error
- loading state
- detail form
- duplicate contact

## Likely Omissions To Watch For During Evaluation

- no visible handling for backend failures
- route changes that show stale contact data
- immediate redirects that hide failed submissions
- deletion without confirmation or clear feedback
- tight coupling between components and raw HTTP payload shape
- assuming `first name` plus `last name` is enough for every real person record
- treating the legacy Mithril structure as if it were a domain constraint
- treating backend admin assumptions as if they automatically define the web experience role
- preserving starter-repo backend architecture guidance inside a frontend repository for too long
- assuming the backend will preserve the exact formatting typed by the user for phone numbers
- treating isolated-mode mocks as if they were authoritative domain behavior
- letting backend-free UI shortcuts diverge from the real contract without a clear boundary
- treating an integrated local dev stack as a substitute for the external backend contract instead of a local validation surface
- letting a web BFF absorb domain rules that should remain in the backend API
- letting the SPA and BFF merge into one indistinct component tree
- sending browser telemetry directly to the final observability backend without a controlled collector path
- treating traces, logs, and metrics as interchangeable signals instead of distinct observability concerns

## Specific Gaps Observed In The Reference Baseline

- The old web app assumes success on submit and navigates back to the list immediately.
- The old web app does not model explicit loading, submission, and failure states in a user-centered way.
- The legacy interface deletes directly from the list without a stronger safety pattern.
- The legacy UI and API contract use camelCase, while the current backend evidence uses snake_case.
- The repository’s current architecture documents do not yet describe a Solid frontend shape, so future phases need an explicit architectural correction.

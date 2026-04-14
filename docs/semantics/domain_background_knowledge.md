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

Even a narrow CRUD frontend needs explicit choices for these behaviors or it will feel broken despite a correct backend.

## Backend-Contract Background

The legacy repository and `contacts-v2` expose similar CRUD intent but not identical contracts.

Observed differences already matter for frontend evaluation:

- legacy API and UI use `firstName`, `lastName`, and `phoneNumber`
- `contacts-v2` uses `first_name`, `last_name`, and `phone_number`
- `contacts-v2` adds auth expectations and richer error signaling than the legacy browser app modeled
- the backend may return not-found, validation, authorization, or duplicate responses that the old UI did not treat distinctly

This repository therefore likely needs a contract-mapping layer rather than letting backend transport naming leak directly into every component.

## Standard Artifacts Or Outputs The Domain Often Implies

- contacts list page
- new-contact page or route state
- edit-contact page or route state
- form validation messages
- loading and empty states
- mutation feedback after create, update, and delete
- transport adapters between UI models and backend payloads

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

## Specific Gaps Observed In The Reference Baseline

- The old web app assumes success on submit and navigates back to the list immediately.
- The old web app does not model explicit loading, submission, and failure states in a user-centered way.
- The legacy interface deletes directly from the list without a stronger safety pattern.
- The legacy UI and API contract use camelCase, while the current backend evidence uses snake_case.
- The repository’s current architecture documents do not yet describe a Solid frontend shape, so future phases need an explicit architectural correction.

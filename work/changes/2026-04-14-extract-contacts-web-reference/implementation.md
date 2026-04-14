# Implementation

## Purpose

Record the main implementation choices for the first `contacts-web` build slice.

## Implemented Scope

- Solid browser runtime bootstrapped with Vite
- route-level list and create workflow using a minimal history-based navigation model
- explicit HTTP client and transport-mapping boundary for contacts list and create
- deterministic client tests for list, empty, create, and failure states
- deterministic contract tests for `snake_case` to `camelCase` mapping

## Key Choices

- used the `polyglot_client_server` slice shape in code by placing browser code under `src/client/`
- kept routing minimal and local to the slice instead of introducing a router dependency immediately
- kept the API boundary thin through `HttpContactsApiClient`
- isolated naming conversion and payload validation in `contactTransport`
- used a refetch-on-return approach after create so the list route stays authoritative

## Explicitly Deferred

- edit and delete flows
- auth UX and token handling
- optimistic updates
- richer contact fields
- broader architecture-doc cleanup beyond what the slice required

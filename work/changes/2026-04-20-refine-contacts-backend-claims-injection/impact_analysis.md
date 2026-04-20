# Impact Analysis

## Purpose

Document the architectural pressure introduced by explicit backend request claims before implementation begins.

## Main Tension

The frontend already knows how to map contacts payloads, but the backend requires claims-like headers on CRUD requests.

That creates a narrow implementation pressure:

- claims should be explicit at the request boundary
- claims should be configurable for local development and future environments
- auth failure should remain visible and distinct from validation or duplicate failures
- login UX should not be invented just to satisfy a header requirement

## Contract Pressure

The backend contract is not asking for a full auth subsystem. It is asking for request-level claims on admin CRUD requests.

That means the next slice should establish:

- a request-claims provider or helper
- a way to pass claims into the existing `ContactsApiClient`
- tests that prove all API methods include the expected headers
- visible handling for `403` failures

## Areas Impacted

- `src/client/api/httpContactsApiClient.js`
- `src/client/config.js`
- frontend tests under `tests/`
- future environment configuration docs

## Refine Decision

Keep the first claims slice narrow:

- default to static admin claims for local use
- keep the source overrideable by environment
- do not introduce login, token persistence, or auth screens

## Follow-Up

- build the request-claims boundary into the client API layer
- verify the backend-facing headers in tests
- keep the rest of the UI workflow unchanged

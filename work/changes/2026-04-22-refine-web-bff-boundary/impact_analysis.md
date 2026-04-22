# Impact Analysis

## Scope Of Impact

The BFF boundary changes the repository shape in three places:

- the browser SPA can no longer be treated as the only delivery runtime
- the direct browser-to-backend contact path moves behind the new web BFF
- request aggregation and auth/session plumbing move into a web-specific adapter
- tests need to distinguish SPA behavior, BFF behavior, and backend contract mapping

## Areas Affected

### Architecture

The repository now needs to be understood as a multi-runtime browser delivery repo:

- Solid SPA
- Node.js plus TypeScript BFF
- external `contacts-v2` API

The implemented shape is browser -> BFF -> backend, with the SPA using `/api` and the BFF talking to the backend transport contract.

### Shared Contracts

The BFF should own transport adaptation and browser-facing request aggregation.
Shared contracts should stay focused on shapes that both runtimes need, not on backend domain rules.

### Tests

Test coverage should separate:

- SPA route and interaction behavior
- BFF request/response behavior
- backend contract mapping and error preservation

The local test suite now has to account for both the browser-facing `/api` contract and the direct BFF server process.

### Local Development

The repository needs an explicit local path for the SPA talking to the BFF, and the BFF talking to the contacts backend.
The dev workflow should make it obvious when the browser is using the BFF rather than the backend directly.

## Tensions To Keep Explicit

- The BFF summary recommends Node.js plus TypeScript, and the current repository decision now matches that for the BFF while the SPA stack remains Solid.
- The BFF should not become a second source of domain truth.
- The BFF should not be mixed into SPA components or hidden behind generic client helpers.
- Mobile is expected to get its own BFF later, so this BFF must remain channel-specific.
- Auth/session handling is still intentionally explicit at the BFF boundary and should not drift into a login UX in this slice.

## Follow-Up Pressure From EGD

The build validated the boundary, but the review surfaced two refinement pressures for the next slice:

- claim injection is still config-backed in the BFF, so any future session work should be modeled explicitly instead of implied by architecture text
- direct edit/delete server-path evidence is still thinner than the rest of the CRUD boundary, so the next slice should strengthen runtime proof if that evidence matters

## Non-Goals

- no login UX
- no backend domain redesign
- no persistence changes
- no new contact business rules

# Impact Analysis

## Purpose

Document the architectural pressure introduced by the edit/delete slice before implementation begins.

## Main Tension

The browser app now has to do more than create and list contacts. It must load a specific record, let the user edit it, and remove it from the visible list while preserving backend contract semantics through the BFF boundary.

That creates several pressures:

- route identity matters because edit must refetch the correct contact
- update must preserve path-authoritative identity and surface body/path mismatch clearly
- delete must be visible and recoverable when unauthorized or missing
- the same transport mapper has to serve list, create, edit, and delete without turning into a generic HTTP bag
- the browser-facing request seam should remain BFF-mediated

## Contract Pressure

The backend contract is explicit enough to support this slice:

- `GET /contacts/{id}` can hydrate edit state
- `PUT /contacts/{id}` supports mutation with validation around body ID mismatch
- `DELETE /contacts/{id}` provides hard delete semantics
- `403`, `404`, `409`, and `400` should remain user-visible categories

The browser slice should therefore establish:

- a route-level edit state
- a delete action state
- a repeatable mapping from backend record shape to UI form state
- failure handling that distinguishes validation, not-found, duplicate/conflict, and authorization problems
- a BFF-mediated browser request boundary for the edit/delete workflow

## Areas Impacted

- `docs/slices/solid_contacts_edit_and_delete_with_shared_contract_mapping.md`
- frontend source layout under `src/`
- frontend tests under `tests/`
- later auth or safety-pattern slices

## Refine Decision

Keep edit and delete within the same transport contract boundary used by list and create, and keep that boundary routed through the BFF.

Do not introduce separate client abstractions for each route unless the implementation proves that a shared adapter is too weak.

## Follow-Up

- build the edit/delete slice around the existing `ContactsApiClient` and `ContactTransportMapper`
- verify the route identity and delete flow with deterministic tests
- leave auth UX and stronger delete-safety design for later if the backend contract does not force them immediately

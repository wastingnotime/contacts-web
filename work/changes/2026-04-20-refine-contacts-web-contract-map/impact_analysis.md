# Impact Analysis

## Purpose

Document the main tensions and architectural pressure created by the frontend-facing contract map before implementation begins.

## Main Tension

`contacts-web` is a browser experience, but the backend contract it consumes is a claims-based admin CRUD API with snake_case payloads, reached through the BFF boundary.

That creates a direct implementation pressure:

- the UI should speak in experience-language terms such as `firstName`, `lastName`, and `phoneNumber`
- the transport boundary must convert those fields to `first_name`, `last_name`, and `phone_number`
- route-level behavior must make auth, validation, not-found, and duplicate responses visible without leaking backend transport details into every component
- the browser should treat the BFF as the request boundary, not the backend itself

## Contract Pressure

The backend contract now gives the frontend explicit semantics for:

- health and readiness
- list and create on the home flow
- eventual edit and delete behavior
- `403`, `404`, `409`, and `400` response categories
- normalized phone numbers and path-authoritative update identity

That means the first frontend slice should not be a generic page skeleton. It should establish:

- a client model for list and create
- a transport mapper with named translation functions
- a request-status model that can represent loading, empty, submit failure, duplicate failure, and auth failure
- a route boundary that keeps post-submit behavior deterministic

## Areas Impacted

- `architecture.md`
- `docs/slices/solid_contacts_list_and_create_with_contract_mapping.md`
- frontend source layout under `src/`
- frontend tests under `tests/`
- future contract-mapping notes or adapter docs

## Refine Decision

Keep the first build slice limited to list and create, but make the contract adapter explicit enough that later edit and delete work can reuse the same boundary through the BFF.

Do not fold auth handling into generic UI state. Treat it as a specific backend contract concern that the browser may need to surface or proxy, with the BFF remaining the request seam.

## Follow-Up

- build the Solid client around a named transport adapter
- verify that the adapter maps only the current list/create contract first
- carry edit/delete and broader auth behavior into later slices after the adapter boundary is stable

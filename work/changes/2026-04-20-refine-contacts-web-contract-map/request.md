# Request

## Requested Change

Refine the extracted `contacts-web` and `contacts-v2` semantics into a frontend-facing contract map.

The goal is to make the browser-facing UI state, route behavior, and transport adapter explicit before implementation begins.

## Why This Exists

The current slice draft already points at a Solid client and an explicit transport boundary, but the adapter shape is still implicit. The repository needs a concrete contract map for:

- browser-friendly field names
- backend payload names
- auth claim handling
- validation and error feedback mapping
- route and submit behavior

## Scope

- update the current slice definition
- make the client model and transport adapter boundary explicit
- keep the slice narrow enough for deterministic build
- document tensions that should remain visible during implementation
- do not write production code

## Expected Output

- updated slice document for the frontend contract map
- impact analysis for the client/server boundary
- explicit contract mapping pressure for the next build slice

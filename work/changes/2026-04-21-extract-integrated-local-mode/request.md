# Request

## Source

Local note from `/home/henrique/Downloads/integrated_local_mode.md`.

## Signal

The repository needs a development mode for running multiple local services together so the contacts UI can be exercised against real service interaction instead of only isolated mocks.

## Evidence

- Docker Compose is the intended orchestration shape
- the stack includes a Python backend, a seeded local database, and the Solid frontend
- the mode is meant for contract validation, flow debugging, and integration testing

## Extracted Meaning

This is a separate local development surface from isolated mode.

Isolated mode is still useful for backend-free UI iteration, but integrated local mode is the place to inspect the real service boundary, deterministic seeded data, and end-to-end flow behavior while running everything locally.

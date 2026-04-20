# Impact Analysis

## Purpose

Document the architectural pressure created by adding a retry path to list-load failure handling before implementation begins.

## Main Tension

The list already exposes loading and error states, but the user currently has no obvious recovery path after a failed fetch.

That creates a focused implementation pressure:

- the browser should let the user retry the list fetch
- the retry should remain local to the list page
- existing create/edit/delete workflows should not change

## Contract Pressure

The backend contract does not need to change. The browser just needs a local retry action on the existing list resource.

The next slice should therefore establish:

- a retry action on the list-load error state
- deterministic refetch behavior when the backend becomes healthy on the next attempt
- tests that prove the retry path works without changing the rest of the list workflow

## Areas Impacted

- `src/client/pages/ContactsListPage.jsx`
- client tests under `tests/client/`

## Refine Decision

Keep the retry state local and small:

- no global request manager
- no backend changes
- no route redesign

## Follow-Up

- build a retry action into the list error banner
- verify the initial failure and retry success path with deterministic client tests

# Impact Analysis

## Change Summary

The isolated-mode implementation should move from a bespoke in-memory client to MSW-backed mock transport.

This is a frontend implementation refinement, not a backend contract change.

## Impacted Areas

- `src/client/main.jsx` startup flow
- contacts API client selection
- browser mock worker startup
- test server startup and reset hooks
- contacts fixture state used by isolated mode
- client tests that need deterministic mock transport

## Boundary Pressure

The repository now needs an explicit distinction between:

- live mode, which uses the existing HTTP contacts client against the backend
- isolated mode, which uses the same HTTP-facing client shape against MSW handlers

That distinction should remain obvious in code, tests, and docs.

## Risks

- mock handlers could drift away from the live contacts contract if they are not kept close to the HTTP client
- test suites could become flaky if mock state is not reset between runs
- the browser worker startup could interfere with the live mode path if mode selection is not explicit
- the current implementation already uses shared MSW handlers, worker startup, and deterministic reset hooks

## Next Build Pressure

The next build slice should introduce MSW handlers, worker/server startup, and deterministic reset hooks, then switch isolated mode to use that transport boundary instead of the custom in-memory client.

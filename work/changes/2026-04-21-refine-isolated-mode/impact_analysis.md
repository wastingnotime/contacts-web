# Impact Analysis

## Change Summary

The isolated mode signal points to a backend-free UI path that improves testability and edge-state inspection.

This is a front-end refinement, not a backend contract change.

## Impacted Areas

- `src/client/` runtime bootstrapping
- contacts API client selection
- mock transport or MSW setup
- Storybook or similar preview tooling if adopted
- client tests that need deterministic backend-free execution
- contract tests that must keep the live backend boundary separate

## Boundary Pressure

The repository now needs an explicit distinction between:

- live mode, which uses the existing contacts API client
- isolated mode, which uses deterministic mock transport

That distinction should remain obvious in code, tests, and docs.

## Risks

- mock behavior could drift away from the live contacts contract if the boundary is not explicit
- test suites could become ambiguous if live and isolated paths are not separated cleanly
- a preview tool such as Storybook could be treated as product runtime instead of inspection tooling

## Next Build Pressure

The next build slice should introduce a small, explicit isolated-mode entry point or configuration boundary that can be exercised in tests without changing the live contract path.

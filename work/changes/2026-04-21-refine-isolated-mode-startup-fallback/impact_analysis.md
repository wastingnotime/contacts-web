# Impact Analysis

## Change Summary

Isolated-mode bootstrap will render a visible startup failure view if the mock worker cannot register.

This is a frontend bootstrap change, not a backend contract change.

## Impacted Areas

- `src/client/main.jsx`
- a small bootstrap failure component or helper
- tests for isolated-mode startup failure

## Boundary Pressure

The repository needs to keep three paths distinct:

- live app bootstrap
- isolated app bootstrap
- isolated bootstrap failure

The failure path should not be implemented by silently switching to live mode, because that would hide the actual bootstrap problem and blur the mode boundary.

## Risks

- catching startup failures too broadly could hide unrelated bootstrap errors
- a failure screen that is too vague would be hard to use during local development
- the failure path could drift from the app shell styling if it is not rendered with the shared UI frame

## Next Build Pressure

The next build slice should add a bootstrap error view and wire isolated-mode startup through it when worker registration rejects, with deterministic tests that confirm the app shows the failure instead of crashing.

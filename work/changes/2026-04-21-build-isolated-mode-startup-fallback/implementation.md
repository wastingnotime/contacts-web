# Implementation

## Slice

`solid_contacts_isolated_mode_startup_fallback`

## What Changed

- added a bootstrap coordinator that catches isolated-mode worker startup failures
- added a visible bootstrap failure view for isolated mode
- changed the app entrypoint to use the bootstrap coordinator
- added a deterministic client test for isolated-mode startup rejection
- made the isolated worker import lazy so the bootstrap module stays testable outside browser worker startup

## Behavior

- isolated mode now renders a visible failure view if the worker cannot register
- the browser no longer crashes on isolated bootstrap rejection
- live mode bootstrap remains unchanged

## Validation

- `npm test`
- `npm run build`

## Notes

- the failure view stays local to bootstrap behavior and does not silently fall back to live mode

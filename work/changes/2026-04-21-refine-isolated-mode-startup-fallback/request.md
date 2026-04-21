# Request

## Source

Follow-up from the isolated-mode work after the MSW worker asset fix.

## Signal

Isolated-mode startup can fail before the app mounts if the worker cannot register.

## Evidence

- the app currently starts the mock worker during bootstrap
- a worker registration failure throws before the contacts UI is rendered
- the failure is currently low-level and hard to diagnose

## Extracted Meaning

Isolated mode should keep failing explicitly, but it should fail visibly.

The bootstrap path needs a fallback view that explains the isolated worker could not start instead of leaving the browser in an unhandled rejection state.

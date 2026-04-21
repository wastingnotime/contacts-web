# Request

## Source

Follow-up request to strengthen isolated-mode confidence after the startup-fallback refinement.

## Signal

The isolated runtime already has unit coverage, but it still needs a small end-to-end smoke test over the real transport boundary.

## Evidence

- isolated mode boots with MSW-backed transport in the browser path
- the current tests cover app behavior heavily with stubs
- a single deterministic smoke path would better protect the real isolated runtime boundary

## Extracted Meaning

Isolated mode should prove its own transport boundary, not only the stubbed page behavior.

The next slice should add one deterministic smoke test that exercises list, create, edit, and delete through the real isolated runtime path.

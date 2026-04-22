# Impact Analysis

## Change Summary

Isolated mode will gain one deterministic smoke test over the real MSW-backed transport path.

This is a client-test change, not a backend contract change.

## Impacted Areas

- `tests/client/`
- isolated-mode app mounting helpers
- MSW-backed runtime coverage

## Boundary Pressure

The repository needs to keep three layers distinct:

- stubbed unit tests for page behavior
- isolated-mode smoke coverage for the real transport boundary
- live-mode contract tests
- the current smoke path as an already-existing deterministic boundary

The smoke test should not replace the unit suite or grow into a generic browser automation layer.

## Risks

- overextending the smoke test could make it flaky or slow
- using stubs in the smoke test would miss the actual isolated transport boundary
- duplicating too much page-level logic could make the smoke test hard to maintain

## Next Build Pressure

The next build slice should add one focused deterministic test that boots isolated mode through the real contacts API client and verifies list, create, edit, and delete still work through MSW.

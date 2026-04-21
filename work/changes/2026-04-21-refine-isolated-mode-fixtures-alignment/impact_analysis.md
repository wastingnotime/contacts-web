# Impact Analysis

## Change Summary

Isolated-mode and Storybook contact seeds will be derived from one shared local fixture source.

This is a fixture alignment change, not a backend contract change.

## Impacted Areas

- `src/client/fixture` or similar shared seed module
- Storybook fixture helpers
- isolated transport seed state
- optional fixture-alignment tests

## Boundary Pressure

The repository needs to keep these concerns separate:

- shared local seed contacts
- Storybook view-model fixtures
- isolated transport fixtures
- live backend contract data

The shared source should reduce duplication without hiding the distinction between view-model and transport shapes.

## Risks

- the shared fixture source could become too clever and obscure the actual contact shapes
- changing the seed source could accidentally change both preview and isolated runtime behavior at once
- fixture derivation could drift if only one consumer is updated

## Next Build Pressure

The next build slice should add one small shared contact seed module, update Storybook and isolated runtime helpers to use it, and add a deterministic test that proves the shapes stay aligned.

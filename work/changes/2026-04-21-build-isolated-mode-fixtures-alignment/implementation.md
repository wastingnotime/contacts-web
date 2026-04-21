# Implementation

## Slice

`solid_contacts_isolated_mode_fixtures_alignment`

## What Changed

- added a shared local contact seed module
- updated Storybook fixture helpers to derive view-model seeds from the shared source
- updated isolated-mode MSW transport seeds to derive transport contacts from the shared source
- added a deterministic alignment test for the shared fixture shapes

## Behavior

- Storybook and isolated mode now use the same canonical local contact seeds
- the view-model and transport shapes remain explicit
- fixture drift risk is reduced without changing live backend behavior

## Validation

- `npm test`
- `npm run build`

## Notes

- the shared seed source stays small and explicit so it does not hide the distinction between preview fixtures and transport fixtures

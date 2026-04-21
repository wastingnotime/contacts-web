# Impact Analysis

## Change Summary

Storybook will be added as a local preview runtime for contact form and list states.

This is a frontend preview change, not a backend contract change.

## Impacted Areas

- `package.json` scripts and dev dependencies
- `.storybook/` configuration
- story files colocated with the Solid components and pages
- shared CSS loading in the preview frame
- deterministic fixture helpers for stories

## Boundary Pressure

The repository needs a clear separation between:

- the live app bootstrap path
- the isolated app runtime
- the Storybook preview runtime

Storybook should use local fixtures and shared styles, but it should not become another route into the live app or backend boundary.

## Risks

- preview stories could become redundant if they are too close to app bootstrap code
- adding too many stories too early could dilute the focus of the preview surface
- Storybook config could drift from the app styling if shared CSS is not loaded in preview

## Next Build Pressure

The next build slice should add Storybook config, a script to start it, and deterministic stories that cover the contact form, contacts list, create page, and edit page across empty, loading, validation, missing-record, submit-pending, and error states.

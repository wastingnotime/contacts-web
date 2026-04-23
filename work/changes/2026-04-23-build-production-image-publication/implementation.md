# Implementation

## Slice Implemented

`docs/slices/contacts_web_production_image_publication.md`

## What Changed

- Added a shared production image publication helper at `src/shared/production/contactsWebImagePublication.js`
- Added a publication script at `scripts/publish-production-images.mjs`
- Added a production image publication script entry in `package.json`
- Added deterministic tests for stable and distinct SPA/BFF image references in `tests/contracts/productionImagePublication.test.js`

## Notes On Boundary Shape

- The SPA and BFF image references are explicit and separate
- The BFF reference preserves the production artifact boundary
- The publication script emits a concrete handoff artifact for downstream infra use
- The infra repository is still separate and still does not deploy this service yet

## Validation

- `npm test`
- `npm run build`
- `npm run publish:images`

These commands should confirm the publication contract is repeatable.

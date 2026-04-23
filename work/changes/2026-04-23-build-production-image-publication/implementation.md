# Implementation

## Slice Implemented

`docs/slices/contacts_web_production_image_publication.md`

## What Changed

- Added a shared production image publication helper at `src/shared/production/contactsWebImagePublication.js`
- Added a manifest writer at `src/shared/production/publishContactsWebImagePublication.js`
- Added a publication script at `scripts/publish-production-images.mjs`
- Added a production image publication script entry in `package.json`
- Added deterministic tests for stable repository-aligned SPA/BFF image references in `tests/contracts/productionImagePublication.test.js`
- Added a manifest writer test in `tests/contracts/productionImagePublicationWriter.test.js`
- Checked in the publication manifest at `work/publications/contacts_web_image_publication.json`

## Notes On Boundary Shape

- The SPA and BFF image references share the same `contacts-web` repository and separate tags
- The BFF reference preserves the production artifact boundary with the `bff-latest` tag
- The publication script emits a concrete handoff artifact for downstream infra use
- The infra repository is still separate and still does not deploy this service yet

## Validation

- `npm test` passed
- `npm run build` passed
- `npm run publish:images` passed and wrote [work/publications/contacts_web_image_publication.json](/home/henrique/repos/github/wastingnotime/contacts-web/work/publications/contacts_web_image_publication.json)

These commands confirm the publication contract is repeatable and emits a concrete manifest artifact.

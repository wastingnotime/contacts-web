# Implementation

## Slice Implemented

Solid contacts authorization failure states.

## What Changed

- added a shared contacts error-message helper
- updated list, create, and edit pages to render authorization failures explicitly
- kept delete failures visible with the backend-provided message
- preserved the existing request claims and transport boundaries

## Tests Added or Updated

- added contract coverage for the shared authorization message helper
- added client coverage for authorization failure on list load, create, and edit
- kept the existing deletion and generic error tests intact

## Validation

- `npm test`
- `npm run build`

## Notes

- this slice deliberately stops at surfacing `403` clearly
- login, session storage, and token refresh remain out of scope

# Implementation

## Slice Implemented

`docs/slices/solid_contacts_web_bff_boundary.md`

## What Changed

- Added a TypeScript web BFF server at `apps/bff/src/server.ts`
- Added a TypeScript BFF facade at `apps/bff/src/contactsWebBff.ts`
- Added a raw backend gateway at `apps/bff/src/httpContactsBackendGateway.ts`
- Changed `src/client/api/createContactsApiClient.js` so the SPA talks to the BFF endpoint instead of the raw backend
- Kept `src/client/api/httpContactsApiClient.js` as the browser-facing HTTP client under the BFF boundary
- Added TypeScript-specific BFF tests in `tests/bff/contactsWebBff.test.ts` and `tests/bff/contactsWebBffServer.test.ts`
- Extended the direct BFF server-path test to cover list, create, get, update, and delete through the actual server process
- Updated contract tests so the browser client now targets the BFF contract while the backend gateway stays transport-focused
- Added `typescript` and `tsx` as dev dependencies so the repository explicitly supports the TS BFF runtime

## Notes On Boundary Shape

- The Solid SPA remains JavaScript
- The browser-facing client now talks to the `/api` BFF endpoint
- Contract translation happens in the TypeScript BFF layer, while the browser client stays focused on HTTP transport
- Existing list/create/edit/delete browser flows continue to work through the BFF server process
- The BFF server test now proves the actual runtime path for the CRUD boundary, not just the facade mapping

## Validation

- `npm test`
- `npm run build`

Both commands passed after the BFF boundary refactor.

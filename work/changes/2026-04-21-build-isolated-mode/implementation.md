# Implementation

## Slice

`solid_contacts_isolated_mode`

## What Changed

- added `IsolatedContactsApiClient` with deterministic in-memory contacts data
- added `createContactsApiClient` to select live or isolated runtime mode
- added `VITE_CONTACTS_UI_MODE` support in client config
- added a visible runtime badge to the app shell
- kept the live HTTP client path intact
- added tests for runtime mode selection and isolated-mode app bootstrapping

## Behavior

- live mode continues to use the existing HTTP backend client
- isolated mode uses a backend-free mock client
- isolated mode can list, create, update, and delete contacts deterministically
- the app shell now shows whether the runtime is live or isolated

## Validation

- `npm test`
- `npm run build`

## Notes

- the isolated client is intentionally separate from the live API client
- no backend contract changes were made

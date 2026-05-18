# Auth Contract

The auth contract defines browser expectations around authentication and authorization at the web boundary.

## Stable Semantics

- the browser may attach auth subject and role hints to requests when the runtime provides them
- authorization failures are rendered as explicit user-facing errors
- auth failure should not collapse into generic transport failure when the backend signals a known category
- the browser does not own login UX in the current slice set
- no persistent auth session store is exposed by the browser contract today

## Current Repository Surfaces

- `tests/contracts/httpContactsApiClient.test.js`
- `tests/contracts/contactTransport.test.js`
- `src/client/api/httpContactsApiClient.js`
- `src/client/contracts/contactErrors.js`
- slice documents under `docs/slices/` when auth behavior is being refined

## Boundary Rule

Auth semantics belong at the boundary. Do not infer them from backend internals or implementation details.

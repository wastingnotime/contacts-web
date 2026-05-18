# Session Contract

The session contract defines browser expectations for session state and continuity.

## Stable Semantics

- the current browser runtime has no dedicated login session model in the client boundary
- runtime mode is explicit and can be `live`, `isolated`, or `integrated-local`
- isolated mode starts the mock worker before rendering the app
- isolated bootstrap failure renders an explicit failure screen
- the browser should remain usable after reload through the normal route and runtime mode controls

## Current Repository Surfaces

- `src/client/config.js`
- `src/client/bootstrap/bootstrapContactsApp.jsx`
- `src/client/bootstrap/ContactsBootstrapFailure.jsx`
- `tests/client/isolatedMode.test.jsx`

## Boundary Rule

Session behavior should be explicit in the browser contract instead of being left as an ambient assumption.

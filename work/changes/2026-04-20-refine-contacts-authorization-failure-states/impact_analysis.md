# Impact Analysis

## Purpose

Document the architectural pressure created by surfacing authorization failures explicitly before implementation begins.

## Main Tension

The backend is already distinguishing authorization from other request failures, but the browser can still hide that distinction in generic error messaging even when requests pass through the BFF.

That creates a focused implementation pressure:

- list, create, edit, and delete must each treat `403` as its own category
- the user should stay on the current workflow state when authorization fails
- authorization failures should not be mistaken for validation, duplicate, or not-found problems
- the BFF request seam should remain visible in the implementation shape

## Contract Pressure

The backend contract already supplies the signal we need:

- `403` means the request is not allowed
- other error codes already have their own browser-facing meaning

The next slice should therefore establish:

- one shared error-mapping helper for contacts workflows
- page-level rendering that uses the helper consistently
- tests that prove `403` stays distinct on all main routes

## Areas Impacted

- `src/client/pages/ContactsListPage.jsx`
- `src/client/pages/CreateContactPage.jsx`
- `src/client/pages/EditContactPage.jsx`
- `src/client/contracts/contactTransport.js` or a small shared helper module
- frontend tests under `tests/`

## Refine Decision

Keep the slice narrow:

- do not add login
- do not change the claims boundary
- do not change transport naming or request payload shape
- only make the authorization category visible and consistent
- preserve the current BFF-backed request path

## Follow-Up

- build a small shared error-message helper
- update the pages to use it
- verify the `403` cases with deterministic tests

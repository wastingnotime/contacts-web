# Navigation Contract

The navigation contract defines how the browser moves through the Contacts web experience.

## Stable Semantics

- `/` shows the contacts list
- `/new` shows the create form
- `/edit/:contactId` shows the edit form for that contact
- browser history updates through `pushState` when in-app navigation occurs
- back/forward navigation updates the rendered route
- route changes can emit telemetry without exposing internal routing mechanics

## Current Repository Surfaces

- `src/client/App.jsx`
- `src/client/main.jsx`
- `src/client/bootstrap/bootstrapContactsApp.jsx`
- `src/client/pages/ContactsListPage.jsx`
- `src/client/pages/CreateContactPage.jsx`
- `src/client/pages/EditContactPage.jsx`
- `tests/client/`

## Boundary Rule

Navigation should remain understandable from exported semantics, not from local rendering shortcuts.

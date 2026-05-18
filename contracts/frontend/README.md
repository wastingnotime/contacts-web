# Frontend Contract

The frontend contract describes browser-visible behavior for the Contacts web experience.

## Stable Semantics

- the app boots into a browser shell with a runtime badge
- the list route is the default experience at `/`
- `/new` opens the create flow
- `/edit/:contactId` opens the edit flow
- the list page exposes create, edit, and delete actions
- create and edit flows validate required fields before submit
- list, create, edit, and delete flows surface loading and error states explicitly
- delete flow requires a confirmation step before the destructive request is sent

## Current Repository Surfaces

- `src/client/App.jsx`
- `src/client/pages/ContactsListPage.jsx`
- `src/client/pages/CreateContactPage.jsx`
- `src/client/pages/EditContactPage.jsx`
- `src/client/components/ContactFormFields.jsx`
- `tests/client/`

## Boundary Rule

Do not couple visiting agents or tests to component internals when the public interaction contract is enough.

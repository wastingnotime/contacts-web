# BFF Contract

The BFF contract defines how the browser talks to the backend through the web boundary.

## Stable Semantics

- the default browser API base URL is `/api`
- browser requests stay on relative paths when the app is using the default runtime
- the HTTP client sends `Accept: application/json` on browser-facing requests
- JSON submissions add `Content-Type: application/json`
- telemetry headers travel with browser requests
- BFF runtime summaries can be emitted as OTLP logs through the shared collector when observability is configured
- `GET /contacts` loads the list
- `GET /contacts/:id` loads a single contact
- `POST /contacts` creates a contact
- `PUT /contacts/:id` updates a contact
- `DELETE /contacts/:id` deletes a contact
- `POST /telemetry` records runtime telemetry
- backend `400`, `403`, `404`, and `409` responses map to explicit browser-facing errors where possible

## Current Repository Surfaces

- `src/client/api/httpContactsApiClient.js`
- `src/client/api/createContactsApiClient.js`
- `src/client/config.js`
- `src/client/contracts/contactTransport.js`
- `tests/contracts/httpContactsApiClient.test.js`
- `tests/contracts/createContactsApiClient.test.js`
- `tests/contracts/contactTransport.test.js`

## Boundary Rule

Treat the BFF as the browser-facing integration seam, not as a repository-wide implementation shortcut.

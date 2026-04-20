# Request

## Requested Change

Refine the next `contacts-web` slice so backend request claims are explicit and configurable.

## Why This Exists

The current frontend client can reach the backend contract shape, but backend CRUD requests still need claims headers. The browser should own a small request-claims boundary without growing login UX.

## Scope

- update or add a slice document for request-claims injection
- keep the transport adapter boundary explicit
- keep login/session UX out of scope
- document failure categories for authorization and request execution
- do not write production code

## Expected Output

- explicit slice definition for backend request claims
- deterministic test plan for claim headers and authorization failure handling
- impact analysis for the next build increment

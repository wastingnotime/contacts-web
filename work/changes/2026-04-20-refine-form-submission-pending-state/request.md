# Request

## Requested Change

Refine the next `contacts-web` slice so create and edit submissions expose a clear pending state while the backend request is in flight.

## Why This Exists

The create and edit forms already block duplicate submits, but the browser still reads like a silent pause while the request runs. The workflow should make that in-flight state visible without changing the backend contract.

## Scope

- update or add a slice document for form submission pending state
- keep the existing transport, claims, and error boundaries intact
- keep validation behavior unchanged
- do not write production code

## Expected Output

- explicit slice definition for create/edit submit pending state
- deterministic test plan for visible pending feedback and disabled repeat submit actions
- impact analysis for the next build increment

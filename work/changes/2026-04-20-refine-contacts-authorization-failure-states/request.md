# Request

## Requested Change

Refine the next `contacts-web` slice so backend `403` responses are rendered as explicit authorization failures across the browser workflows.

## Why This Exists

The browser already sends request claims, but some failure paths still collapse authorization into generic messaging. The client should surface `403` distinctly on list, create, edit, and delete routes.

## Scope

- update or add a slice document for authorization failure states
- keep login/session UX out of scope
- keep the transport and claims boundaries intact
- document browser-facing `403` behavior
- do not write production code

## Expected Output

- explicit slice definition for authorization failure states
- deterministic test plan for list/create/edit/delete `403` cases
- impact analysis for the next build increment

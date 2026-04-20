# Request

## Requested Change

Refine the next `contacts-web` slice so list-load failures expose an explicit retry path in the browser.

## Why This Exists

The contacts list already shows an error when the initial fetch fails, but it leaves the user without a clear recovery action. The list should let the browser retry deterministically.

## Scope

- update or add a slice document for list load retry
- keep the existing transport, claims, and error boundaries intact
- keep create, edit, and delete workflows unchanged
- do not write production code

## Expected Output

- explicit slice definition for list retry behavior
- deterministic test plan for a failing load followed by a retry
- impact analysis for the next build increment

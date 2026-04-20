# Request

## Requested Change

Refine the next `contacts-web` slice so duplicate and missing-record backend responses are rendered as explicit browser states instead of generic form or alert messaging.

## Why This Exists

The client already receives `duplicate` and `not_found` responses, but the browser copy still reads as a plain backend message. The UI should make those conflict and missing-record states clearer across the relevant workflows.

## Scope

- update or add a slice document for duplicate and missing-record messaging
- keep transport, claims, and request-pending behavior unchanged
- keep validation behavior unchanged
- do not write production code

## Expected Output

- explicit slice definition for duplicate and missing-record states
- deterministic test plan for create, edit, and delete error cases
- impact analysis for the next build increment

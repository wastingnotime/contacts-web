# Request

## Requested Change

Refine the next `contacts-web` slice so edit and delete workflows are explicit and share the same contract-mapping boundary as list and create.

## Why This Exists

The current frontend contract map covers list and create. The backend contract already supports get, update, and delete, so the browser slice should define those workflows before implementation begins.

## Scope

- update or add a slice document for edit and delete
- keep the transport adapter boundary explicit
- keep auth handling as a boundary concern
- document failure categories for get, update, and delete
- do not write production code

## Expected Output

- explicit slice definition for edit and delete
- deterministic test plan for route identity, update, and delete flows
- impact analysis for the next build increment

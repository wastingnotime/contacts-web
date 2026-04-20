# Request

## Requested Change

Refine the next `contacts-web` slice so delete is confirmed explicitly before the backend request is sent.

## Why This Exists

The list view currently deletes contacts directly. The browser should require a confirmation step before destructive actions execute.

## Scope

- update or add a slice document for delete confirmation
- keep backend transport and claims boundaries unchanged
- preserve existing auth and error handling
- do not write production code

## Expected Output

- explicit slice definition for delete confirmation
- deterministic test plan for confirm and cancel paths
- impact analysis for the next build increment

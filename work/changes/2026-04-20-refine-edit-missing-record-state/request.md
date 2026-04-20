# Request

## Requested Change

Refine the next `contacts-web` slice so the edit route shows a dedicated missing-record state when the contact no longer exists.

## Why This Exists

The edit page currently treats a missing contact as a generic error. The route should tell the user that the target record is stale or gone and provide a clear way back to the list.

## Scope

- update or add a slice document for edit-route missing-record state
- keep transport, claims, retry, and delete behavior unchanged
- keep validation and submit-pending behavior unchanged
- do not write production code

## Expected Output

- explicit slice definition for edit missing-record handling
- deterministic test plan for a missing edit target
- impact analysis for the next build increment

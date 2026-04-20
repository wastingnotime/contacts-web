# Implementation

## Slice Implemented

Solid contacts edit missing record state.

## What Changed

- rendered a dedicated missing-record panel when the edit target cannot be loaded
- kept the back-to-list escape available from that state
- preserved the existing form, submit-pending, and update-failure behavior for loaded contacts

## Tests Added or Updated

- added client coverage for opening an edit route whose contact no longer exists
- adjusted edit-path tests to wait for the loaded form before interaction

## Validation

- `npm test`
- `npm run build`

## Notes

- the missing-record edit state is local to the route
- backend transport and claims behavior were unchanged

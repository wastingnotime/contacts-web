# Implementation

## Slice Implemented

Solid contacts form submission pending state.

## What Changed

- exposed a visible pending state on create submission
- exposed a visible pending state on edit submission
- disabled repeat submit and navigation actions while the request is in flight
- kept validation, success navigation, and failure handling intact

## Tests Added or Updated

- added client coverage for create submit pending state
- added client coverage for edit submit pending state
- kept existing success and failure tests intact

## Validation

- `npm test`
- `npm run build`

## Notes

- the pending state stays local to each form page
- backend transport and claims behavior were unchanged

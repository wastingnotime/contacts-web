# Implementation

## Slice

`solid_contacts_isolated_mock_transport`

## What Changed

- added shared MSW contacts handlers for list, create, get, update, and delete
- added browser worker startup for isolated mode
- added a node test server and reset hook for deterministic tests
- changed isolated mode to use the same `HttpContactsApiClient` shape as live mode
- kept the live backend path intact
- removed the bespoke isolated in-memory client

## Behavior

- live mode continues to use the existing HTTP backend client
- isolated mode now uses MSW transport interception instead of a custom client implementation
- isolated mode can list, create, update, and delete contacts deterministically
- mock state resets between tests

## Validation

- `npm test`
- `npm run build`

## Notes

- the mock transport remains separate from the live backend contract
- no backend contract changes were made

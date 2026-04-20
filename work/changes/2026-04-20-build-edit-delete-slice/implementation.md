# Implementation

## Slice Implemented

Solid contacts edit and delete with shared contract mapping.

## What Changed

- added a shared contact form field component
- added an edit contact page that loads one contact, supports update, and returns to the list on success
- extended the contacts list page with edit and delete actions
- extended the HTTP contacts API client with get, update, and delete methods
- extended transport mapping to cover update payloads and additional backend error categories
- kept UI field names in `camelCase` and backend transport in `snake_case`
- preserved the contract boundary between browser state and backend payloads

## Tests Added or Updated

- added contract tests for update payload mapping and explicit API error mapping
- added HTTP API client contract tests for list, get, update, and delete
- added client tests for edit load/update flows and delete flows

## Validation

- `npm test`
- `npm run build`

## Notes

- delete is modeled as a direct list action with visible failure feedback
- update keeps the path ID authoritative by carrying the contact ID in the edit draft
- no auth login UX was introduced; auth remains a boundary concern only

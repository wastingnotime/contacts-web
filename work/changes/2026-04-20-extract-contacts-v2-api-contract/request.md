# Request

## Requested Change

Extract the API contract from `/home/henrique/repos/github/wastingnotime/contacts-v2` and record it as explicit repository evidence for `contacts-web`.

## Why This Exists

`contacts-web` needs a stable reference for the backend surface it will consume. The contract should be explicit before frontend slices are refined so the web app does not invent payload names, auth assumptions, or error handling.

## Scope

- inspect the sibling `contacts-v2` repository
- extract the HTTP surface, payload shape, auth boundary, and main error responses
- create source evidence under `work/sources/`
- update semantic docs in `docs/semantics/`
- do not design a frontend implementation slice yet
- do not write production code

## Expected Output

- explicit API contract summary for `contacts-v2`
- traceable source inventory
- updated semantic baseline for backend contract mapping pressure

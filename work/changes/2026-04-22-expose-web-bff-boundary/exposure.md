# Exposure Plan

## Released State

`contacts-web` web BFF release accepted in `work/changes/2026-04-22-release-web-bff-boundary/release_decision.md`.
The released BFF state currently includes a config-backed claims boundary and direct server-path evidence for list, create, edit, and delete.

## Exposure Target

Expose the released BFF state in a local browser context by running the released BFF server alongside the Vite frontend and opening the contacts experience through the `/api` proxy boundary.

Concrete local setup:

- start the BFF server with `npm run dev:bff`
- start the SPA with `npm run dev`
- browse the contacts experience through the Vite dev server, which proxies `/api` to the BFF
- use the existing admin claim defaults from the BFF config when exercising the local backend path

This exposure target is intended to put the released internal state in contact with a real browser session, not to define long-term operations ownership.

## Expected Real-World Contact

- browser users navigating the contacts list, create, edit, and delete workflows
- BFF routing and contract mapping through the `/api` boundary
- local backend responses through the BFF adapter
- the BFF config boundary for request claims
- manual interaction with the released BFF-backed UI state

## Feedback Channels

Expected feedback should come from:

- visible browser behavior and route transitions
- browser console warnings or errors
- network request/response behavior in browser devtools
- BFF server logs and startup behavior
- the BFF config values used for backend claims and routing
- follow-up living artifacts if exposure reveals friction, gaps, or drift

## Exposure Notes

- no code changes are part of this step
- no backend contract changes are part of this step
- this exposure only records how the released BFF state should be brought into contact with reality

# Exposure Plan

## Released State

`contacts-web` release accepted in `work/changes/2026-04-20-release-contacts-web/release_decision.md`.

## Exposure Target

Expose the released build in a local browser context by running the Vite frontend (`npm run dev`) and opening the contacts experience against the local backend boundary at `http://0.0.0.0:8010`.

This exposure target is intended to put the released internal state in contact with a real browser session, not to define long-term operations ownership.

## Expected Real-World Contact

- browser users navigating the contacts list, create, edit, and delete workflows
- local backend responses through the existing HTTP contract
- manual interaction with the released UI state

## Feedback Channels

Expected feedback should come from:

- visible browser behavior and route transitions
- browser console warnings or errors
- network request/response behavior in the browser devtools
- follow-up living artifacts if exposure reveals friction, gaps, or drift

## Exposure Notes

- no code changes are part of this step
- no backend contract changes are part of this step
- this exposure only records how the released build should be brought into contact with reality


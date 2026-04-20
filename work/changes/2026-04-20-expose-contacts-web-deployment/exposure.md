# Deployment Exposure Plan

## Released State

`contacts-web` release accepted in `work/changes/2026-04-20-release-contacts-web/release_decision.md`.

## Exposure Target

Expose the released build as a portable static frontend artifact packaged into a container image.

The container should serve the built `dist/` output so the released UI can be exercised in a browser against the contacts backend boundary.

## Why This Target

- the repository has no existing deployment platform integration
- the app is a browser frontend, so a portable static runtime is sufficient
- MRL guidance prefers a container image as the default portable exposure form

## Expected Contact With Reality

- browser users loading the released build from the containerized frontend
- backend requests routed to the existing contacts API boundary
- operational observation from container startup, logs, and browser devtools

## Feedback Channels

Expected feedback should come from:

- container startup and health behavior
- browser console warnings or errors
- network request/response behavior in devtools
- follow-up living artifacts if exposure reveals friction, gaps, or drift

## Exposure Notes

- no code changes are part of this step
- no backend contract changes are part of this step
- this plan records the intended deployment-style exposure, not the deployment implementation itself


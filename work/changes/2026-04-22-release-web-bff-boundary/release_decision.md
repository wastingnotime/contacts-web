# Release Decision

## Decision

Accept the current web BFF build as the intended internal version.

## Basis

Reviewed inputs:

- implemented BFF slice and implementation note at `work/changes/2026-04-22-build-web-bff-boundary/implementation.md`
- passing test and build runs
- lightweight EGD report at `work/changes/2026-04-22-build-web-bff-boundary/egd.md`
- current slice definition at `docs/slices/solid_contacts_web_bff_boundary.md`

## Summary

The build is coherent with the current model:

- the browser talks to the BFF endpoint rather than directly to the backend
- the BFF server process exists and serves the CRUD boundary
- the TypeScript BFF owns request shaping and backend adaptation
- list, create, edit, and delete flows remain coherent through the BFF server path
- isolated-mode and browser-facing mock transport remain separate from the live BFF contract

## Non-Blocking Review Notes

The EGD surfaced follow-up pressure, but not release blockers:

- auth/session handling is still config-backed rather than a real browser identity flow
- direct server-path evidence for edit/delete was thinner before the final CRUD server-path test, but the current build now covers that path
- isolated-mode mocks remain intentionally separate from the real BFF contract

These are acceptable for release because they do not contradict the current slice or block the core contacts workflows.

## Regression View

No blocking regression evidence was found.

## Follow-Up Candidates

If the model needs more refinement later, the strongest next candidate is auth/session handling once real auth material exists.

That work should enter the loop through `extract` when the auth boundary becomes available.

# Impact Analysis

## Scope Of This Refinement

This refinement turns the extracted production architecture note into one bounded slice:

- the repository must publish a portable static SPA artifact
- the repository must publish a Swarm-compatible BFF container image
- the BFF must bind on the production port expected by Traefik ingress
- browser requests should keep using relative `/api` paths
- the image handoff is for `../infra-platform`, even though that repository does not yet deploy this service

## Affected Areas

- `architecture.md`
- `decisions.md`
- `docs/semantics/model_hypothesis.md`
- `docs/semantics/domain_background_knowledge.md`
- production artifact publication and later build automation

## Boundary Changes

- production delivery is now a first-class packaging boundary, not an implicit infra assumption
- the SPA and BFF remain separate runtime surfaces
- the BFF remains the delivery adapter in production, not just in local development
- the production artifact boundary exists independently of deployment wiring

## Risks If The Slice Drifts

- the repo could fall back to publishing only the SPA container and leave the BFF as an undocumented runtime dependency
- production routing could drift away from the relative `/api` path used in development
- the BFF could become a local-only process instead of a deployable artifact
- the handoff to `../infra-platform` could be forgotten, leaving the BFF image unpublished when deployment work finally arrives

## Follow-Up Pressure

- implementation will need a concrete image publishing path for the BFF
- later build work may need to prove the BFF binds on the production port and fits the infra contract
- the next refinement after this one may need to name the handoff contract for `../infra-platform` more explicitly if deployment work starts
- deployment tooling should remain separate from the slice definition until the build step

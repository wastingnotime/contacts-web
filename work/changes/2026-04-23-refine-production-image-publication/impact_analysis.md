# Impact Analysis

## Scope Of This Refinement

This refinement turns production delivery into an explicit publication handoff:

- the SPA image reference should be stable and reproducible
- the BFF image reference should be stable and reproducible
- the BFF remains a required artifact because the infra repo does not yet deploy this service
- `../infra-platform` should be able to consume the artifact references later

## Affected Areas

- `docs/slices/contacts_web_production_delivery_boundary.md`
- `decisions.md`
- `docs/semantics/model_hypothesis.md`
- `docs/semantics/domain_background_knowledge.md`
- release/publish metadata that may be added later

## Boundary Changes

- production delivery expands from "buildable images" to "publishable image references"
- the infra handoff becomes explicit without becoming a deployment implementation
- the SPA and BFF remain separate production artifacts

## Risks If The Slice Drifts

- the repo could treat image publication as implied and never record the actual references
- the BFF image could disappear from the handoff story even though it is still required
- downstream infra could end up depending on conversational memory instead of versioned artifact references

## Follow-Up Pressure

- later build work may need a concrete publication mechanism, but this slice should stay at the handoff-contract level
- if infra later requires a specific registry or tag schema, that should be recorded as a new slice or decision rather than widened here

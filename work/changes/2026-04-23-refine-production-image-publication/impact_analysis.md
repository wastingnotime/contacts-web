# Impact Analysis

## Scope Of This Refinement

This refinement turns publication handoff into a manifest-level artifact:

- the repo emits a machine-readable publication manifest
- the manifest contains the stable SPA and BFF image references
- the BFF image remains required and production-shaped
- `../infra-platform` remains the downstream consumer, not the deployment owner

## Affected Areas

- `docs/slices/contacts_web_production_image_publication.md`
- `docs/semantics/model_hypothesis.md`
- `docs/semantics/domain_background_knowledge.md`
- `work/changes/2026-04-23-build-production-image-publication/implementation.md`

## Boundary Changes

- publication handoff is now a first-class repository artifact
- the manifest is the explicit shape of the handoff
- deployment wiring remains out of scope

## Risks If The Slice Drifts

- the repo could regress to implying publication without recording the manifest
- downstream infra could lose the stable image coordinates if the manifest format is not documented
- the BFF image could become ambiguous again if the manifest stops naming it explicitly

## Follow-Up Pressure

- if infra later needs a different registry or schema, that should be recorded as a new publication slice rather than widening this one
- if the manifest format needs to be versioned, that is a distinct publication concern

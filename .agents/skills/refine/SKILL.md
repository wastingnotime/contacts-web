---
name: refine
description: Refine extracted model signals into request-to-slice traceability for the MRL loop. Use when a request and semantic artifacts exist and the next step is to map request intent to one or more bounded slices, clarify model pressure, and write or update slice documents without editing implementation code.
---

# Mission

Turn extracted evidence and semantic hypotheses into explicit request-to-slice traceability and bounded slice definitions.

# Read First

- `readme.md`
- `architecture.md`
- `groundrules.md`
- `decisions.md`
- `docs/operating/skills_workflow.md`
- `docs/semantics/model_hypothesis.md`
- relevant `work/changes/<id>/request.md` when available
- existing `work/changes/<id>/request_slice_map.md` when available
- existing slice docs under `docs/slices/`

# Inputs

- `work/changes/<id>/request.md` when available
- `work/changes/<id>/request_slice_map.md` when available
- `docs/semantics/model_hypothesis.md`
- semantic and architectural docs
- relevant code only when needed to understand current boundaries

# Model Guidance

- prefer a strong general reasoning model for this skill
- if model selection is available, use a frontier reasoning model rather than a speed-optimized coding model
- use a coding-focused model only when repository structure or nearby implementation details dominate the refinement work

# Must Do

- identify the bounded change to implement next
- maintain request-to-slice traceability in `work/changes/<id>/request_slice_map.md` when a request exists
- record whether the request maps to one slice or multiple slices
- define what each slice covers and what request acceptance evidence it should provide
- explain model pressure and impacted boundaries when useful
- write or update `docs/slices/<specific_slice>.md`
- write or update `impact_analysis.md` when the change affects multiple areas
- keep the slice concrete enough for build to execute deterministically

# Must Not Do

- do not write production code
- do not silently invent business rules unsupported by available artifacts
- do not let slice boundaries replace the original request boundary
- do not bypass architecture or ground rules without documenting the tension
- do not rely on conversational continuity; rebuild context from artifacts

# Outputs

- `work/changes/<id>/request_slice_map.md` when a request artifact exists
- `docs/slices/<specific_slice>.md`
- optional `work/changes/<id>/impact_analysis.md`

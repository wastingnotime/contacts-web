---
name: release
description: Evaluate whether the current request has been satisfied well enough to be accepted as the intended internal version in the MRL loop. Use when request, implementation, tests, and EGD artifacts exist and a release decision or regression summary is needed before any optional lifecycle exposure begins.
---

# Mission

Decide whether the current request state should be accepted as the internal released version.

# Read First

- `docs/operating/skills_workflow.md`
- relevant `work/changes/<id>/request.md`
- relevant `work/changes/<id>/request_slice_map.md`
- `docs/slices/<specific_slice>.md`
- relevant `implementation.md`
- relevant `egd.md`
- regression outputs and test results
- `decisions.md` when prior accepted constraints matter

# Inputs

- `work/changes/<id>/request.md`
- `work/changes/<id>/request_slice_map.md`
- relevant `docs/slices/<specific_slice>.md`
- implementation evidence
- test results
- EGD outputs
- regression outputs

# Must Do

- evaluate acceptance against the request, using slices as implementation evidence
- summarize regressions or meaningful diffs when present
- write `release_decision.md`
- write `regression_diff.md` when regression evidence exists
- make accept, reject, or return-to-loop decisions explicit
- state any known artifact or packaging expectation needed by a later exposure extension when it is already known

# Must Not Do

- do not reduce the phase to raw test execution only
- do not expose the accepted result automatically
- do not choose or implement repository-specific exposure mechanics
- do not change code directly in this phase
- do not rely on hidden conversational context

# Outputs

- `work/changes/<id>/release_decision.md`
- optional `work/changes/<id>/regression_diff.md`

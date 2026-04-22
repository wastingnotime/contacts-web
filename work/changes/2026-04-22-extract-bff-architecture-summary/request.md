# Request

## Requested Change

Extract the BFF architecture summary at `/home/henrique/Downloads/bff-architecture-summary.md` into explicit repository artifacts for `contacts-web`.

The goal is to preserve the current architectural intent for a contacts-web BFF before refinement or implementation begins.

## Why This Exists

The repository needs explicit memory for the intended web-delivery shape so later phases do not treat the BFF as an ad hoc addition.

The summary suggests:

- `contacts-web` should stay in the same repo as the SPA
- the BFF should be web-specific
- the API/domain backend remains separate
- Node.js plus TypeScript is the current technology direction for the BFF layer

## Scope

- preserve the source summary in `work/sources/`
- create an explicit source inventory for the summary
- update `docs/semantics/model_hypothesis.md`
- update `docs/semantics/domain_background_knowledge.md`
- do not write production code
- do not refine the implementation slice yet

## Expected Output

- traceable source evidence for the BFF architecture summary
- updated semantic baseline for the contacts-web BFF direction
- explicit unresolved tensions to carry into `refine`

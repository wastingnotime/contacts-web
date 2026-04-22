# Impact Analysis

## Scope Of Impact

The split-license decision affects repository governance rather than runtime behavior.

It touches:

- root license files
- package metadata
- README publication notes
- decisions and slice docs
- future contributor expectations about what belongs to the reusable MRL layer versus the product layer

## Areas Affected

### Repository Governance

The repository now needs a durable distinction between:

- reusable MRL operating material
- `contacts-web` product artifacts

### Publication Metadata

The root `LICENSE` should act as a scope notice, not as a misleading single-license claim.
Package metadata should reflect the product-side license choice so downstream tooling sees a consistent signal.

### Documentation

`decisions.md` and the README need to keep the split visible without overexplaining it in every file.

## Tensions To Keep Explicit

- the MRL method remains reusable across repositories
- the product artifacts are specific to `contacts-web`
- split licensing should stay clear without becoming a legal essay inside every doc

## Non-Goals

- no product code changes
- no backend contract changes
- no deployment packaging changes beyond license metadata

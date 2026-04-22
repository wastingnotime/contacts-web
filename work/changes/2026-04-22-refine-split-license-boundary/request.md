# Request

## Requested Change

Refine the repository's split-license decision into a bounded slice so the MRL method layer and the `contacts-web` product layer have an explicit publication boundary.

## Why This Exists

The repository now explicitly treats MRL process artifacts as MIT and `contacts-web` product artifacts as MPL 2.0. That needs a durable slice document so future work can preserve the distinction rather than collapsing it into a single repository-wide assumption.

## Scope

- define one licensing boundary slice
- document how the split applies to process artifacts, product artifacts, package metadata, and root license files
- keep the slice non-behavioral
- do not alter product code

## Expected Output

- `docs/slices/contacts_web_split_license_boundary.md`
- optional impact analysis for publication and repository-boundary effects

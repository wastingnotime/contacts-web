# Request

## Requested Change

Refine the extracted BFF architecture summary into one bounded slice for `contacts-web`.

The slice should make the web BFF an explicit repository boundary alongside the Solid SPA.

## Why This Exists

The repository now has an accepted architectural decision to keep the web BFF inside `contacts-web` rather than mixing delivery concerns into the SPA or splitting the BFF into a separate repo.

Before implementation begins, the next slice needs to say exactly what changes that boundary requires and what it does not.

## Scope

- define one BFF-focused slice
- keep the slice aligned with the current contacts CRUD semantics
- capture the impact on SPA behavior, BFF behavior, and shared contracts
- do not write production code
- do not alter backend business rules

## Expected Output

- `docs/slices/solid_contacts_web_bff_boundary.md`
- optional impact analysis for the architecture and test surface changes

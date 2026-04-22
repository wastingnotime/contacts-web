# Slice: Contacts-Web Split License Boundary

## Purpose

Define the licensing boundary for repository content so MRL process artifacts remain MIT while `contacts-web` product artifacts remain MPL 2.0.

This slice does not change product behavior. It makes the repository's publication and reuse terms explicit so future work does not collapse the process layer and the product layer into one license by accident.

## Selected Pack

- n/a

## Runtime Targets

- MRL process artifacts under `docs/`, `work/`, `AGENTS.md`, and the operating docs
- `contacts-web` product artifacts under `src/`, `tests/`, `apps/`, `public/`, and domain-specific slice documents
- root license packaging and package metadata

## Architecture Mode

- split-license repository governance
- process/artifact layer separation
- explicit publication metadata

Interpretation:

- the MRL method layer remains reusable across repositories
- the `contacts-web` product layer remains specific to this implementation
- licensing text must make the split obvious to contributors and downstream users

## Discovery Scope

Included in this slice:

- document the split-license rule in durable repository artifacts
- package the root `LICENSE` as a scope notice that points to the full texts
- provide full MIT and MPL 2.0 license texts under `LICENSES/`
- align package metadata with the product-side license choice
- make the split visible in `decisions.md` and the repository README

Excluded from this slice:

- product feature behavior
- backend contract changes
- runtime code changes
- release or deployment mechanics beyond license packaging

## Why This Slice Next

The repository now contains both reusable MRL material and product-specific `contacts-web` material.

Without an explicit licensing slice, future changes could accidentally:

- assume one repository-wide license
- obscure which artifacts belong to the reusable method layer
- make publication or redistribution decisions harder to audit

This slice keeps the distinction explicit before more content accumulates around it.

## Main Business Rules

- MRL operating and workflow artifacts stay MIT
- `contacts-web` implementation and product artifacts stay MPL 2.0
- the root `LICENSE` should describe the split instead of pretending the repository is single-licensed
- package metadata should not contradict the repository's product-side license choice
- the current implementation already packages the split in root license files, package metadata, and the README

## Required Ports

- repository licensing decision record
- root license packaging
- package metadata
- README publication note

## Interface Expectations

The repository should make it easy for a contributor or downstream maintainer to see:

- which content is MRL process material
- which content is `contacts-web` product material
- which license applies to each group

## Initial Test Plan

The licensing slice should be reviewed by checking:

- the root `LICENSE` references both scopes and the full texts
- `LICENSES/` contains the MIT and MPL 2.0 texts
- `package.json` advertises the product-side license
- `decisions.md` records the split-license choice explicitly
- the README gives a short, visible pointer to the split

## Scenario Definition

Scenario name:

- `repository_reader_distinguishes_mrl_and_contacts_web_licenses`

Scenario steps:

1. open the repository root
2. identify the split-license notice
3. confirm the MIT text is present for the MRL layer
4. confirm the MPL 2.0 text is present for the product layer
5. confirm package metadata and decisions match the split

## Done Criteria

- the repository has a durable split-license decision in `decisions.md`
- the root `LICENSE` explains the split
- full license texts are present under `LICENSES/`
- package metadata matches the product-side license
- the README points readers to the split-license rule
- future slices can rely on the licensing boundary without rediscovering it

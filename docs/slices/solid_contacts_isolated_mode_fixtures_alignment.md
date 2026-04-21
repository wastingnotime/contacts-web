# Slice: Solid Contacts Isolated Mode Fixtures Alignment

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice keeps the isolated-mode runtime fixtures and the Storybook preview fixtures aligned through one shared contact seed source.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- Storybook preview runtime
- MSW-backed isolated transport boundary

Early-phase rule:

- `build` should align isolated-mode and Storybook contact fixtures through a shared source
- `build` should not change the live contacts backend contract
- `build` should not invent new business rules for the contact data itself

## Architecture Mode

- frontend-first client/server split
- deterministic fixture source shared across preview and isolated runtime layers
- explicit mapping between view-model fixtures and transport fixtures

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- the shared fixture source exists to keep inspection surfaces consistent, not to change product behavior

## Discovery Scope

Included in this slice:

- introduce a shared contact fixture source for local preview and isolated runtime use
- derive Storybook view-model fixtures from the same seed contacts used by MSW
- keep the isolated runtime seed contacts and Storybook seed contacts in sync

Contract map for this slice:

- Storybook and isolated mode use the same canonical contact seeds
- the view-model shape and transport shape stay explicit
- fixture alignment should not affect live mode or backend contracts

Excluded from this slice:

- backend persistence or authorization changes
- new contacts business rules
- mode toggles or startup failure handling
- release or expose work

## Why This Slice Next

The repository now has two backend-free inspection surfaces:

- isolated mode for the real app bootstrap path
- Storybook for previewing UI states directly

Both surfaces depend on contact seeds.

Without a shared fixture source:

- preview data can drift away from isolated runtime data
- it becomes harder to reason about whether a UI state reflects the same seed contact set
- future story or isolated-mode updates will be duplicated in multiple places

This slice resolves that pressure by centralizing the seeds without changing runtime behavior.

Starting with a larger fixture framework would be heavier than needed.
Starting with ad hoc copy-paste seeds would keep the drift risk alive.

## Use-Case Contract

### Use Case: `ReuseSharedContactSeedsAcrossPreviewAndIsolation`

Input:

- preview or isolated runtime needs seed contacts

Success result:

- the same canonical contact seeds are used across Storybook and isolated mode
- view-model and transport fixtures are derived explicitly from the shared source

Failure conditions:

- preview and isolated seeds drift apart
- the shared fixture source is not used consistently

### Contract Map: `ContactFixtureSource`

Expected boundary:

- shared seed contacts
- derived view-model fixture shape
- derived transport fixture shape

## Main Business Rules

- fixture seeds must stay deterministic
- isolated mode and Storybook should share the same seed contacts
- fixture derivation must stay explicit
- live mode remains separate from local fixture sources

## Client Model Shape Hypothesis

Expected initial concepts:

- shared contact seed module
- view-model fixture derivation helper
- transport fixture derivation helper

Possible supporting concepts if useful during build:

- a small test that checks the shared fixture shapes remain aligned

The slice should avoid introducing a heavy fixture generation system unless it clarifies behavior materially.

## Required Ports

- shared local contact seed source
- preview fixture helper
- isolated transport fixture helper

## Interface Expectations

The browser interface should continue to include:

- isolated mode list
- Storybook preview states

The interface should make these states explicit:

- shared seed contacts visible in both preview and isolated runtime

## Initial Test Plan

Client or contract tests should specify:

- the shared fixture source produces aligned view-model and transport seeds
- Storybook helper fixtures and isolated runtime fixtures remain consistent

## Scenario Definition

Scenario name:

- `developer_sees_the_same_seed_contacts_in_preview_and_isolation`

Scenario steps:

1. inspect Storybook seed contacts
2. inspect isolated-mode seed contacts
3. verify both derive from the same canonical source

## Done Criteria

- Storybook and isolated mode use aligned contact seeds
- the shared fixture source is explicit
- fixture drift risk is reduced

## Notes For Build

- keep the shared fixture module small and obvious
- prefer explicit derivation over hidden transformation magic

# Slice: Solid Contacts Storybook Preview

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice introduces Storybook as a local preview runtime for inspecting contact UI states without opening the full app or contacting the backend.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Storybook browser preview runtime
- Solid component rendering through the Storybook Solid/Vite framework adapter
- deterministic story fixtures for local UI inspection

Early-phase rule:

- `build` should add Storybook as a preview tool for the existing Solid UI
- `build` should not change the live contacts backend contract
- `build` should not expand product behavior beyond the existing contacts workflows

## Architecture Mode

- frontend-first client/server split
- preview-only component isolation
- shared styling and deterministic fixtures for story rendering

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- Storybook is an inspection tool, not a product runtime

## Discovery Scope

Included in this slice:

- add Storybook configuration for the Solid/Vite app
- load the existing app styles in the preview frame
- add deterministic stories for contact form fields
- add deterministic stories for the contacts list page
- add deterministic stories for create and edit page states
- keep story rendering backend-free through local fixture clients
- add explicit loading, empty, error, and disabled story variants for the high-value inspection states

Contract map for this slice:

- Storybook renders UI components and pages with local fixture data
- stories do not call the live contacts backend
- story state should remain deterministic across reloads
- the preview runtime should be independent from the app router and the live bootstrap path

Excluded from this slice:

- backend persistence or authorization changes
- new contacts business rules
- release or expose work
- story-driven product behavior not already present in the app

## Why This Slice Next

The repository already has a backend-free isolated mode, but that mode is tied to the app bootstrap.

Storybook adds a second, narrower inspection surface:

- component states can be reviewed without the full app shell
- designers and developers can inspect empty, filled, disabled, and error states directly
- local preview fixtures can stay simple and deterministic

The slice keeps the rest of the client architecture intact:

- live contacts behavior remains the default product path
- explicit transport mapping still exists
- Storybook stays a preview layer, not a second app runtime

Starting with visual polish alone would not create a reusable preview surface.
Starting with a full component library would overreach because the existing UI already provides the needed inspection targets.

## Use-Case Contract

### Use Case: `OpenContactFormFieldPreview`

Input:

- preview runtime opened on a contact form field story

Success result:

- the form fields render with deterministic values and errors

Failure conditions:

- the story cannot render the component
- the preview depends on a live backend or app router state

### Use Case: `OpenContactsListPreview`

Input:

- preview runtime opened on a contacts list story

Success result:

- the list renders with deterministic empty, populated, and failure states

Failure conditions:

- the story cannot render the list page
- the preview depends on a live backend or app router state

### Story Map

Target preview modules:

- contact form fields
- contacts list page
- optional create or edit page previews if needed to keep the inspection surface coherent

## Main Business Rules

- Storybook must remain backend-free
- story fixtures must be deterministic
- shared app styling should apply in preview where it helps inspection
- Storybook must not redefine contacts domain behavior

## Client Model Shape Hypothesis

Expected initial concepts:

- Storybook framework adapter
- global preview stylesheet import
- deterministic fixture clients or render helpers
- story files colocated with the components and pages they preview

Possible supporting concepts if useful during build:

- a shared story fixture helper for contacts pages
- a global preview decorator for layout
- small story wrappers for loading and error states
- a delayed fixture helper for page-level loading states

The slice should avoid introducing a second application shell unless it clarifies story inspection materially.

## Required Ports

- Storybook framework adapter
- preview stylesheet boundary
- deterministic fixture client helper

Optional ports:

- global preview decorator for layout

## Interface Expectations

The preview surface should support inspection of:

- contact form field states
- contacts list states
- create page states
- edit page states
- loading, empty, and error presentation where the component exposes them
- disabled and validation states where the component exposes them

## Initial Test Plan

Build validation should specify:

- Storybook config resolves successfully
- story files compile without backend dependencies
- the preview build includes the requested stories

Story previews should specify:

- form fields render with values and errors
- contacts list renders with deterministic data, empty state, loading state, and failure state
- create and edit pages render with deterministic backend-free fixtures
- edit loading and missing-record states are visible without live backend access
- failure states are visible without live backend access

## Scenario Definition

Scenario name:

- `designer_reviews_contact_ui_states_in_storybook`

Scenario steps:

1. start Storybook
2. open the form or list preview
3. inspect the rendered state
4. verify the preview is deterministic and backend-free

## Done Criteria

- Storybook starts for the Solid app
- contact UI states are visible in Storybook
- preview stories are deterministic
- Storybook stays separate from the live backend path
- the highest-value edge states are inspectable without backend access
- page-level preview states are inspectable without the app router

## Notes For Build

- keep the preview surface small and focused
- reuse existing app styling where it helps component inspection
- do not add backend dependencies to the story runtime

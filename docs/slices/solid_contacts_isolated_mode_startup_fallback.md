# Slice: Solid Contacts Isolated Mode Startup Fallback

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice makes isolated-mode startup failure visible instead of letting the browser crash when the mock worker cannot register.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- isolated-mode bootstrap path
- deterministic startup failure presentation

Early-phase rule:

- `build` should surface a clear startup failure state when isolated mode cannot start
- `build` should not change the live contacts backend contract
- `build` should not silently fall back from isolated mode to live mode

## Architecture Mode

- frontend-first client/server split
- explicit bootstrap boundary before the contacts app mounts
- visible failure state for isolated-mode startup

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- isolated mode is still a development and testability path, but its boot failure should be diagnosable in the UI

## Discovery Scope

Included in this slice:

- render a clear failure view if isolated-mode worker startup rejects
- keep the live app bootstrap path unchanged
- make the failure message actionable enough to explain that isolated mode could not start

Contract map for this slice:

- isolated mode remains explicit
- startup failure should not silently degrade into live mode
- the browser should show a visible bootstrap problem instead of crashing with an unhandled rejection

Excluded from this slice:

- changes to backend persistence or authorization
- changes to contact business rules
- mode toggles or alternate entrypoints
- release or expose work

## Why This Slice Next

The isolated-mode bootstrap currently depends on a service worker registration step.

That creates a brittle failure mode:

- when the worker cannot register, the browser throws before the contacts UI mounts
- users get a low-level error instead of a clear explanation
- the failure is hard to diagnose during local development

This slice resolves that pressure without changing product behavior:

- isolated mode still starts the same way when registration succeeds
- the app still uses the live path when live mode is selected
- only the failure presentation changes

Starting with a fallback to live mode would hide the problem and blur the mode boundary.
Starting with a new mode toggle would solve discoverability, not startup failure.

## Use-Case Contract

### Use Case: `ShowIsolatedModeStartupFailure`

Input:

- isolated-mode bootstrap rejects before the app mounts

Success result:

- the browser renders a visible failure view
- the failure view explains that isolated mode could not start
- the live app does not mount under the isolated label

Failure conditions:

- the browser crashes with an unhandled rejection
- the bootstrap silently falls back to live mode
- the failure view does not appear

### Contract Map: `IsolatedBootstrap`

Expected boundary:

- start the mock worker
- mount the contacts app only when the worker starts successfully

Failure surface:

- worker registration failure
- missing worker asset
- unexpected startup exception

## Main Business Rules

- isolated mode must remain explicit
- startup failure must be visible
- isolated mode must not silently degrade into live mode
- the failure presentation should stay local to bootstrap behavior

## Client Model Shape Hypothesis

Expected initial concepts:

- isolated bootstrap coordinator
- bootstrap failure view
- failure message boundary for startup rejection

Possible supporting concepts if useful during build:

- a small reusable bootstrap error component
- an entrypoint helper that catches startup rejection before render

The slice should avoid introducing a heavy error framework unless it clarifies behavior materially.

## Required Ports

- isolated bootstrap boundary
- startup failure rendering boundary

## Interface Expectations

The browser interface should continue to include:

- live mode
- isolated mode

The interface should make these states explicit:

- isolated mode starting successfully
- isolated mode startup failure

## Initial Test Plan

Client tests should specify:

- isolated-mode startup failure renders a visible message
- the failure view appears instead of an unhandled crash
- live mode bootstrap remains unchanged

## Scenario Definition

Scenario name:

- `web_user_sees_isolated_mode_startup_failure`

Scenario steps:

1. start the UI in isolated mode
2. simulate a worker registration failure
3. verify the browser renders a clear startup failure view

## Done Criteria

- isolated-mode startup failure is visible
- the browser does not crash on worker registration rejection
- live mode remains unchanged

## Notes For Build

- keep the failure view simple and actionable
- do not fall back to live mode silently

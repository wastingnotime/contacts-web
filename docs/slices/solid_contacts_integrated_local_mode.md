# Slice: Solid Contacts Integrated Local Mode

## Purpose

Define the next executable vertical slice for `contacts-web`.

This slice introduces an integrated local development mode where the Solid frontend runs alongside local backend services and a seeded local database so real service interaction can be inspected without reaching out to the external production backend.
The current implementation already provides an `integrated-local` runtime mode and local dev wiring for that stack boundary.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser client runtime
- local backend service runtime
- seeded local database runtime
- local orchestration via Docker Compose or an equivalent local stack command

Early-phase rule:

- `build` should introduce an explicit integrated local mode for real local service interaction
- `build` should not change the external backend contract
- `build` should not replace isolated mode or Storybook preview use cases

## Architecture Mode

- frontend-first client/server split
- locally orchestrated multi-service stack
- real service interaction against seeded local data

Interpretation:

- this repository owns browser behavior, route semantics, and user feedback
- this repository does not own persistence or backend authorization policy
- integrated local mode is a local validation surface, not a substitute for the external backend contract

## Discovery Scope

Included in this slice:

- define an explicit integrated local mode for development and integration testing
- run the frontend against locally orchestrated backend and database services
- use seeded local data so contract and flow inspection is reproducible
- keep isolated mode and Storybook available as separate local inspection paths

Contract map for this slice:

- integrated local mode uses real local services rather than mock transport
- the local backend should expose the same contacts workflow contract that the frontend expects
- seeded local data should make local interaction deterministic enough for repeatable debugging

Excluded from this slice:

- external deployment or production runtime changes
- backend persistence rule changes
- mock-only UI inspection paths
- release or expose work

## Why This Slice Next

The repository already has backend-free isolated mode and backend-free Storybook preview support.

Those are useful, but they do not validate the real local service boundary.

This slice resolves the next pressure:

- contract validation needs a local path that includes the backend and database
- flow debugging needs real service interaction without the external environment
- integration testing needs deterministic seeded data while still exercising the real stack

Starting with production deployment work would be heavier than needed.
Starting with only isolated mocks would leave the real local service boundary unvalidated.

## Use-Case Contract

### Use Case: `StartIntegratedLocalStack`

Input:

- developer intent to run the frontend with local backend services and a seeded local database

Success result:

- the local stack starts with the frontend and backend services available
- seeded data is loaded
- the contacts workflow can be inspected through real local service interaction

Failure conditions:

- one of the local services fails to start
- the frontend cannot reach the local backend
- the local database does not load the expected seed state

### Use Case: `InspectContactsFlowsAgainstLocalServices`

Input:

- integrated local mode active

Success result:

- the browser can list, create, edit, and delete contacts through the local backend
- real request and response behavior can be observed against seeded data

Failure conditions:

- the local service interaction diverges from the expected contacts contract
- the seeded local data is not reproducible
- the integrated local path silently falls back to isolated or live mode

## Main Business Rules

- integrated local mode must be explicit
- integrated local mode must use real local service interaction
- seeded local data must stay deterministic enough for repeatable debugging
- integrated local mode must remain separate from isolated mode and from the external backend contract

## Client Model Shape Hypothesis

Expected initial concepts:

- integrated local stack bootstrap
- seeded local backend data
- local service wiring for the frontend
- local environment selection for the developer

Possible supporting concepts if useful during build:

- a docker-compose definition for the local services
- a local startup command for the full stack
- a small developer-facing note that distinguishes integrated local mode from isolated mode

The slice should avoid introducing a large environment-management system unless it clarifies the local workflow materially.

## Required Ports

- local backend service boundary
- seeded local database boundary
- frontend configuration boundary for local service URLs
- orchestration boundary for the local stack

## Interface Expectations

The browser interface should continue to include:

- contacts list
- create contact
- edit contact
- delete contact

The local developer interface should make these states explicit:

- integrated local mode active
- seeded local services reachable
- real local service interaction visible in the browser

## Initial Test Plan

Integration-focused tests should specify:

- the local stack starts with seeded data available
- the frontend can reach the local backend through the local stack
- list, create, edit, and delete remain functional against the seeded local services
- integrated local mode remains distinct from isolated mode

## Scenario Definition

Scenario name:

- `developer_validates_contacts_flows_against_a_seeded_local_stack`

Scenario steps:

1. start the integrated local stack
2. open the contacts frontend
3. inspect or exercise contact workflows against the local backend
4. verify the behavior is reproducible with seeded local data

## Done Criteria

- integrated local mode is explicit
- the frontend can run against local backend and database services
- seeded local data makes the local stack reproducible
- integrated local mode remains separate from isolated mode and external backend authority

## Notes For Build

- keep the local stack explicit and developer-focused
- do not blur integrated local mode into the isolated mock path
- prefer deterministic seeds and simple startup commands over a heavy environment system

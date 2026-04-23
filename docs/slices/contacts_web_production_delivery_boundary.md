# Slice: Contacts Web Production Delivery Boundary

## Purpose

Define the production delivery boundary for `contacts-web` so the repository can publish deployable artifacts for both the Solid SPA and the web BFF.

This slice does not implement deployment mechanics. It makes the production packaging requirement explicit so the repository can prove it is ready to deliver a Swarm-compatible BFF image alongside the existing static SPA artifact, even before `../infra-platform` wires this service into a deployment stack.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser SPA runtime
- Node.js plus TypeScript web BFF runtime
- external `contacts-v2` API runtime
- portable static SPA container image
- Swarm-compatible BFF container image that binds on the production port for Traefik ingress

Early-phase rule:

- `build` should produce or validate deployable production artifacts for the SPA and BFF
- `build` should keep the BFF as the delivery adapter between the SPA and backend
- `build` should preserve relative `/api` paths so development and production routing remain aligned
- `build` should not redesign backend domain behavior, auth policy, or observability plumbing

## Architecture Mode

- browser/SPA/TypeScript-BFF/backend split with explicit production packaging
- production ingress through Traefik
- separate static browser asset container and BFF container

Interpretation:

- the SPA remains the browser-facing asset bundle
- the BFF remains the runtime adapter that fronts the backend contract
- production delivery is a packaging concern layered on top of the existing browser/BFF/backend split
- the repository should not collapse the BFF back into the SPA container just to simplify publishing

## Discovery Scope

Included in this slice:

- define the production artifact boundary for the SPA and BFF
- preserve the static SPA container as a production deliverable
- require a Swarm-compatible BFF container that can bind on the production port
- keep relative `/api` paths valid in production
- make the repo responsibility explicit in relation to the infra handoff to `../infra-platform`
- preserve the fact that `../infra-platform` does not yet deploy this service

Excluded from this slice:

- deployment scripts or compose files
- image build implementation details
- backend domain changes
- auth/session implementation
- observability implementation changes

## Why This Slice Next

The repository already has a live BFF boundary and a static SPA artifact path.
The production delivery note also needs to make the infra handoff explicit: `../infra-platform` is the downstream consumer of the image artifacts, but it does not yet deploy this service.

Production adds a new pressure:

- the repo must prove it can publish the BFF as an artifact, not just run it locally
- infra expects a Swarm-compatible BFF image that can sit behind Traefik
- the production packaging shape should stay aligned with the browser -> BFF -> backend split
- the repository still needs the BFF image even though the deployment repo does not yet wire this service into a live stack

Starting with deployment automation would be too implementation-specific.
Starting without a bounded production-delivery slice would leave the repo's publishing obligations implicit.

## Use-Case Contract

### Use Case: `PublishStaticSpaProductionArtifact`

Input:

- repository build output for the browser SPA

Success result:

- a portable static SPA image is available for production delivery
- browser asset delivery remains separate from BFF delivery

Failure conditions:

- the SPA artifact cannot be packaged portably
- the production artifact shape forces browser code to depend on backend runtime details

### Use Case: `PublishSwarmCompatibleBffProductionArtifact`

Input:

- BFF runtime build output and production port configuration

Success result:

- a Swarm-compatible BFF image is available for production delivery
- the image binds on the production port expected by Traefik ingress
- the BFF remains the browser-facing delivery adapter

Failure conditions:

- the BFF cannot be packaged as a container artifact
- the BFF only works as a local development process
- the BFF artifact does not bind on the production port

### Use Case: `PreserveProdAndDevRoutingAlignment`

Input:

- browser requests routed through development and production environments

Success result:

- browser code continues to use relative `/api` paths
- dev and prod routing stay consistent enough to avoid environment-specific client branching

Failure conditions:

- production requires a different browser API host shape than development
- the repository drifts into environment-specific client configuration

## Main Business Rules

- the repository should publish production artifacts for both the SPA and the BFF
- the BFF should remain a separate runtime surface, not just a browser helper
- the BFF should be publishable as a Swarm-compatible image for Traefik ingress
- the SPA should remain a portable static container artifact
- the browser should keep using relative `/api` paths in production
- production packaging must not redefine backend domain ownership

## Required Ports

- static SPA production image
- Swarm-compatible BFF production image
- production port binding for the BFF
- relative `/api` browser routing
- repository decision record for production artifact delivery

## Interface Expectations

The production delivery boundary should make it clear that:

- browser assets can be delivered separately from the BFF runtime
- the BFF can be deployed as a containerized ingress target
- infra can route to the BFF using the expected production port
- local development routing remains structurally similar to production routing

## Initial Test Plan

Production delivery tests should specify:

- the SPA can be packaged as a portable static image
- the BFF can be packaged as a Swarm-compatible image
- the BFF image exposes the production port expected by Traefik ingress
- the browser continues to use relative `/api` paths
- production packaging does not collapse the BFF back into the SPA container

## Scenario Definition

Scenario name:

- `repository_can_publish_spa_and_bff_production_artifacts`

Scenario steps:

1. inspect the repository production packaging shape
2. verify the SPA is delivered as a static container artifact
3. verify the BFF is delivered as a separate Swarm-compatible container artifact
4. verify the BFF binds on the production port expected by Traefik
5. verify browser routing remains relative to `/api`

## Done Criteria

- the repository has an explicit production-delivery slice
- the slice distinguishes the SPA artifact from the BFF artifact
- the slice makes the Swarm-compatible BFF image requirement explicit
- the slice preserves the relative `/api` browser routing assumption
- the slice keeps the infra handoff explicit without pretending `../infra-platform` deploys this service already
- the slice stays separate from deployment automation and backend domain redesign

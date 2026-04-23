# Slice: Contacts Web Production Image Publication

## Purpose

Define the publication handoff for `contacts-web` so the repository can export stable image references for the SPA and BFF production artifacts.

This slice does not implement deployment wiring in `../infra-platform`. It makes the publication contract explicit so the infra repository can consume immutable image references later without rediscovering how the images are named, tagged, or handed off.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- portable static SPA container image
- Swarm-compatible BFF container image that binds on the production port for Traefik ingress
- stable image references suitable for downstream consumption
- external `contacts-v2` API runtime

Early-phase rule:

- `build` should make the production image references explicit and repeatable
- `build` should keep the SPA image and BFF image separate
- `build` should preserve the existing `/api` routing and BFF port assumptions
- `build` should not design the infra-platform deployment itself

## Architecture Mode

- production artifact publication boundary
- image reference handoff to `../infra-platform`
- separate SPA and BFF runtime surfaces

Interpretation:

- the repository owns publication of deployable images and their references
- `../infra-platform` is a downstream consumer of those references, not the owner of this repo's publish mechanics
- the image handoff should be explicit enough that deployment wiring can be added later without reinterpreting the artifact boundary

## Discovery Scope

Included in this slice:

- define how SPA and BFF image references are published for downstream use
- keep the SPA image and BFF image separate
- preserve the BFF production port expectation
- preserve relative `/api` browser routing assumptions
- make the handoff to `../infra-platform` explicit

Excluded from this slice:

- deployment manifests or stack files in `../infra-platform`
- registry-specific automation
- image hardening changes
- backend domain changes
- auth/session implementation

## Why This Slice Next

The production delivery slice established the existence of the SPA and BFF images.
The remaining pressure is publication:

- infra needs stable image references rather than an ambiguous local build result
- the repository should not wait for deployment wiring to define artifact publication
- the BFF image remains a required artifact even though `../infra-platform` does not yet deploy this service

Starting with infrastructure wiring would be too broad.
Starting without a publication slice would leave the handoff implicit and fragile.

## Use-Case Contract

### Use Case: `PublishSpaImageReference`

Input:

- SPA build output

Success result:

- a stable SPA image reference is produced for downstream consumption
- the SPA artifact remains independent of the BFF artifact

Failure conditions:

- the SPA image reference is ambiguous or non-repeatable
- the SPA artifact is forced to depend on BFF publication details

### Use Case: `PublishBffImageReference`

Input:

- BFF build output
- BFF production port configuration

Success result:

- a stable BFF image reference is produced for downstream consumption
- the BFF remains a separate production artifact
- the BFF reference preserves the production port and ingress expectations

Failure conditions:

- the BFF image reference is ambiguous or non-repeatable
- the BFF is only available as an ad hoc local runtime
- the BFF publication path loses the production port assumptions

### Use Case: `HandOffImageReferencesToInfraPlatform`

Input:

- SPA image reference
- BFF image reference

Success result:

- downstream deployment work can consume the image references without re-deriving them
- `../infra-platform` can remain a separate repository and still have a clear publication contract to consume

Failure conditions:

- the handoff depends on conversational context instead of explicit artifacts
- the publication contract is too vague for downstream deployment work

## Main Business Rules

- the SPA and BFF should be published as separate image artifacts
- the BFF image should remain Swarm-compatible and ingress-ready
- the browser should keep using relative `/api` paths
- the publication contract should be explicit enough for downstream infra consumption
- production publication must not collapse into deployment mechanics

## Required Ports

- SPA image reference
- BFF image reference
- production port binding for the BFF
- relative `/api` browser routing
- downstream handoff artifact for `../infra-platform`

## Interface Expectations

The publication boundary should make it clear that:

- image references are stable enough to hand off later
- infra can consume the published references without rediscovering the build shape
- the BFF remains a distinct artifact with its own ingress expectations
- the SPA remains separate from the BFF publication path

## Initial Test Plan

Publication tests should specify:

- the SPA image reference is reproducible
- the BFF image reference is reproducible
- the SPA and BFF references remain distinct
- the BFF reference preserves the production port expectation
- the publication contract can be recorded without deployment wiring

## Scenario Definition

Scenario name:

- `infra_repo_can_consume_contacts_web_image_references`

Scenario steps:

1. inspect the published SPA image reference
2. inspect the published BFF image reference
3. confirm the two references are distinct and stable
4. confirm the BFF reference preserves the production port expectation
5. confirm the handoff is explicit enough for `../infra-platform`

## Done Criteria

- the repository has an explicit publication-handoff slice
- the slice distinguishes SPA and BFF image references
- the slice keeps the BFF image requirement explicit
- the slice makes the infra handoff to `../infra-platform` explicit
- the slice stays separate from deployment wiring and image hardening

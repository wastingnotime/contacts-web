# Slice: Contacts Web Production Image Publication

## Purpose

Define the publication handoff for `contacts-web` so the repository can export a stable image publication manifest for the SPA and BFF production artifacts.

This slice does not implement deployment wiring in `../infra-platform`. It makes the publication contract explicit so the infra repository can consume immutable image references later without rediscovering how the images are named, tagged, or handed off. The concrete handoff artifact lives at `work/publications/contacts_web_image_publication.json`.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- portable static SPA container image
- Swarm-compatible BFF container image that binds on the production port for Traefik ingress
- publication manifest with stable SPA and BFF image references
- stable image references suitable for downstream consumption
- external `contacts-v2` API runtime

Early-phase rule:

- `build` should make the production image references explicit and repeatable
- `build` should keep the SPA image and BFF image separate
- `build` should preserve the existing `/api` routing and BFF port assumptions
- `build` should emit a stable publication manifest rather than relying on conversational handoff
- `build` should write the manifest to `work/publications/contacts_web_image_publication.json`
- `build` should not design the infra-platform deployment itself

## Architecture Mode

- production artifact publication boundary
- image reference handoff to `../infra-platform`
- publication manifest emitted by the repo
- checked-in manifest artifact under `work/publications/`
- separate SPA and BFF runtime surfaces

Interpretation:

- the repository owns publication of deployable images and their references
- `../infra-platform` is a downstream consumer of those references, not the owner of this repo's publish mechanics
- the publication manifest is the explicit handoff artifact
- the checked-in manifest is the explicit handoff artifact
- the image handoff should be explicit enough that deployment wiring can be added later without reinterpreting the artifact boundary

## Discovery Scope

Included in this slice:

- define how SPA and BFF image references are published for downstream use
- define how the publication manifest is generated and consumed
- define how the checked-in publication manifest is updated and kept stable
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
- the publication manifest should be a concrete, repeatable artifact that downstream infra can read later
- the checked-in manifest should be the durable handoff artifact rather than a transient console output

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

### Use Case: `EmitProductionImagePublicationManifest`

Input:

- SPA image reference
- BFF image reference

Success result:

- a machine-readable publication manifest is emitted
- the manifest contains the stable SPA and BFF image references
- the manifest can be handed to downstream infra without further interpretation
- the manifest is written to `work/publications/contacts_web_image_publication.json`

Failure conditions:

- the publication artifact is only implied by the script output
- the manifest omits either image reference
- the manifest is not stable enough to be consumed later

### Use Case: `HandOffImageReferencesToInfraPlatform`

Input:

- SPA image reference
- BFF image reference

Success result:

- downstream deployment work can consume the image references without re-deriving them
- `../infra-platform` can remain a separate repository and still have a clear publication contract to consume
- downstream deployment work can consume the publication manifest without re-deriving image coordinates
- downstream deployment work can read the checked-in manifest file directly

Failure conditions:

- the handoff depends on conversational context instead of explicit artifacts
- the publication contract is too vague for downstream deployment work

## Main Business Rules

- the SPA and BFF should be published as separate image artifacts
- the BFF image should remain Swarm-compatible and ingress-ready
- the browser should keep using relative `/api` paths
- the publication contract should be explicit enough for downstream infra consumption
- the publication manifest should be a first-class repository artifact
- the checked-in publication manifest should be the first-class handoff artifact
- production publication must not collapse into deployment mechanics

## Required Ports

- SPA image reference
- BFF image reference
- publication manifest
- checked-in publication manifest file
- production port binding for the BFF
- relative `/api` browser routing
- downstream handoff artifact for `../infra-platform`

## Interface Expectations

The publication boundary should make it clear that:

- image references are stable enough to hand off later
- the manifest is stable enough to hand off later
- the manifest file is stable enough to hand off later
- infra can consume the published references without rediscovering the build shape
- the BFF remains a distinct artifact with its own ingress expectations
- the SPA remains separate from the BFF publication path

## Initial Test Plan

Publication tests should specify:

- the SPA image reference is reproducible
- the BFF image reference is reproducible
- the SPA and BFF references remain distinct
- the publication manifest captures both image references
- the publication manifest file is reproducible
- the BFF reference preserves the production port expectation
- the publication contract can be recorded without deployment wiring

## Scenario Definition

Scenario name:

- `infra_repo_can_consume_contacts_web_image_references`

Scenario steps:

1. inspect the published SPA image reference
2. inspect the published BFF image reference
3. inspect the publication manifest that contains both references
4. inspect the checked-in manifest file at `work/publications/contacts_web_image_publication.json`
5. confirm the two references are distinct and stable
6. confirm the BFF reference preserves the production port expectation
7. confirm the handoff is explicit enough for `../infra-platform`

## Done Criteria

- the repository has an explicit publication-handoff slice
- the slice distinguishes SPA and BFF image references
- the slice emits a concrete publication manifest
- the slice records the publication manifest under `work/publications/`
- the slice keeps the BFF image requirement explicit
- the slice makes the infra handoff to `../infra-platform` explicit
- the slice stays separate from deployment wiring and image hardening

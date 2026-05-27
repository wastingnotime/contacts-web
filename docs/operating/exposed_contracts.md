# Exposed Contracts

## Purpose

This document defines how repositories can treat external APIs, emitted events, and other consumable interfaces as explicit exposed contracts rather than leaving them implicit in code or runtime behavior.

## Scope

This document defines optional project-instance policy guidance for exposed contracts.
It does not make contract publication a universal MRL core requirement.

Use it when a released artifact is intended to be consumed by other systems, repositories, operators, or teams that need to know what interfaces the artifact offers and how those interfaces change over time.

---

## Problem It Solves

A packaged runtime artifact is not fully exposed if consumers can obtain the image or binary but cannot tell:

- which APIs it offers
- which events or messages it emits
- what the payloads or schemas look like
- which changes are additive, breaking, or internal-only
- where to find the current contract for the released version

Without explicit contract artifacts:

- downstream consumers discover interfaces by reverse engineering code or runtime behavior
- breaking changes are easy to introduce silently
- exposure evidence is incomplete because the artifact is visible but its consumable surface is not
- release decisions are weaker because externally meaningful changes are not classified clearly

---

## Definition

An exposed contract is a tracked artifact that describes an interface intentionally offered by a released version to downstream consumers.

Examples:

- HTTP or RPC APIs
- emitted integration events
- webhook payloads
- CLI or operator-facing command surfaces when they are part of the supported interface

An exposed contract is not the same as every internal domain event or every internal function signature.

The focus is the interface that another consumer is expected to rely on.

---

## Repository Policy

A repository or family of repositories may adopt the rule that externally consumable interfaces must be described explicitly as part of the exposed surface.

When that rule is adopted:

- API and event contracts become first-class release artifacts
- changes to those contracts must be reviewed as part of `release`
- lifecycle exposure should point consumers to the concrete contract artifacts for the released version

This policy is a repository or family-level architectural decision, not a universal MRL rule.

---

## Phase Responsibilities

### `refine`

Decide:

- which interfaces are part of the intended exposed surface
- which consumers matter
- whether contract artifacts are mandatory for this repository family
- how contract changes should be classified

### `build`

Produce or update the contract artifacts.

Typical build outputs include:

- OpenAPI documents for HTTP APIs
- AsyncAPI documents for event-driven interfaces
- JSON Schema, Avro, or Protobuf schemas for messages
- contract summaries or catalogs when a formal spec format is not justified yet

`build` is the right phase to generate or write these artifacts because the implementation is being shaped there.

### `release`

Evaluate:

- whether the released version's exposed contracts match the intended request
- whether the contract changed
- whether the change is breaking, additive, or internal-only
- whether the contract artifacts are sufficient for consumers

### Lifecycle Exposure

Record where consumers can find the released contract artifacts and include the relevant contract references in the exposure evidence.

Lifecycle exposure should publish or point to the contract. It should not be the first place where the contract is discovered.

---

## Recommended Locations

Use explicit tracked locations such as:

```text
docs/contracts/api/
docs/contracts/events/
docs/contracts/shared/
```

Possible contents:

- `openapi.yaml`
- `asyncapi.yaml`
- `contact-created.schema.json`
- `event_catalog.md`
- `compatibility.md`

Repositories may choose another structure, but it should be stable and documented.

---

## Contract Change Classification

Repositories that adopt exposed contracts should classify changes at least as:

- `breaking`: existing consumers may fail or must change
- `additive`: new surface added without invalidating expected existing usage
- `internal-only`: no exposed consumer-facing contract changed

This classification should appear in release evidence when the request touches an exposed interface.

---

## Minimal Artifact Expectations

For each exposed interface family, try to keep at least:

- interface name
- version or compatibility note
- location of the contract artifact
- consumer-facing description
- key request or payload shapes
- notable compatibility constraints

For repositories early in refinement, a concise tracked contract summary is acceptable before moving to a formal schema format.

---

## Exposure Evidence Rule

When a request exposes a contract-bearing artifact, `work/changes/<id>/exposure.md` should include:

- the contract locations or URLs
- the contract version or digest when relevant
- a brief statement of whether the exposed contract changed
- the compatibility classification when the change is meaningful to consumers

This makes exposure evidence useful to both operators and consumers.

---

## Family-Level Decision Template

```md
## DEC-XXXX - Treat Exposed Interfaces As Contract Artifacts

- Date: YYYY-MM-DD
- Status: accepted
- Owners: both

### Context
This family of repositories exposes APIs, events, or other integration surfaces that downstream consumers need to discover and trust across releases.

### Decision
Externally consumable interfaces are part of the exposed surface and must be described through tracked contract artifacts.

The repository family will:

- keep contract artifacts in explicit repository locations
- produce or update them during `build`
- review contract changes during `release`
- reference the released contract artifacts during lifecycle exposure

### Consequences
Consumers can discover supported interfaces without reverse engineering runtime behavior. Releases gain clearer compatibility review, but repositories must keep contract artifacts synchronized with implementation changes.

### Alternatives considered
Treat contracts as implicit in code or publish them only informally after deployment. These were rejected because they make consumer discovery and compatibility reasoning too weak.
```

---

## Starter Guidance

The starter does not require every repository to publish formal API or event contracts.

But when a repository expects external consumers to rely on its interfaces, treating those interfaces as explicit exposed contracts is the stronger default.

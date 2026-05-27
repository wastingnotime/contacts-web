# Exposed Observability

## Purpose

This document defines how repositories can treat observability signals as an explicit operational surface rather than discovering them only after deployment inside an APM or logging platform.

## Scope

This document defines optional project-instance policy guidance for exposed observability.
It does not make observability governance a universal MRL core requirement.

Use it when a released artifact is expected to be operated, monitored, alerted on, or debugged by people or systems that need to know what telemetry should exist before or during exposure.

---

## Problem It Solves

If metrics, trace boundaries, and key log structures are known only after a runtime is already visible in an APM, the repository is treating observability as runtime archaeology.

That causes recurring problems:

- operators do not know which signals should exist before exposure
- dashboards and alerts are built against accidental names, labels, and fields
- metric and label changes become silent breaking changes
- release review misses meaningful operational surface changes
- consumers of operational telemetry cannot tell which signals are stable and which are incidental

---

## Definition

An exposed observability surface is the set of operational signals that a repository intentionally expects others to rely on.

Examples:

- metrics and their names, units, and labels
- health and readiness endpoints
- important trace boundaries, span names, and attributes
- structured log fields for important operational or business events

This does not mean every log line or every incidental span is a durable contract.

The focus is the telemetry another operator, platform, or downstream system is expected to use intentionally.

---

## Metrics, Traces, And Logs Are Not Equal

### Metrics

Metrics are the most contract-like observability surface.

It is usually desirable, and often necessary, to know before exposure:

- metric names
- metric type such as counter, gauge, or histogram
- units
- labels or tags
- semantic meaning
- expected consumers such as dashboards, alerts, SLOs, autoscaling, or billing

Metric names and labels should not be treated as disposable if downstream systems rely on them.

### Traces

Traces are partially contract-like.

The important stable surface is usually:

- major span boundaries
- span names
- correlation and propagation behavior
- important attributes that operators or analysis systems rely on

Not every span detail needs to be stabilized as a consumer-facing contract.

### Logs

Logs are the least contract-like by default.

What is usually worth stabilizing is:

- structured fields
- event category names
- correlation identifiers
- severity conventions
- important operational event shapes

Free-form human-readable message text usually should not be treated as a stable contract unless there is a specific reason.

---

## Relationship To Exposed Contracts

Exposed contracts and exposed observability are related but distinct:

- exposed contracts describe what the system offers to consumers
- exposed observability describes how the running system can be monitored and understood operationally

Some repositories should adopt both:

- integration contracts for APIs and events
- operational contracts for metrics, health surfaces, trace boundaries, and structured logging

---

## Phase Responsibilities

### `refine`

Decide:

- which operational signals are required for the slice or repository family
- which metrics are expected before exposure
- which trace boundaries matter
- which log structures must stay explicit
- which telemetry should be treated as stable enough for downstream consumers

### `build`

Implement and document the required observability surface.

Typical artifacts include:

- metric catalog or schema summary
- health endpoint contract
- trace naming guidance
- structured log field catalog

`build` is the right phase to produce these artifacts because implementation choices are being made there.

### `release`

Review whether meaningful observability changes occurred, especially:

- metric renames
- label changes
- health contract changes
- trace boundary changes
- removal of structured log fields used by operators

### Lifecycle Exposure

Verify that the intended observability signals are present in the exposure target when practical, and record where operators can find them.

Examples:

- APM service or dashboard reference
- metrics endpoint or exporter reference
- health endpoint evidence
- trace query reference
- logging dataset or schema reference

### Runtime Feedback

Capture which signals were missing, noisy, misleading, too expensive, or insufficient once the system interacted with reality so they can return to `extract` as evidence.

---

## Recommended Locations

Use explicit tracked locations such as:

```text
docs/observability/metrics.md
docs/observability/traces.md
docs/observability/logs.md
docs/observability/health.md
```

Possible contents:

- metric catalog
- metric naming and label rules
- expected dashboard or alert consumers
- stable trace/span naming guidance
- structured log field definitions
- health endpoint expectations

Repositories may also store machine-readable artifacts when helpful.

---

## Operational Change Classification

Repositories that adopt exposed observability should classify meaningful changes at least as:

- `breaking`: dashboards, alerts, automations, or operators may fail or require change
- `additive`: new signals added without invalidating expected existing usage
- `internal-only`: no meaningful externally relied-on observability surface changed

This is especially important for metrics and health surfaces.

---

## Minimal Artifact Expectations

For telemetry that others are expected to rely on, try to keep at least:

- signal name
- type or category
- units when applicable
- labels, tags, or structured fields
- meaning and intended use
- compatibility notes

For early repositories, a concise tracked observability catalog is acceptable before formal schemas or automated extraction exist.

---

## Exposure Evidence Rule

When a repository adopts exposed observability, `work/changes/<id>/exposure.md` should include relevant references such as:

- metrics location or dashboard reference
- health endpoint or health evidence
- trace dataset or query reference
- log dataset or structured logging reference
- brief note about whether the observability surface changed meaningfully

This allows exposure evidence to support operators as well as consumers of functional contracts.

---

## Family-Level Decision Template

```md
## DEC-XXXX - Treat Operational Telemetry As An Exposed Surface

- Date: YYYY-MM-DD
- Status: accepted
- Owners: both

### Context
This family of repositories is expected to be operated through metrics, traces, health signals, and structured logs. Those signals should be visible and reviewable before or during exposure rather than discovered only after deployment inside an APM.

### Decision
The repository family treats key operational telemetry as an explicit exposed observability surface.

The repository family will:

- document the metrics and other signals operators are expected to rely on
- produce or update those artifacts during `build`
- review meaningful telemetry changes during `release`
- reference the operational signal locations during lifecycle exposure

### Consequences
Operators and downstream automation can reason about the running system more intentionally. The repositories also take on the obligation to keep important telemetry definitions synchronized with implementation and release evidence.

### Alternatives considered
Treat observability as something discovered only in the APM after deployment. This was rejected because it makes telemetry surfaces accidental and weakens operational compatibility review.
```

---

## Starter Guidance

The starter does not require every repository to formalize observability surfaces.

But when a repository expects metrics, health endpoints, traces, or structured logs to be relied on operationally, treating them as explicit exposed observability is the stronger default.

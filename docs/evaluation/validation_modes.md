# Validation Modes

## Purpose

This document describes how different systems reveal expectation gaps during MRL.

Use it to decide how slices should be validated, how tightly runtime surfaces should stay coupled during construction, and how much of the loop depends on structural inspection versus lived interaction.

Validation mode describes the dominant way expectation gaps are discovered in the current project or slice. It is a practical guide, not a rigid taxonomy.

---

## Overview

MRL does not validate systems only through code correctness.
It validates whether the built system matches expectations.

Different systems expose different validation surfaces.
Recognizing that early changes:

- slice design
- pack choice
- repository shape
- how often built artifacts should be run
- whether frontend and backend should evolve together during construction

MRL distinguishes three common validation modes:

- headless-first
- interaction-assisted
- interaction-dependent

These are dominant modes, not permanent identities. A project may shift modes over time, and different slices in the same repository may rely on different validation surfaces.

---

## Validation Types

MRL commonly uses two complementary validation types.

### Structural Validation

Structural validation focuses on:

- domain model correctness
- invariants
- contracts
- state transitions
- data consistency

Common tools:

- tests
- logs
- assertions
- state inspection
- API or CLI probes
- EGD against deterministic evidence

### Experiential Validation

Experiential validation focuses on:

- interaction quality
- timing and responsiveness
- clarity and feedback
- friction in flows
- emergent behavior over time

Common tools:

- UI inspection
- manual exploration
- simulation runs
- runtime observation

---

## 1. Headless-first

### Definition

Headless-first systems can be validated primarily without a user interface or other interactive probe.

Structural validation is usually sufficient to detect the important expectation gaps in the current slice.

### Typical signals

- correctness can be validated via tests, logs, and state inspection alone
- an interactive surface would mostly mirror already-known behavior
- most important issues are structural rather than experiential

### Example shape

- `python_ddd_monolith`

### Typical loop

```text
extract -> refine -> build -> test -> inspect logs or state -> adjust
```

### Implications

- interactive surfaces can be delayed or developed separately
- slices are often validated through invariants and contracts
- repository shape can remain backend-focused for longer

---

## 2. Interaction-assisted

### Definition

Interaction-assisted systems can be validated headlessly, but an interactive surface accelerates expectation-gap detection and makes slice quality easier to judge.

The interactive surface is a useful probe, not the only source of truth. In many projects that surface is a UI, but the category is broader than presentation alone.

### Typical signals

- headless validation is possible, but slower or less clear
- interaction reveals mismatches earlier than tests alone
- slices often need to be seen in use to confirm coherence

### Example shape

- `js mithril + go api`

### Typical loop

```text
extract -> refine -> build -> test -> inspect through interaction and logs -> adjust
```

### Implications

- keep the frontend close during early development
- favor fast iteration between backend and UI
- treat the interactive surface as a diagnostic tool, not only presentation

---

## 3. Interaction-dependent

### Definition

Interaction-dependent systems cannot be validated well without executing and experiencing them through interaction.

Experiential validation is part of correctness for the current slice.

### Typical signals

- you need to experience the system to know whether it is right
- timing, flow, perception, or interaction define correctness
- tests may pass while the system still feels wrong

### Example shape

- `js canvas + websocket + go`

### Typical loop

```text
extract -> refine -> build -> run -> experience -> adjust -> repeat
```

### Implications

- the interactive surface is part of the core validation apparatus
- frontend and backend should usually evolve together during construction
- fast run-inspect-adjust cycles matter more than clean separation too early

---

## Repository Strategy Implications

| Mode | Repository and runtime strategy |
| --- | --- |
| Headless-first | frontend can be delayed, separated, or minimized during early loops |
| Interaction-assisted | frontend should stay close during development but may separate more easily later |
| Interaction-dependent | interactive runtime surfaces should stay tightly coupled during construction |

---

## Slice Design Implications

- headless-first slices are mainly validated through invariants, contracts, and outputs
- interaction-assisted slices are often validated through both outputs and visible flows
- interaction-dependent slices are validated through experience, timing, and behavior over time

The same repository may contain more than one mode.
For example, an interaction-heavy game slice may be interaction-dependent while an admin or persistence slice in the same repository is only interaction-assisted or headless-first.

---

## Practical Heuristic

Ask these questions at project start and again when defining slices:

- can this slice be validated without running a UI?
- does correctness depend on perception, timing, or interaction?
- do I need to experience it to know whether it is right?

The answers indicate the current dominant validation mode.

---

## Key Principle

> The more the system's truth depends on lived interaction, the more the interactive surface belongs inside the development feedback loop.

The UI is not always a presentation layer.
More generally, the interactive surface is often an instrument for detecting expectation gaps.

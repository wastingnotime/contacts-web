# Skills Workflow

## Purpose

This document defines how skills should be used inside the Model Refinement Lab. Read `docs/operating/mrl_reference.md` first when a compact restatement of the model is needed.

## Scope

This document defines MRL core skill behavior and phase isolation rules.
It does not define project-specific architecture, domain rules, or organization-specific coordination workflows.

The goal is to preserve phase isolation, reduce hidden assumptions, and keep model refinement reproducible. See `docs/operating/best_practices.md` for practical phase guidance such as when architecture decisions should move from `extract` to `refine`.

---

## Core Principle

> Each phase is an isolated loop executed by a bounded agent.

Do not rely on conversational continuity.
Do not mix responsibilities.
Do not carry implicit state across phases.

Instead:

> State lives in artifacts. Execution is stateless.

---

## Why Strong Isolation

One long-running session creates avoidable problems:

- extraction contaminates refinement
- refinement contaminates build decisions
- validation contaminates hypothesis generation
- assumptions become implicit instead of documented
- reproducibility degrades over time

Strong isolation improves:

- role clarity
- deterministic execution
- easier debugging
- cleaner refinement loops

---

## Repository Skills

Repository-scoped skills should live under `.agents/skills/` with one folder per loop phase or support role.

```text
.agents/skills/
  adoption-diagnose/
    SKILL.md
  extract/
    SKILL.md
  refine/
    SKILL.md
  build/
    SKILL.md
  egd/
    SKILL.md
  release/
    SKILL.md
  guidance/
    SKILL.md
```

Canonical loop skills should remain phase-bounded and artifact-driven. `extract`, `refine`, `build`, `egd`, and `release` are the core loop skills.
Support skills should remain role-bounded and artifact-driven.

Support skills currently include:

- `adoption-diagnose`: audits whether a repository has intentionally adopted the starter through project-specific README, licensing, decisions, pack selection, and semantic artifacts
- `guidance`: answers owner/operator questions about MRL from repository artifacts without modifying files

---

## New Repository Use

When bootstrapping MRL in a fresh repository, use `docs/operating/mrl_starter.md` as the portable baseline and then install the same repository-scoped skills under `.agents/skills/`.

Starter repositories should include `work/sources/` up front as the canonical folder for curated raw evidence and original source material so `extract` does not have to invent that convention later.
Treat `work/` as repository memory rather than scratch space.

Use `adoption-diagnose` when an adopting repository needs to check whether starter defaults have been intentionally replaced.
Use `guidance` when the owner needs help choosing a phase, interpreting an artifact, or understanding MRL policy without changing repository files.

---

## Execution Model

### Rule

> One skill = one isolated execution context.

Preferred execution:

```bash
codex run .agents/skills/extract/SKILL.md
codex run .agents/skills/refine/SKILL.md
codex run .agents/skills/build/SKILL.md
codex run .agents/skills/egd/SKILL.md
```

Lighter but still acceptable execution:

```bash
/new
/skill extract

/new
/skill refine

/new
/skill build

/new
/skill egd
```

---

## Recommended Agent Mapping

The table below defines the current recommended agent, context, inputs, outputs, and boundaries for the main executable phases.

| Phase | Recommended agent | Role | Ideal context | Main inputs | Main outputs | Must not |
| --- | --- | --- | --- | --- | --- | --- |
| `extract` | `gpt-5.4` `medium` | external-domain analyst | current `docs/semantics/model_hypothesis.md`, current `docs/semantics/domain_background_knowledge.md`, relevant external material | external code, external docs, stakeholder requests, runtime evidence | updated `docs/semantics/model_hypothesis.md`, updated `docs/semantics/domain_background_knowledge.md`, optional `request.md` | design implementation prematurely or write production code |
| `refine` | `gpt-5.4` `medium` | model-to-slice designer | `docs/semantics/model_hypothesis.md`, `architecture.md`, `groundrules.md`, `decisions.md` | `request.md`, semantic docs, relevant code | `work/changes/<id>/request_slice_map.md`, `docs/slices/<specific_slice>.md`, optional `impact_analysis.md` | write code or silently invent business rules |
| `build` | `gpt-5.3-codex` `medium` | slice implementer | `docs/building/project_structure.md`, `architecture.md`, `groundrules.md`, `decisions.md` | `docs/slices/<specific_slice>.md`, optional `work/changes/<id>/request_slice_map.md` | code, tests, optional `implementation.md` | redefine semantic docs unless the slice explicitly requires it |
| `egd` | `gpt-5.4` `medium` plus optional local `llama3` reviewer | expectation-gap reviewer | `docs/semantics/model_hypothesis.md`, `docs/semantics/domain_background_knowledge.md`, `docs/evaluation/scenario_evaluation.md` | `work/changes/<id>/request.md`, `work/changes/<id>/request_slice_map.md`, relevant slice docs, test outputs, implementation artifacts, optional scenario evidence packet | `egd.md`, optional `runs/<request-or-change-id>/<timestamp>/...` | modify code or patch behavior directly |
| `release` | `gpt-5.4` `medium` | acceptance and regression judge | request, request-to-slice map, slice definition, implementation summary, test results, EGD outputs, decisions | `work/changes/<id>/request.md`, `work/changes/<id>/request_slice_map.md`, relevant slice docs, regression results, EGD report | `regression_diff.md`, `release_decision.md` | reduce the phase to raw test execution only |

Notes:

- `extract` should usually produce or update both semantic reference docs, not only one.
- `refine` is where request-to-slice mapping and slice design become explicit; `extract` should stop earlier.
- `egd` may use a smaller local model such as `llama3` for first-pass review, but interpretation and loop decisions should remain explicit.
- `egd` reviews the request as the boundary of expected behavior; slice docs and implementation artifacts are supporting evidence.
- `egd` defaults to a lightweight artifact-led review when the current request does not yet have a dedicated deterministic scenario runner and evidence packet.
- in lightweight mode, Codex reviews semantic artifacts, implementation artifacts, and fresh test evidence directly and records the result in `egd.md` without pretending that a fuller scenario-evaluation run occurred.
- once a request has a deterministic scenario packet, prefer the fuller Ollama-backed evaluation flow described in `docs/evaluation/scenario_evaluation.md`.
- `release` should end with a decision, not only a diff artifact.

---

## MRL Phase Structure

### 1. Extract

**Goal**

- capture relevant signals from requests, systems, documents, behavior, and prior evidence
- identify the material that should enter the refinement loop
- make source evidence explicit

**Input**

- request material
- relevant docs
- existing code
- runtime evidence when available
- curated raw evidence and original source material preserved under `work/sources/`

**Output**

- `request.md`
- extracted notes or source evidence references derived from material preserved in `work/sources/`

**Must not**

- define the solution prematurely
- write implementation code

### 2. Refine

**Goal**

- transform extracted signals into clearer model hypotheses
- evaluate fit with current boundaries and language
- map the request boundary to one or more implementation slices
- identify impacted slices and likely decisions

**Input**

- `request.md`
- semantic docs
- architecture docs
- relevant code

**Output**

- `hypothesis.md`
- `request_slice_map.md`
- `impact_analysis.md`

**Must not**

- write production code
- silently redefine business rules

### 3. Build

**Goal**

- implement or change one slice based on the refined model
- respect domain boundaries
- validate deterministic behavior with tests

**Input**

- `hypothesis.md`
- `request_slice_map.md`
- `impact_analysis.md`
- repository code

**Output**

- code changes
- `implementation.md`
- test results

**Must not**

- invent missing business rules
- bypass the refined model without documenting why

### 4. EGD

**Goal**

- detect mismatch between expected and actual behavior
- identify plausible omissions, weak outcomes, or semantically incomplete behavior
- evaluate the implemented response to the request, including all relevant slices

**Default modes**

- lightweight artifact-led review is the normal default for earlier requests
- fuller Ollama-backed scenario evaluation is preferred once deterministic scenario infrastructure exists

**Input**

- request artifact
- semantic docs
- relevant slice definitions
- implementation artifacts
- fresh test evidence
- optional deterministic scenario evidence packet

**Output**

- `egd.md`
- optional scenario-evaluation artifacts under `runs/<request-or-change-id>/<timestamp>/...`
- recommendation: return to extract, return to refine, return to build, or continue

**Must not**

- modify code
- patch behavior directly

### 5. Release

**Goal**

- declare whether the implemented request state is the accepted internal version
- package the request outcome as the current intended internal state

**Input**

- request artifact
- request-to-slice map
- implementation state
- test evidence
- EGD review report
- decision records

**Output**

- release decision
- accepted request state

**Must not**

- imply external exposure automatically
- substitute for EGD or refinement decisions

---

## Lifecycle Boundary

MRL core ends at `release`.

Exposure and runtime feedback are lifecycle boundaries around the loop. They are artifact-driven, but they are not starter skills and are not canonical loop phases.

The starter provides the abstract exposure-extension contract in `docs/operating/expose_extensions.md`. A concrete extension may provide its own skill or automation for recording exposure evidence.

Runtime feedback should be preserved as source evidence and brought back through `extract`. The starter does not provide a separate `feedback` skill because interpretation, semantic updates, and new request shaping belong in `extract`.

---

## Artifact-Centered Memory

> Artifacts are the only source of truth.

Recommended structure:

```text
work/changes/<id>/
  request.md
  request_slice_map.md
  hypothesis.md
  impact_analysis.md
  implementation.md
  egd.md
  decision.md
```

Each phase should:

- read explicit artifacts
- write explicit artifacts
- avoid depending on conversational memory
- commit each completed, verified change before starting unrelated work

---

## Completion Discipline

A change is complete when its intended artifact or code update has been written, checked at the appropriate level, and is ready to become repository memory.

After every completed change:

- review the diff for scope
- run the relevant lightweight validation, or record why no validation applies
- create a focused Conventional Commit before moving to unrelated work

Do not rely on an open working tree as process memory. If a change is intentionally left uncommitted, record the reason in the active change artifact or tell the operator explicitly.

---

## Skill Design Rules

Each skill should define:

- mission
- explicit inputs
- explicit outputs
- allowed actions
- forbidden actions

Critical rule:

> Every skill must state what it must not do.

This is the mechanism that preserves isolation.

---

## Operational Modes

### Fast loop

Use this for ordinary iteration speed:

```bash
/new
/skill extract

/new
/skill refine

/new
/skill build

/new
/skill egd
```

### Strict loop

Use this when you need higher confidence or easier debugging:

```bash
codex run .agents/skills/extract/SKILL.md
codex run .agents/skills/refine/SKILL.md
codex run .agents/skills/build/SKILL.md
codex run .agents/skills/egd/SKILL.md
```

---

## Mental Model

Not:

> one assistant evolving over time

But:

> a pipeline of isolated phase workers operating on shared artifacts

```text
extract
  -> refine/build loop
  -> egd
  -> release

release
  -> optional lifecycle exposure
  -> runtime feedback
  -> extract
```

---

## Summary

Strong isolation plus artifact-driven execution is the preferred operating model for MRL.

MRL defines the loop and the abstract lifecycle boundary.
Skills execute the loop or a bounded lifecycle support role.
Artifacts preserve the truth.

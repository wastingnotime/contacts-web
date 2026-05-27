# MRL Reference

## Purpose

This document is the compact reference for the Model Refinement Lab.

## Scope

This document defines MRL core behavior: the refinement loop, phase semantics, artifact discipline, and portability expectations.
It does not define project-specific architecture, domain behavior, or operational governance.

Use it to rebuild context quickly in a fresh session, a bounded skill run, or a new repository that adopts the same workflow.

---

## What MRL Is

MRL is a repository-centered way to evolve software through explicit model refinement.

It treats business understanding, slice definition, code, evaluation, and delivery as separate but connected phases.

The goal is not to preserve one long assistant conversation. The goal is to preserve truth in repository artifacts.

---

## What MRL Is Not

MRL is not:

- a chat-driven development process
- a hidden-state agent workflow
- a framework that assumes microservices or production infrastructure first
- an operations model

MRL is a refinement loop. Lifecycle exposure and runtime feedback sit at the boundary around the loop.

---

## Canonical Loop

```text
extract -> refine/build loop -> egd -> release
```

After release, a project may use an exposure extension to put the accepted state into a real context. Runtime feedback from that exposed state becomes source material for a later `extract` pass:

```text
release -> lifecycle exposure -> runtime feedback -> extract
```

### `extract`
Capture requests, external systems, docs, runtime evidence, and reference material into explicit artifacts.

### `refine`
Turn extracted signals into bounded model hypotheses and slice definitions.

### `build`
Implement one slice in code with deterministic tests.

`refine` and `build` may loop while slice boundaries, implementation evidence, or deterministic tests reveal that the request has not yet been expressed clearly enough. That loop remains bounded by the request and recorded artifacts.

### `egd`
Run expectation-gap detection for the request against realistic execution evidence. Use slices as implementation and evidence units, but keep the request as the review boundary. Default to lightweight artifact-led review first, and prefer fuller Ollama-backed scenario evaluation once deterministic scenario evidence exists.

### `release`
Accept the implemented request state as the intended internal version.

---

## Lifecycle Boundary

MRL core ends at `release`.

Many repositories still need to put a released state into contact with users, stakeholders, workflows, environments, images, integration sandboxes, or deployment handoffs. That work is exposure, but it is not owned by the MRL core loop.

MRL core provides only an abstract exposure contract:

- exposure starts from an accepted release
- the exposure target and completion boundary must be explicit
- the artifact being exposed must be identifiable and reproducible
- evidence of the exposure attempt or event should be recorded
- feedback channels should be named so runtime evidence can return to `extract`

Concrete exposure mechanics belong in optional exposure extensions or repository-specific lifecycle guidance. A repository with domain-specific exposure needs can implement this contract in its own extension without making that behavior part of portable MRL core.

Default operating rule:

- if a released artifact is intended for lifecycle exposure, it should normally be packaged in a portable runtime form
- the default portable form is a container image unless the adopting repository has a better justified deployment artifact
- packaging for exposure is a lifecycle concern, not a domain-semantics concern

Runtime feedback, friction, surprises, and drift do not bypass the loop. Treat them as evidence for the next `extract` pass.

---

## Artifact Rule

> Artifacts are the source of truth. Execution is stateless.

Each phase should read explicit files, write explicit files, and avoid depending on prior conversational memory.

Completed changes should be committed immediately after verification. A completed change is any accepted update to workflow artifacts, semantic artifacts, slice documents, code, tests, or release/exposure evidence that should survive beyond the current execution context.

Typical artifact chain:

```text
request.md
  -> docs/semantics/model_hypothesis.md
  -> docs/semantics/domain_background_knowledge.md
  -> work/changes/<id>/request_slice_map.md
  -> docs/slices/<slice>.md
  -> code + tests + implementation notes
  -> runs/<request-or-change-id>/<timestamp>/...
  -> release_decision.md
  -> optional exposure.md
  -> later extract evidence
```

---

## Repository Layers

Use the repository in layers:

- root strategic docs: overall intent, architecture, constraints, and decisions
- `docs/operating/`: the MRL model and skill workflow
- `docs/semantics/`: extracted and reference business meaning
- `docs/slices/`: one bounded slice definition per increment
- `src/` and `tests/`: executable implementation
- `runs/`: untracked evaluation evidence

---

## Skills and Isolation

Repository-scoped skills under `.agents/skills/` execute the loop or support repository operation in isolated contexts.

Each skill should define:

- mission
- explicit inputs
- explicit outputs
- allowed actions
- forbidden actions

Use a fresh session or isolated run per phase whenever practical.

Support skills may sit outside the canonical loop when they preserve the same artifact discipline. Examples include adoption diagnosis for starter readiness and guidance for answering MRL operating questions without modifying repository state.

---

## Portable MRL

To make MRL portable to a fresh repository, keep the framework generic and move domain-specific material into semantic docs and slice docs.

Use `docs/operating/mrl_starter.md` as the starter layout for new repositories. Use `docs/operating/best_practices.md` for practical guidance such as architecture timing and phase discipline.
Use `docs/evaluation/validation_modes.md` when the repository needs to decide whether slices are mainly validated headlessly, through interaction assistance, or through lived interaction.

MRL portability does not require one implementation language or one architecture.

The portable part is:

- the loop
- the artifact rules
- the skill isolation model
- the semantic and slice documents

Language, runtime topology, and architectural style should be selected separately through repository pack guidance.

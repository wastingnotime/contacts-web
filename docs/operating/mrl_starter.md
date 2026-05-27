# MRL Starter

## Purpose

This document defines the minimal portable shape for adopting the Model Refinement Lab in a new repository.

## Scope

This document defines MRL core starter guidance: how a repository can adopt the refinement framework without becoming the framework.
It does not define the adopting project's domain behavior, system architecture, or operational governance.

Use it when creating a fresh project that should follow the same refinement discipline without copying domain-specific content from this repository. The practical instantiation flow is to clone the starter into a new repository name and then let `extract` create the first semantic baseline.

---

## Separate Core From Instance

MRL has two layers:

- MRL core: the framework, phase grammar, artifact discipline, and portable refinement guidance
- Project instance: the concrete repository using MRL to evolve a domain, system, or product

The portable core loop is:

```text
extract -> refine/build loop -> egd -> release
```

Lifecycle exposure and runtime feedback sit outside that core loop:

```text
release -> lifecycle exposure -> runtime feedback -> extract
```

The starter may describe an abstract exposure contract, but concrete exposure mechanics belong in optional extensions or project-instance lifecycle guidance.

The same artifact names may exist in both layers. A project can have its own `architecture.md`, `groundrules.md`, and `decisions.md` without those files defining MRL itself.

### MRL core

These parts define portable MRL behavior or reusable framework guidance:

- `.agents/skills/`
- `docs/operating/`
- generic evaluation guidance under `docs/evaluation/`
- generic pack definitions under `docs/packs/`

MRL core artifacts should stay generic, portable, organization-agnostic, and operationally agnostic.

### Project instance

These parts belong to the repository using MRL and should be rewritten or filled in for each new domain:

- `readme.md`
- `architecture.md`
- `groundrules.md`
- `decisions.md`
- `AGENTS.md`
- `docs/semantics/model_hypothesis.md`
- `docs/semantics/domain_background_knowledge.md`
- `docs/slices/`
- `work/sources/`
- `work/changes/`
- local evaluation artifacts under `runs/`

Project-instance artifacts describe the adopting repository's architecture, constraints, domain model, decisions, assumptions, and refinement history. They do not modify MRL core behavior.

### Pack-specific

These parts define language and architecture defaults and may be replaced:

- `docs/building/project_structure.md`
- scenario runner pattern
- test shape
- code under `src/`
- tests under `tests/`
- language toolchain files such as `pyproject.toml`, `package.json`, or `go.mod`

### Optional overlays

Operational coordination concerns are not part of MRL core. Examples include campaigns, release coordination, organizational governance, and company-specific collaboration workflows.

Those concerns may be added by an adopting organization through overlays, optional skills, or external frameworks, but they should not be embedded into the starter as core MRL behavior.

Exposure works the same way. A repository that needs domain-specific exposure should implement the abstract exposure contract in an extension owned by that repository or repository family, not in portable MRL core.

---

## Scope Rule For Artifacts

Each durable artifact should make its ownership scope explicit when the scope is not obvious from its path.

Use this wording shape for MRL core artifacts:

```md
## Scope

This document defines MRL framework behavior.
It does not define project-specific behavior.
```

Use this wording shape for project-instance artifacts:

```md
## Scope

This document defines project-specific refinement behavior and system evolution.
It does not modify MRL core behavior.
```

---

## Minimal Starter Layout

```text
project_root/
  readme.md
  architecture.md
  groundrules.md
  decisions.md
  AGENTS.md
  .gitignore
  pyproject.toml

  .agents/
    skills/
      extract/
      refine/
      build/
      egd/
      release/
      adoption-diagnose/
      guidance/

  docs/
    operating/
      mrl_reference.md
      mrl_starter.md
      packs.md
      skills_workflow.md
    building/
      project_structure.md
    packs/
      python_ddd_monolith.md
    evaluation/
      scenario_evaluation.md
    semantics/
      model_hypothesis.md
      domain_background_knowledge.md
    slices/

  src/                        # shaped by the selected pack
  tests/                      # shaped by the selected pack
```

---

## First Bootstrap Sequence

A new repository should start with this order:

1. define root strategic docs and `docs/operating/`
2. choose and document the repository licensing approach before adding substantial project-specific code
3. install repo-local skills under `.agents/skills/`
4. select or define a pack and record it in `decisions.md`
5. keep the semantic docs as placeholders under `docs/semantics/`
6. run `extract` to build the first model baseline
7. run `refine` to create the first request-to-slice map and slice
8. run `build` to implement the first executable vertical slice
9. run `egd` against the request before deciding `release`

After each completed and verified repository change, commit the result with a focused Conventional Commit before starting unrelated work. This keeps the starter's artifact memory aligned with Git history instead of relying on an operator's active working tree.

Run `adoption-diagnose` before substantial project-specific work when you want to verify that starter defaults such as licensing, README content, and pack selection have been intentionally handled.
Use `guidance` when the repository owner has questions about MRL phases, artifacts, or boundaries and needs advice rather than file changes.

## Baseline Lock

Repositories can track the installed starter baseline with `mrl.lock.yaml`.

The starter manifest lives at:

```text
manifest.yaml
```

Use `mrl-cli install --source ../mrl-starter --target .` when a repository does not yet have `mrl.lock.yaml`.
Use `mrl-cli sync --source ../mrl-starter --target .` when the repository already has the lock and should be refreshed to the current starter baseline.

Organization-specific overlays should use their own lock files, such as `mrl-extension.lock.yaml`, so portable MRL baseline drift and extension drift can be inspected independently.

## Licensing Guidance For Adopters

Treat licensing as an explicit adoption decision, not as an accidental consequence of cloning the starter.

The simplest path is to keep one license for the whole adopting repository. That is a good default when you do not need different sharing terms for process artifacts and implementation code.

When a project needs different terms, a split-license model is also valid. A practical pattern is:

- keep MRL process artifacts and reusable template-style material under a permissive license
- place project-specific implementation code and runtime assets under the license that fits the shipped product

Typical MRL core or template-style material includes:

- `docs/operating/`
- generic pack definitions under `docs/packs/`
- generic skill instructions under `.agents/skills/`

Typical project-specific material includes:

- root strategic docs such as `readme.md`, `architecture.md`, `groundrules.md`, `decisions.md`, and `AGENTS.md`
- code under `src/`
- tests under `tests/`
- domain-specific semantic artifacts under `docs/semantics/`
- domain-specific slice documents under `docs/slices/`
- runtime assets and game or product content

If you adopt a split-license approach:

- rewrite the root `LICENSE` to explain which parts of the repository are covered by which license
- include the full text of each applicable license in a dedicated location such as `LICENSES/`
- update package metadata and release metadata to match the license that applies to the distributed code
- add header templates or file-level notices when the chosen code license requires clearer per-file scope
- record the reasoning and scope in `decisions.md`

The important rule is clarity. An adopting repository should make it easy for a contributor, user, or downstream maintainer to tell which repository content is governed by which license and why.

---

## Portability Test

MRL is portable only if a new domain can reuse the same loop and skills by changing semantic artifacts and slices rather than rewriting the workflow itself.

A practical test is:

- keep the operating docs and skills
- select or replace the implementation pack intentionally
- replace semantic docs and slice docs
- implement a new first slice
- run the same loop end to end

If that works, the starter is sufficiently portable.

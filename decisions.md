# Decisions Log

## Purpose

This document records relevant architectural and implementation decisions for the adopting repository.

Use it to preserve reasoning, avoid re-discussing settled trade-offs without context, and document deviations from `architecture.md` and `groundrules.md`.

---

## Entry Template

```md
## DEC-XXXX - Title

- Date: YYYY-MM-DD
- Status: proposed | accepted | superseded | rejected
- Owners: human | codex | both

### Context
What problem or tension led to this decision?

### Decision
What was decided?

### Consequences
What becomes easier, harder, or different because of this?

### Alternatives considered
What other options were considered and why were they not chosen?

### Notes
Any additional implementation guidance, migration note, or follow-up.
```

---

## Index

Add entries as the repository evolves.

## DEC-0009 - Keep Infra-Platform Promotion Out Of The App Repository Workflow

- Date: 2026-04-28
- Status: accepted
- Owners: both

### Context
The production promotion contract now places image publication in the app repository and infrastructure promotion elsewhere. The app repository previously opened a pull request into `wastingnotime/infra-platform`, which made this repo responsible for a cross-repository promotion action that no longer matches the contract.

### Decision
Remove the infra-platform pull request step from the app repository workflow. The app repo remains responsible for building and publishing its own artifacts, but it no longer opens or manages promotion pull requests in `wastingnotime/infra-platform`.

### Consequences
The app repository stops owning cross-repository promotion mechanics. Promotion can now be handled by the repository or automation that owns the infra-platform workflow, without coupling that responsibility to app build and publication jobs.

### Alternatives considered
Keep the PR creation step but make it optional. This was rejected because the contract now explicitly removes the app repo from infra-platform promotion ownership.

### Notes
The removed behavior lived in `.github/workflows/ci-web-docker.yml`.

## DEC-0008 - Publish A Swarm-Compatible BFF Image For Production Delivery

- Date: 2026-04-23
- Status: accepted
- Owners: both

### Context
The production architecture note says the infra contract is already in place, but `contacts-web` still needs to publish a Swarm-compatible BFF image that binds on the production port for Traefik ingress. The repository already has a container path for the SPA, but production delivery now needs an explicit BFF artifact as well.

### Decision
Treat production delivery as a two-artifact boundary:

- a static SPA container image for browser assets
- a Swarm-compatible BFF container image that binds on the production port and serves Traefik ingress

The BFF remains the delivery adapter between the SPA and the backend; the repository should not collapse those concerns into one artifact.

### Consequences
Production packaging becomes an explicit repo responsibility rather than an implicit infra assumption. The repo now has to preserve relative `/api` paths, keep the BFF deployable as a separate container, and avoid drifting back to a browser-to-backend direct path in production packaging.

### Alternatives considered
Keep only the static SPA container in this repository and let infra own the BFF packaging. This was rejected because the infra contract explicitly depends on the repo publishing the BFF image.

### Notes
The root `Dockerfile` remains the SPA static artifact path. The BFF image delivery path now lives in `apps/bff/Dockerfile` and should stay separate from the SPA container.

## DEC-0007 - Split Licensing Between MRL Artifacts And Contacts-Web Artifacts

- Date: 2026-04-22
- Status: accepted
- Owners: both

### Context
This repository contains two materially different kinds of content:

- MRL process and operating artifacts that should remain reusable across repositories
- `contacts-web` product artifacts that are specific to this repository's implementation and delivery surface

The repository needs a durable memory of which license applies to which layer so future changes do not collapse the distinction.

### Decision
Keep the MRL process material under MIT while treating the `contacts-web` project artifacts as MPL 2.0 content.

For this repository, the intended split is:

- MIT for MRL operating docs, reusable workflow guidance, and other process-oriented artifacts
- MPL 2.0 for `contacts-web` implementation code, tests, semantic artifacts, slice artifacts, and runtime assets

### Consequences
The repository now has an explicit licensing boundary that matches the architectural boundary:

- MRL remains a reusable method layer
- `contacts-web` remains the product-specific layer

Future publishing or redistribution work needs to preserve that distinction instead of assuming a single repository-wide license.

### Alternatives considered
Use one license for the entire repository. That was rejected because the repo now serves both a reusable MRL layer and product-specific `contacts-web` artifacts, and the user explicitly wants those treated differently.

### Notes
The root license files and any release metadata should be kept consistent with this split-license decision when publishing or redistributing repository content.

## DEC-0006 - Keep The Web BFF In The Contacts-Web Repo

- Date: 2026-04-22
- Status: accepted
- Owners: both

### Context
The extracted BFF architecture summary argues for a web-specific Backend for Frontend that lives alongside the Solid SPA in `contacts-web`, while the domain/API backend remains a separate repository. The current repo docs still describe a single browser client boundary, so the delivery shape needs an explicit decision.

### Decision
The repository now treats `contacts-web` as a multi-runtime web delivery repository containing:

- a Solid SPA
- a Node.js plus TypeScript web BFF
- shared browser-facing contracts where useful

The BFF is a separate app, not a mixed concern inside SPA components. The repo does not own backend domain logic, persistence, or backend authorization policy. Mobile may later adopt its own BFF rather than sharing this one.

### Consequences
The repository gains a clearer separation between interaction/rendering and delivery adaptation. SPA code can stay focused on browser behavior while the BFF owns request aggregation, auth/session plumbing, and UI-oriented response shaping.

The trade-off is that local development, tests, and structure need to account for two runtime surfaces instead of one.

### Alternatives considered
Keep the BFF as an internal module inside the SPA. This was rejected because it would blur delivery concerns into UI code and make the boundary harder to evolve per channel.

Move the BFF into a separate repository. This was rejected for the current phase because the same team owns SPA and BFF, and the summary explicitly favors single-PR iteration and lower coordination overhead.

### Notes
Target structure should evolve toward `apps/spa/`, `apps/bff/`, and `packages/shared/` where needed. The backend domain/API stays external in `contacts-v2`.

## DEC-0001 - Separate MRL Core From Implementation Packs

- Date: 2026-03-29
- Status: accepted
- Owners: both

### Context
The starter was presenting Python plus a DDD-inspired modular monolith as if that were the default shape of MRL itself. That creates confusion when a repository needs another language, another architecture such as event sourcing, or more than one runtime.

### Decision
The repository now distinguishes between:

- MRL core, which stays artifact-driven and architecture-agnostic
- implementation packs, which define language, architecture, structure, and testing defaults

The current repository keeps `python_ddd_monolith` as the example selected pack.

### Consequences
It becomes easier to reuse the same refinement workflow across Python, JavaScript, Go, event-sourced, and polyglot client/server repositories. It also becomes necessary to make the selected pack explicit in architecture docs and slice docs.

### Alternatives considered
Keep one universal Python starter and treat every other shape as an undocumented deviation. This was rejected because it would keep conflating MRL with one implementation style.

### Notes
Future pack additions should live under `docs/packs/` and should be referenced by slice documents when the runtime topology matters.

## DEC-0002 - Treat Skill Model Guidance As Advisory

- Date: 2026-04-02
- Status: accepted
- Owners: both

### Context
The repository skills now include model guidance for tasks such as `build`, `refine`, and `extract`. That creates a potential ambiguity: a reader could assume that naming a preferred model in a skill will automatically switch the active Codex model or force sub-agent routing during execution.

### Decision
Model guidance inside repository skills is advisory only. It documents which model shape is usually a good fit for the task, but it does not by itself require automatic model switching, worker spawning, or hard routing behavior.

### Consequences
The skills remain durable even if model names, availability, or routing capabilities change. The repository gains clearer guidance for future operators and tooling, but predictable model selection still requires explicit runtime policy or orchestration outside the skill text.

### Alternatives considered
Encode specific model names in skills as if they were enforced execution rules. This was rejected because skill text alone does not guarantee runtime behavior and would overstate what the repository can currently control.

### Notes
If the repository later wants deterministic skill-to-model routing, document that as a separate operational decision and implement it in the calling workflow or agent orchestration layer.

## DEC-0003 - Avoid `.codex` Repository Artifacts For Now

- Date: 2026-04-02
- Status: accepted
- Owners: both

### Context
The repository has used `.codex`-specific artifacts while shaping the workflow. That creates a risk that the MRL process starts to look tool-defined rather than process-defined before it is clear whether MRL can stay tool-agnostic in practice.

### Decision
For now, the repository should avoid relying on `.codex` as part of the committed process shape. The workflow should stay centered on MRL artifacts and repository documents rather than tool-specific folders. This decision is explicitly reversible while the team validates whether MRL can remain tool-agnostic or whether a specific AI tool will prove operationally necessary.

### Consequences
The repository stays cleaner and more focused on portable process artifacts. It may require some extra translation when using Codex or another tool because fewer tool-native conventions are captured directly in versioned files. The decision also preserves room to adopt tool-specific support later if real usage shows that generic artifacts are not enough.

### Alternatives considered
Keep `.codex` as a first-class part of the repository workflow immediately. This was rejected for now because it would prematurely optimize for one tool before validating whether that coupling is necessary for MRL.

### Notes
If future evidence shows that MRL depends on stable capabilities from a specific AI tool, record a follow-up decision describing the required coupling, why generic artifacts were insufficient, and which tool-specific assets should become part of the repository.

## DEC-0004 - Treat Storybook As A Local Preview Runtime

- Date: 2026-04-21
- Status: accepted
- Owners: both

### Context
The contacts frontend needs a lightweight way to inspect form and list states without starting the full app or contacting the backend. The repository already uses isolated mode for backend-free app execution, but that path still includes the application shell and router.

### Decision
Add Storybook as a separate local preview runtime for inspecting contact UI states. Storybook should load the existing Solid UI, use deterministic local fixtures, and remain separate from the live contacts backend path and from the main app bootstrap.

### Consequences
Component and page states become easier to review in isolation. The repository now has three clearly separate execution surfaces:

- the live app
- isolated backend-free app execution
- Storybook preview

That separation improves inspection and communication, but it also requires keeping preview fixtures and shared styles in sync with the application UI.

### Alternatives considered
Rely only on the isolated app runtime for previewing states. This was rejected because the app shell and router add noise when the goal is to inspect a component or page state directly.

### Notes
Keep Storybook backend-free. Prefer local fixtures over reaching into the live bootstrap path. Keep generated `storybook-static/` output out of version control.

## DEC-0005 - Treat Integrated Local Mode As A Separate Local Validation Surface

- Date: 2026-04-21
- Status: accepted
- Owners: both

### Context
The contacts frontend now has two distinct local development pressures: backend-free UI iteration and real local service validation against seeded data. Those needs should not be collapsed into the same mode because they answer different questions during development.

### Decision
Add an explicit integrated local mode for running the Solid frontend against a locally hosted contacts backend and seeded local data. Keep it separate from isolated mode and from Storybook preview. Use a dedicated Vite mode preset and local environment values to make the stack choice explicit.

### Consequences
Developers get a clearer path for contract validation and flow debugging without leaving the local machine. The repository now has three distinct local surfaces:

- isolated backend-free app execution
- integrated local service validation
- Storybook preview

That separation improves clarity, but it also means the local environment presets and docs need to stay accurate as the stack evolves.

### Alternatives considered
Fold integrated local behavior into the default live dev server. This was rejected because it would hide the fact that the frontend is running against local services rather than the external backend reference.

### Notes
Keep the integrated local mode explicit in scripts and documentation. Use deterministic seeded local data when available. Do not let this mode drift into a substitute for the external backend contract.

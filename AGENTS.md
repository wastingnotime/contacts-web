# Repository Identity

`contacts-web` is a bounded browser experience repository.

It is a frontend refinement environment, a BFF-oriented integration surface, and a local memory space for the Contacts web experience.

It is not a shared frontend filesystem and it is not the authority for backend domain rules.

## Repository Responsibilities

- expose browser-facing contracts for the Contacts web experience
- define UX and runtime semantics for the web client
- keep BFF integration expectations explicit
- preserve auth and session expectations at the browser boundary
- define telemetry semantics for the web experience
- preserve navigation semantics and browser routing expectations
- keep public artifacts understandable to visiting agents

## Non-Responsibilities

- backend domain ownership
- persistence ownership
- deployment orchestration
- mobile application behavior
- infrastructure topology
- cluster transport details
- server-side source of truth for domain policy

## UX / Frontend Philosophy

- treat the browser as the primary owned runtime
- prefer contract-first changes over implicit coupling
- keep relative `/api` usage aligned with BFF mediation
- make stable user interactions predictable before expanding experimental behavior
- keep runtime seams visible in docs and tests
- avoid coupling tests or visitors to component internals when a contract exists

## Visitor Guidance

If you are new to the repository, read these in order:

1. `docs/operating/mrl_reference.md`
2. `docs/operating/skills_workflow.md`
3. `docs/semantics/model_hypothesis.md`
4. `docs/semantics/domain_background_knowledge.md`
5. the relevant slice under `docs/slices/`

Prefer exported semantics and slice documents over source spelunking.

## Public Contracts

The public contract surface is expressed through the root `contracts/` tree and the repository artifacts that implement or verify those contracts.

Canonical contract index:

- `contracts/frontend/`
- `contracts/bff/`
- `contracts/auth/`
- `contracts/telemetry/`
- `contracts/navigation/`
- `contracts/session/`

Implementation-adjacent locations that realize or verify those contracts:

- `src/client/contracts/` for browser contract adapters and transport-facing browser types
- `src/shared/config/` for shared configuration defaults that shape public runtime behavior
- `src/shared/telemetry/` for telemetry semantics shared across browser-facing surfaces
- `tests/contracts/` for executable contract specifications
- `work/publications/` for publication handoff artifacts

Public contract categories:

- `frontend`
- `bff`
- `auth`
- `telemetry`
- `navigation`
- `session`

Keep the exported surface stable and prefer the root `contracts/` tree when navigating or extending public boundaries.

## BFF Integration Expectations

- the browser should talk to the BFF through explicit integration seams
- relative `/api` paths are preferred where they preserve local and production routing alignment
- browser code should not assume backend topology directly
- the BFF should remain the delivery adapter between browser and backend
- integration changes should keep the browser and backend responsibilities separated

## Telemetry Expectations

- telemetry should describe browser behavior, not leak internal implementation details
- emitted events should remain useful for navigation, interaction, and failure observation
- telemetry should avoid unnecessary PII and should not become a hidden domain channel
- changes to telemetry semantics belong in docs and tests before they become ambient assumptions

## Stable vs Experimental Areas

### Stable

- browser interaction expectations
- BFF communication semantics
- auth and session expectations
- frontend telemetry semantics
- navigation expectations

### Experimental

- realtime synchronization
- advanced offline support
- AI-assisted interactions

### Internal Only

- component structure
- frontend implementation details
- internal state management
- local tooling workarounds
- transient mock or bootstrap helpers

## Campaign / Findings Interaction

For cross-repository findings, follow `docs/operating/cross_repo_findings_guidance.md`.

- create the finding in this repository
- escalate multi-repository impact to management
- do not implement fixes owned by another repository

If a change affects more than one repository, look for the current campaign in `/home/henrique/repos/bitbucket/solareclipseglasses/management/campaigns/<campaign-name>/`.

Treat campaign handoffs as coordination only. Keep durable repository-specific knowledge in this repository.

## Ownership Expectations

- document structural deviations in `decisions.md`
- keep contract changes paired with tests and semantic updates
- keep slice-level changes narrow and explicit
- preserve the boundary between exported behavior and internal implementation

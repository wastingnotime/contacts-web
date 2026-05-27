# Pack: polyglot_client_server

## Purpose

Use this pack when one bounded model spans more than one runtime, such as a browser client and an API service, a client plus an optional Backend for Frontend, or peer runtimes that must coordinate through explicit contracts.

This is the pack to prefer when semantics are shared but execution is intentionally split across technologies or deployable surfaces.

## Scope

This pack defines reusable implementation defaults.
It does not define MRL core behavior or project-specific domain behavior.

The pack does not require a BFF. When a BFF is useful, it is a delivery adapter and may be implemented in any language that fits the repository's constraints.

---

## Shape

- language: multiple, or one language split across multiple runtimes
- runtime topology: client/server, client/BFF/backend, or peer runtimes
- architecture mode: explicit contracts across runtime boundaries

---

## Good Fit

- browser client plus backend API
- browser client plus optional BFF plus backend API
- mobile client plus API gateway or service
- game logic split across client prediction and server authority
- shared event, protocol, or message contracts across runtimes
- repositories that produce more than one deployable artifact from one model boundary

---

## Less Suitable

- single-runtime services where `python_ddd_monolith` or another single-runtime pack is clearer
- repositories where client and server have unrelated semantic models
- libraries that do not own executable runtime boundaries
- systems where distributed boundaries are accidental rather than intentional

---

## Layout

Use the concrete language and framework folders that fit the repository, but keep runtime boundaries visible.

General shape:

```text
apps/
  client/
  server/
  bff/                  # optional

packages/
  shared/
  contracts/

tests/
  client/
  server/
  bff/                  # optional
  contracts/
  integration/
```

Alternative simple shape:

```text
src/
  client/
  server/
  shared_contracts/

tests/
  client/
  server/
  contracts/
  integration/
```

Choose one shape intentionally and record meaningful deviations in `decisions.md`.

---

## Boundaries

- semantic truth lives in `docs/semantics/`
- runtime-specific behavior lives under that runtime's app or source folder
- shared transport shapes live in `packages/shared/`, `packages/contracts/`, `src/shared_contracts/`, or an equivalent explicit contract location
- client code owns presentation, interaction state, client-side validation for usability, and user-visible feedback
- server code owns the server-side behavior selected for that runtime
- an optional BFF owns channel-specific delivery adaptation, request aggregation, session/auth translation, and UI-oriented response shaping
- backend domain truth stays with the domain-owning backend, not with a browser client or BFF adapter

A BFF should not become a hidden domain owner. If business rules move into the BFF, refine the architecture and record the decision explicitly.

---

## Testing Defaults

- client tests: user workflows, rendering states, client-side validation, loading/pending/error states, and local interaction behavior
- server or BFF tests: adapter behavior, request shaping, auth/session translation, error mapping, and runtime configuration
- contract tests: transport mapping, payload compatibility, status/error classification, and shared fixtures
- integration tests: cross-runtime flow through the intended local or packaged boundary
- determinism rules: keep time, IDs, external responses, mock state, seeded data, and event order deterministic

Each runtime should have a direct test command. The repository should also expose one aggregate test command when practical.

---

## Scenario Runner Shape

- preferred runner location: repository-specific, but named by runtime or scenario intent
- preferred command: repository-specific aggregate command such as `npm test`, `go test ./...`, `make test`, or a documented script
- runner responsibility: produce deterministic evidence for the runtime boundaries affected by the slice
- runner must not: hide which runtime, contract, or mock surface is being exercised

For browser-heavy systems, scenario evidence may include component previews, local app modes, screenshots, logs, or interaction-assisted review. Use `docs/evaluation/validation_modes.md` to decide whether a slice is headless-first, interaction-assisted, or interaction-dependent.

---

## Runtime Targeting Rules

- slices using this pack should declare runtime targets explicitly, for example:
  - `browser client`
  - `backend API`
  - `BFF` when present and affected
  - `shared contracts`
  - `static client artifact`
  - `service container image`
- slice documents should say whether each runtime is changed, consumed, mocked, or only validated
- cross-runtime contracts should be named in the slice and tested at the mapping boundary
- message, event, and protocol boundaries should be expressed as artifacts or code-level contracts, not as hidden conventions

Do not describe a multi-runtime slice as a generic "frontend change" when the contract, BFF, backend, or packaging boundary is also affected.

---

## Local Mode Defaults

Multi-runtime repositories often need more than one local execution surface. Keep those modes explicit.

Common modes:

- isolated mode: client or runtime uses deterministic local mocks and does not contact external services
- integrated-local mode: runtimes talk to local services or seeded local data
- live mode: runtime talks to the configured external or shared environment
- preview mode: component, page, or workflow inspection without running the full product path

Rules:

- isolated mode must not replace contract validation
- integrated-local mode should be deterministic and clearly named
- preview mode is an inspection surface, not a production runtime
- local modes should not silently change semantic truth

---

## Contract Rules

- browser or client code should depend on explicit client-facing contracts, not leaked backend persistence shapes
- request and response mapping should be tested close to the transport boundary
- shared fixtures should be kept aligned with the real contract
- compatibility-impacting contract changes should be reviewed during `release`
- exposed API, event, or telemetry contracts should follow repository decisions for exposed contracts when adopted

When a backend is external to the repository, this pack treats that backend as a contract dependency. The repository may adapt to it, mock it, and validate against it, but should not silently redefine its domain behavior.

---

## Packaging Defaults

- a client runtime may package as static assets, a static container image, a mobile artifact, or another repository-selected form
- a server or BFF runtime may package as a service binary, container image, serverless artifact, or another repository-selected form
- repositories may produce multiple artifacts from one release state
- packaging should preserve the same contract assumptions used during local and integration validation

Publication targets, registries, repository dispatch events, infrastructure pull requests, and deployment topology are lifecycle concerns. Record them in expose extensions, change artifacts, or `decisions.md`, not in this pack.

---

## Naming Conventions

- runtime folders: use concrete runtime names such as `client`, `spa`, `server`, `api`, `bff`, or product-specific names when clearer
- shared contracts: use names such as `contracts`, `shared`, or `shared_contracts`
- client workflows: name by user intention or page workflow, not just component type
- adapters/gateways: name by external boundary, such as `ContactsBackendGateway` or `PaymentsApiClient`
- events/messages: use fact-shaped or protocol-specific names that match the exposed contract

---

## Rules

- keep semantic truth shared in `docs/semantics/`
- make protocol, message, API, and event contracts explicit
- let slices declare all runtime targets in scope
- keep optional BFFs language-agnostic and delivery-focused
- do not hide distributed boundaries behind a fake single-process abstraction
- keep mock, preview, integrated-local, and live modes visibly separate
- record meaningful pack deviations in `decisions.md`

---

## Starter Tooling

- package managers: selected per runtime, such as npm, pnpm, Go modules, pip, Cargo, or others
- formatter/linter: selected per runtime
- test frameworks: selected per runtime with an aggregate command when practical
- persistence default: runtime-specific and local-safe unless the slice requires external integration
- packaged runtime default: one artifact per deployable runtime when `release` or lifecycle exposure requires packaging

---

## Notes

When using this pack, also check `docs/evaluation/validation_modes.md`.
Many client/server repositories are not only split by runtime but also by validation surface, and some slices need interaction-assisted or interaction-dependent inspection to detect expectation gaps well.

This pack is a reusable default, not a law. If a repository diverges meaningfully, record that in `decisions.md`.

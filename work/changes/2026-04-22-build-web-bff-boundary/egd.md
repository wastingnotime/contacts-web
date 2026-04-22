# EGD

## Reviewed Slice

`docs/slices/solid_contacts_web_bff_boundary.md`

## Evidence Reviewed

- `npm test`
- `npm run build`
- `tests/bff/contactsWebBffServer.test.ts`
- `tests/bff/contactsWebBff.test.ts`
- `tests/bff/httpContactsBackendGateway.test.ts`
- `tests/client/app.test.jsx`
- `tests/client/isolatedMode.test.jsx`
- `apps/bff/src/server.ts`
- `apps/bff/src/contactsWebBff.ts`
- `apps/bff/src/httpContactsBackendGateway.ts`
- `src/client/api/httpContactsApiClient.js`
- `src/client/mock/contactsMockTransport.js`
- `work/changes/2026-04-22-build-web-bff-boundary/implementation.md`
- `docs/semantics/model_hypothesis.md`
- `docs/semantics/domain_background_knowledge.md`

## Summary

The implemented slice matches the intended browser -> BFF -> backend boundary and the deterministic tests support that the SPA now talks to the BFF endpoint instead of the backend directly.

The strongest expectation gap is not in CRUD behavior, but in boundary semantics:

- the BFF is present as a server process, but auth/session handling is still config-backed rather than a real browser identity or session flow
- the new server coverage proves list/create routing and invalid-create rejection, but not the edit/delete server path directly
- the browser-facing mock transport and isolated-mode flow remain intentionally independent of the backend contract, which is good for UI iteration but still a separate semantic surface from the real BFF/server path

## Findings

### 1. Auth/session handling is explicit in architecture, but only simulated in implementation

The slice says the BFF owns auth/session plumbing, and the domain background notes that auth is claims-based in the current backend runtime. The implementation hardcodes default backend claims in BFF config and does not yet derive them from a browser session or request identity.

This is not a correctness bug for the current slice because login UX was intentionally excluded. It is, however, a clear expectation gap if the architecture note is read literally: the BFF currently forwards a fixed admin context rather than a true per-request session boundary.

Review question:
- should the next slice make claim injection a first-class BFF concern, or should the architecture text be narrowed to say “claims configuration” until login/session work exists?

### 2. The built scenario is broader than the explicit server test evidence

The slice now covers list, create, edit, and delete through the BFF, but the dedicated BFF server test only proves list/create and invalid-create validation. Edit/delete behavior is covered more indirectly by the browser tests and BFF facade tests, not by a full server-path scenario.

This is not a functional gap in the shipped behavior, but it leaves a small evidence gap for the server process itself.

Review question:
- should the next step add a single end-to-end server-path test for edit and delete, or is the current split evidence sufficient for this iteration?

### 3. Isolated-mode mocks and real BFF transport are now intentionally divergent surfaces

The isolated mock transport works well and the isolated-mode test passes, but it is a deliberate browser-facing simulation rather than the actual BFF/server contract. That is acceptable, but it means the repository now has two valid contact delivery surfaces:

- the browser-facing mock contract for isolated mode
- the real `/api` BFF contract for the live/local stack

This is expected, but it should stay explicit so future changes do not let the mock drift into a hidden source of truth.

Review question:
- should the mock transport be kept strictly minimal and browser-oriented, or should it be aligned more closely with the BFF contract to reduce drift?

## Recommendation

Continue, but keep the next loop focused on the explicit BFF boundary rather than adding more UI scope.

Most likely next refinement targets:

- make claims/session handling a clearer BFF contract decision
- add direct server-path coverage for edit/delete if the project wants stronger evidence on the actual BFF runtime
- keep isolated-mode transport deliberately separate and documented as a browser iteration surface


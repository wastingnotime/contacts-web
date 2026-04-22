# Release Decision

## Reviewed Slice

`docs/slices/solid_contacts_web_bff_boundary.md`

## Decision

Accept the current web BFF boundary as the intended internal version for `contacts-web`.

## Basis

- `npm test` passed
- `npm run build` passed
- the implemented browser -> BFF -> backend shape matches the slice definition
- the BFF is present as an actual server process rather than only as an architectural hypothesis
- the SPA remains JavaScript while the BFF owns the contract translation boundary in TypeScript

## Evidence Reviewed

- `work/changes/2026-04-22-build-web-bff-boundary/implementation.md`
- `work/changes/2026-04-22-build-web-bff-boundary/egd.md`
- `tests/bff/contactsWebBffServer.test.ts`
- `tests/bff/contactsWebBff.test.ts`
- `tests/bff/httpContactsBackendGateway.test.ts`
- `tests/client/app.test.jsx`
- `tests/client/isolatedMode.test.jsx`

## Accepted Shape

- SPA requests route through `/api`
- the BFF owns browser-facing request aggregation and backend translation
- CRUD flows remain coherent through the BFF boundary
- claims handling remains explicit and config-backed until real auth/session material exists

## Follow-Up Pressure

- the current claims boundary is explicit but still config-backed rather than session-derived
- direct server-path evidence is strongest for the overall CRUD boundary, while auth/session handling remains a future slice
- isolated-mode transport remains a separate browser inspection surface and should stay documented that way

## Conclusion

The current implementation is acceptable as the repository’s internal released BFF state.
Future slices can refine claims/session handling and any remaining server-path evidence without reopening the boundary decision itself.

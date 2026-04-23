# EGD

## Reviewed Slice

`docs/slices/contacts_web_production_delivery_boundary.md`

## Evidence Reviewed

- `npm test`
- `npm run build`
- `docker build -f Dockerfile .`
- `docker build -f apps/bff/Dockerfile .`
- `docker run` smoke test against `http://127.0.0.1:4011/api/healthz`
- `docker run` smoke test against the SPA container root path
- `apps/bff/Dockerfile`
- `Dockerfile`
- `apps/bff/src/config.ts`
- `apps/bff/src/server.ts`
- `tests/bff/config.test.ts`
- `tests/contracts/productionDelivery.test.js`
- `work/changes/2026-04-23-build-production-delivery/implementation.md`
- `architecture.md`
- `docs/semantics/model_hypothesis.md`
- `docs/semantics/domain_background_knowledge.md`

## Summary

The production delivery boundary is implemented and the evidence supports the core expectation:

- the SPA is still published as a static container artifact
- the BFF is now published as a separate container artifact
- the BFF container binds on the production port expected by Traefik ingress
- the browser-facing `/api` path remains the shared contract shape

The strongest remaining questions are about production-hardening evidence, not about the existence of the boundary itself.

## Findings

### 1. Swarm compatibility is supported by shape, but not exercised in an actual Swarm deployment

The slice and decision say the BFF image must be Swarm-compatible, and the new `apps/bff/Dockerfile` plus the `0.0.0.0:4010` bind make that plausible. The container smoke test confirmed the image serves `/api/healthz` when published on the expected internal port.

What is still missing is direct evidence from a Swarm runtime or Traefik ingress path. The current evidence validates container behavior, not orchestration behavior.

Review question:
- is the current evidence sufficient for “Swarm-compatible” in this repo, or should the next slice prove the image in a stack-level deploy artifact?

### 2. The production image boundary is now real, but publication mechanics are still implicit

The repository now builds both images successfully, but there is still no explicit publishing artifact or release script that says how those images get tagged, pushed, or consumed by the infra repo.

That is not a correctness bug for the current slice. It is a gap if the expectation is that “production delivery ready” includes a documented publication path, not just a buildable image.

Review question:
- should the next refinement add a minimal publish contract, or is the repository intentionally stopping at image buildability for now?

### 3. The BFF image is production-shaped, but not yet production-hardened

The BFF container currently runs from the repo source tree with `tsx` at startup. That is fine for an implementation slice and it passed the smoke test, but it is still closer to a development-friendly container than a tightly hardened production image.

This does not invalidate the slice. It does mean the current artifact boundary should be read as “deployable container image” rather than “fully hardened runtime package.”

Review question:
- should the next production slice focus on hardening the BFF image, or is the current artifact shape enough for the infra handoff?

## Recommendation

Continue.

The production delivery boundary is valid enough to keep moving. The next refinement target should be one of:

- explicit publication mechanics for the SPA and BFF images
- stronger stack-level evidence for Swarm/Traefik compatibility
- container hardening if production-readiness criteria require it


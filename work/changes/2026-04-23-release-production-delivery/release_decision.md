# Release Decision

## Reviewed Slices

- `docs/slices/contacts_web_production_delivery_boundary.md`
- `docs/slices/contacts_web_production_image_publication.md`

## Decision

Accept the current production delivery and publication state as the intended internal release for `contacts-web`.

## Basis

- `npm test` passed
- `npm run build` passed
- `npm run publish:images` passed and wrote the checked-in manifest at `work/publications/contacts_web_image_publication.json`
- `docker build -f Dockerfile .` passed
- `docker build -f apps/bff/Dockerfile .` passed
- the SPA and BFF are both present as separate container artifacts
- the BFF container binds on the production port expected by Traefik ingress
- the publication manifest is a concrete downstream handoff artifact rather than a transient script output

## Evidence Reviewed

- `work/changes/2026-04-23-build-production-delivery/implementation.md`
- `work/changes/2026-04-23-build-production-delivery/egd.md`
- `work/changes/2026-04-23-build-production-image-publication/implementation.md`
- `work/changes/2026-04-23-build-production-image-publication/egd.md`
- `tests/contracts/productionDelivery.test.js`
- `tests/contracts/productionImagePublication.test.js`
- `tests/contracts/productionImagePublicationWriter.test.js`
- `tests/bff/config.test.ts`
- `apps/bff/src/server.ts`
- `apps/bff/Dockerfile`
- `work/publications/contacts_web_image_publication.json`

## Accepted Shape

- the SPA remains a static container artifact
- the BFF remains a separate Swarm-compatible container artifact
- the browser keeps relative `/api` routing
- the publication manifest is checked in under `work/publications/contacts_web_image_publication.json`
- downstream infra can consume the manifest later without re-deriving image coordinates

## Follow-Up Pressure

- the publication manifest uses tagged image coordinates rather than digests
- `../infra-platform` is still not deploying this service yet
- the repo may later need a versioned schema or digest-pinned publication contract if downstream infra requires stronger immutability

## Conclusion

The production delivery boundary and image publication contract are acceptable as the repository’s internal released state.
The remaining work belongs in later refinement or handoff slices rather than reopening the release decision.

# EGD

## Reviewed Slices

- `docs/slices/contacts_web_production_delivery_boundary.md`
- `docs/slices/contacts_web_production_image_publication.md`

## Evidence Reviewed

- `npm test`
- `npm run build`
- `npm run publish:images`
- `docs/slices/contacts_web_production_delivery_boundary.md`
- `docs/slices/contacts_web_production_image_publication.md`
- `work/publications/contacts_web_image_publication.json`
- `src/shared/production/contactsWebImagePublication.js`
- `src/shared/production/publishContactsWebImagePublication.js`
- `tests/contracts/productionDelivery.test.js`
- `tests/contracts/productionImagePublication.test.js`
- `tests/contracts/productionImagePublicationWriter.test.js`
- `work/changes/2026-04-23-build-production-image-publication/implementation.md`
- `architecture.md`
- `docs/semantics/model_hypothesis.md`
- `docs/semantics/domain_background_knowledge.md`

## Summary

The production delivery and publication slices now match the implemented behavior:

- the SPA and BFF are both publishable container artifacts
- the BFF binds on the production port expected by Traefik ingress
- the repository emits a checked-in publication manifest at `work/publications/contacts_web_image_publication.json`
- the publication manifest contains distinct SPA and BFF image references
- the `publish:images` script is repeatable and produces the same manifest content that is checked in

The remaining gaps are about handoff semantics, not missing behavior.

## Findings

### 1. The handoff is explicit, but the manifest still uses tagged image coordinates rather than digests

The repository now has a real publication artifact, and that is the important step. However, the manifest records logical image coordinates such as `contacts-web/spa:0.1.0` and `contacts-web/bff:0.1.0`, not immutable digests.

That means downstream infra can consume the handoff, but it cannot yet distinguish "same tag, different image content" without an additional publication convention.

Review question:
- should the next publication refinement add digest-pinned references, or are tags sufficient for this handoff stage?

### 2. The repo now defines publication well, but not the infra consumer contract in executable form

`../infra-platform` is explicitly out of scope here, which is appropriate. Still, the current evidence only proves the publication artifact exists and is repeatable. It does not prove a downstream consumer is reading it or that a particular schema is required by the infra repo.

This is not a defect in the slice. It is a boundary question:

- is the publication manifest intended to be the final contract, or only an intermediate contract before infra-specific wrapping?

### 3. The production delivery boundary and the publication boundary now overlap cleanly

The delivery slice now points to the manifest as the handoff artifact, and the publication slice makes that manifest concrete. That is coherent and it reduces the risk of the repo drifting back to an informal "we have images somewhere" story.

No major gap was found in that alignment.

## Recommendation

Continue.

The implementation is complete enough to preserve. The next refinement pressure is likely one of:

- digest-pinned publication references
- an infra-facing schema version on the manifest
- a downstream consumer note in `../infra-platform` when that repository is ready


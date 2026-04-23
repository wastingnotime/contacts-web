# Exposure Plan

## Released State

The production delivery and publication state was accepted in `work/changes/2026-04-23-release-production-delivery/release_decision.md`.

That released state includes:

- a static SPA container artifact
- a Swarm-compatible BFF container artifact that binds on the production port expected by Traefik ingress
- a checked-in publication manifest at `work/publications/contacts_web_image_publication.json`
- repeatable publication output from `npm run publish:images`

## Exposure Target

Expose the released production state by making the container artifacts and publication manifest available as the handoff boundary for `../infra-platform`.

Concrete exposure context:

- build the SPA image with `docker build -f Dockerfile .`
- build the BFF image with `docker build -f apps/bff/Dockerfile .`
- publish the image manifest with `npm run publish:images`
- treat `work/publications/contacts_web_image_publication.json` as the concrete downstream handoff artifact
- use `../infra-platform` as the eventual consumer of the published image references, without treating this repository as the deployment owner

This exposure target puts the released internal production state in contact with the downstream handoff context, not with long-term operations ownership.

## Expected Real-World Contact

- downstream infra readers consuming the checked-in publication manifest
- deployment wiring in `../infra-platform` once that repository is ready to consume the manifest
- container runtime behavior from the released SPA and BFF images
- the BFF ingress expectation on the production port
- the browser-facing `/api` routing assumption carried into production artifact delivery

## Feedback Channels

Expected feedback should come from:

- whether `../infra-platform` can consume the checked-in manifest without re-deriving image coordinates
- whether the SPA and BFF image builds stay reproducible
- whether the BFF image continues to bind on the expected production port
- whether the publication manifest remains the stable handoff artifact
- whether future registry or schema requirements force a new publication slice

## Exposure Notes

- no deployment automation is added here
- no code changes are part of this step
- this exposure only records how the released production state should be brought into contact with the downstream infra handoff context

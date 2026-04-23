# Implementation

## Slice Implemented

`docs/slices/contacts_web_production_delivery_boundary.md`

## What Changed

- Added a dedicated BFF container image at `apps/bff/Dockerfile`
- Kept the existing root `Dockerfile` as the static SPA container image
- Changed the BFF server to bind on `0.0.0.0` by default so the container can accept ingress traffic
- Added a host configuration seam in `apps/bff/src/config.ts`
- Added deterministic production artifact tests in `tests/contracts/productionDelivery.test.js`
- Extended BFF config coverage in `tests/bff/config.test.ts`

## Notes On Boundary Shape

- The SPA and BFF now have separate container entry points
- The BFF image binds on the production port expected by Traefik ingress
- The browser-facing `/api` path remains the shared contract shape

## Validation

- `npm test`
- `npm run build`

Both commands should be run after the artifact changes are in place.

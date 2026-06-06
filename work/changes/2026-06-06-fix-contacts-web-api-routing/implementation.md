# Implementation

## Slice Implemented

`docs/slices/contacts_web_production_delivery_boundary.md`

## What Changed

- added an nginx `/api/` proxy rule in the static SPA origin so browser requests reach the BFF
- proxied `/api/*` to the Swarm service DNS name `contacts-web-bff`
- preserved the existing static asset and health-check behavior in the SPA container
- kept the browser-facing `/api` contract unchanged
- added a production delivery test that asserts the proxy boundary is present in `nginx.conf`
- recorded the production routing correction in `decisions.md`

## Notes On Boundary Shape

- the SPA origin remains the public entrypoint for browser traffic
- `/api/*` now forwards to the stack-scoped `contacts-web-bff` service in production
- the SPA and BFF remain separate artifacts

## Validation

- `npm test`
- `npm run build`

# Run Summary

## Slice

`docs/slices/contacts_web_production_delivery_boundary.md`

## Commands

- `npm test`
- `npm run build`
- `docker build -f Dockerfile .`
- `docker build -f apps/bff/Dockerfile .`
- `docker run -d --rm --name contacts-web-bff-test -p 4011:4010 contacts-web-bff-test`
- `curl -fsS http://127.0.0.1:4011/api/healthz`
- `docker run -d --rm --name contacts-web-spa-test -p 4012:80 contacts-web-spa-test`
- `curl -fsSI http://127.0.0.1:4012/`

## Observed Results

- application tests passed
- build passed
- both images built successfully
- BFF health endpoint returned `{"status":"ok"}`
- SPA container returned HTTP 200 on `/`

## Notes

- host port `4010` was already occupied in the workspace, so the BFF smoke test used host port `4011`
- the smoke tests validated container behavior, not a live Swarm ingress path

# Backend Claims Injection Implementation

Implemented the claims-config boundary for the BFF.

## Scope

- kept backend request claims explicit and configurable in `apps/bff/src/config.ts`
- preserved the request-claims headers through the BFF backend gateway
- kept the Solid SPA out of claim management and login UX
- added a direct config test for the BFF environment-backed base URL, subject, roles, and port values

## Validation

- `npm test`
- `npm run build`


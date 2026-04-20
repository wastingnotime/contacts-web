# Implementation

## What Changed

- changed the browser-facing default contacts API base URL from the loopback host to the same-origin `/api` path
- kept the frontend overrideable with `VITE_CONTACTS_API_BASE_URL` for local development and alternate runtimes
- aligned the Docker build default with the browser-safe API base so the released image ships the right contract

## Validation

- added a deterministic config test covering the default and explicit override behavior

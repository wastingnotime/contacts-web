# Implementation: Migrate Web BFF To Go

## Summary

Migrated the `apps/bff` runtime from Node.js plus TypeScript to Go while preserving the existing `/api` contract between the browser and the backend.

## What Changed

- Added a Go module under `apps/bff/`
- Implemented the BFF server, backend gateway, telemetry relay, and contract mappers in Go
- Replaced the BFF Dockerfile with a Go build-and-run image
- Updated the npm scripts so `dev:bff` and `test` invoke the Go runtime
- Added Go tests for config, transport mapping, backend gateway behavior, and HTTP boundary behavior
- Removed the old TypeScript BFF source and tests
- Updated the repo docs and slice docs to describe the Go BFF runtime

## Validation

- `go test ./apps/bff/...`
- `npm test`

Both passed after the migration.

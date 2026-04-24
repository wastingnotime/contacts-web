# Implementation: Browser Telemetry Relay Through The BFF

## Summary

The browser-facing `/api/telemetry` route in the BFF now acts as a relay instead of a terminal sink.

## Changes

- added a BFF-side telemetry collector client that forwards browser telemetry to the shared collector boundary
- made the collector base URL configurable through `CONTACTS_TELEMETRY_COLLECTOR_BASE_URL`
- kept browser telemetry acceptance at `202` so telemetry remains best-effort from the browser's point of view
- added a BFF test that asserts a browser telemetry event reaches the collector endpoint
- added a test harness handler for the default collector URL to keep the suite quiet when no external collector is running

## Validation

- `npx vitest run tests/bff/config.test.ts tests/bff/contactsWebBffServer.test.ts tests/bff/httpContactsBackendGateway.test.ts tests/contracts/httpContactsApiClient.test.js tests/contracts/createContactsApiClient.test.js`

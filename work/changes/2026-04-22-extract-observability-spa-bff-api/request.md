# Request

## Requested Change

Extract the observability strategy for the SPA + BFF + API stack into repository artifacts.

## Why This Exists

The observability strategy introduces a new system-wide pressure: the browser, the web BFF, and the backend should participate in one correlated telemetry story rather than three disconnected ones.

## Scope

- preserve the observability strategy as explicit source evidence
- capture the telemetry pressure in semantic artifacts
- keep the extraction focused on traces, metrics, logs, and propagation boundaries
- do not design implementation details yet

## Expected Output

- updated semantic docs
- explicit source traceability in `work/sources/`
- optional request/impact artifacts for a future observability slice

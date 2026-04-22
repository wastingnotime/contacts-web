# Impact Analysis

## Scope Of Impact

The observability pressure affects the repository at the delivery boundary level rather than the product feature level.

It touches:

- SPA request and interaction instrumentation
- BFF orchestration and dependency instrumentation
- API request and backend instrumentation
- telemetry ingestion and export paths
- shared metadata conventions for cross-layer analysis
- future scenario evaluation and living artifacts if telemetry reveals drift

## Areas Affected

### SPA

The browser layer needs to emit signals that are useful for user-experience analysis without exposing direct observability credentials.

### BFF

The BFF needs to remain visible as an orchestration layer so request aggregation and dependency behavior can be explained in traces and metrics.

### API

The backend needs to preserve its own business and resource telemetry without absorbing browser-specific concerns.

### Telemetry Pipeline

The repository needs an explicit collector-oriented path for browser telemetry, plus export paths from the BFF and API.

## Tensions To Keep Explicit

- browser telemetry should not go directly to the final observability backend
- traces, metrics, and logs should stay distinct
- shared metadata must be consistent enough to join across layers
- observability should help explain the existing SPA/BFF/API split rather than replacing it

## Non-Goals

- no product code changes
- no auth/session implementation
- no alerting policy
- no dashboard design
- no backend domain redesign

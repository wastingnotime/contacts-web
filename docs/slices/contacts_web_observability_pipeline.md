# Slice: Contacts Web Observability Pipeline

## Purpose

Define the minimum observability boundary for `contacts-web` so the SPA, BFF, and API can participate in one correlated telemetry story.

This slice does not change product behavior. It establishes the telemetry contract needed to understand a single user journey across the browser, the BFF, and the backend without treating each layer as an isolated observability island.

## Selected Pack

- `polyglot_client_server`

## Runtime Targets

- Solid browser SPA runtime
- Node.js plus TypeScript web BFF runtime
- external `contacts-v2` API
- controlled browser telemetry ingress through the BFF
- backend export path that can later feed a collector or observability backend

Early-phase rule:

- `build` should make one browser journey produce one correlated trace across SPA, BFF, and API
- `build` should keep browser telemetry off direct token-bearing destinations
- `build` should align telemetry signals with the delivery boundary already established for the BFF
- `build` should not invent product behavior or backend domain rules

## Architecture Mode

- browser/SPA/TypeScript-BFF/backend split with shared telemetry context
- controlled telemetry ingestion through the BFF boundary
- explicit separation of traces, metrics, and logs

Interpretation:

- the SPA should emit user-experience signals
- the BFF should emit orchestration signals
- the API should emit business and resource signals
- all three layers should participate in one telemetry story rather than three unrelated ones

## Discovery Scope

Included in this slice:

- define a telemetry boundary that spans SPA, BFF, and API
- preserve trace context propagation across the request path
- define shared telemetry metadata such as service name, environment, version, feature, and journey
- establish a controlled browser telemetry ingress path through the BFF instead of sending it directly to the observability backend
- keep traces, metrics, and logs distinct in the model

Contract map for this slice:

- SPA telemetry should capture the initial page view, route changes, client errors, and API calls to the BFF
- BFF telemetry should capture incoming requests, backend calls, aggregation behavior, retries, and failures
- API telemetry should capture request lifecycle, DB or domain operations, and backend errors
- telemetry from all layers should be attributable to the same journey when the user action is the same

Excluded from this slice:

- product feature changes
- backend domain redesign
- auth/session implementation
- alerting policy
- dashboards or alert thresholds
- vendor-specific instrumentation details beyond the chosen collector-based direction

## Why This Slice Next

The repository already has an explicit SPA/BFF/backend boundary.

Observability introduces a parallel boundary pressure:

- a single user action should be understandable end to end
- browser telemetry must not bypass controlled ingestion
- the BFF should be visible as an orchestration layer, not hidden inside generic logs
- the API should remain observable without forcing the SPA to know backend internals

Starting with a full telemetry platform rollout would be too broad.
Starting without a bounded observability slice would leave the new telemetry pressure implicit.

## Use-Case Contract

### Use Case: `PropagateTraceContextAcrossContactsJourney`

Input:

- a browser action that triggers a contacts workflow

Success result:

- one distributed trace spans the SPA, BFF, and API path
- downstream requests continue the upstream trace context
- a single journey identifier can be attached to the telemetry record

Failure conditions:

- trace context is dropped between layers
- browser telemetry cannot be correlated with BFF or API telemetry
- telemetry arrives without shared metadata sufficient for later analysis

### Use Case: `RecordLayerSpecificTelemetryForContactsJourney`

Input:

- a contacts workflow request at each runtime layer

Success result:

- SPA telemetry records interaction and client-side failure context
- BFF telemetry records orchestration and dependency context
- API telemetry records domain/resource and backend failure context
- traces, metrics, and logs remain distinct but attributable to the same journey

Failure conditions:

- one layer emits only opaque logs without trace correlation
- telemetry is sent directly from the browser to the final backend without a controlled collector path
- shared metadata is inconsistent enough to make cross-layer analysis hard

## Main Business Rules

- telemetry should be end to end across SPA, BFF, and API
- browser telemetry should pass through a controlled ingress path
- traces, metrics, and logs should stay distinct
- shared metadata should make the three runtime layers joinable in analysis
- observability should help explain user journeys and delivery bottlenecks without changing business behavior

## Required Ports

- telemetry context propagation across runtime boundaries
- browser telemetry ingestion endpoint
- BFF telemetry export path
- API telemetry export path
- shared telemetry metadata contract

## Interface Expectations

The observability boundary should make it possible to answer:

- what happened in the browser
- what the BFF did with that request
- what the API did in response
- how the three layers relate to one user journey

## Initial Test Plan

Observability tests should specify:

- trace context survives SPA -> BFF -> API requests
- telemetry carries consistent service and environment metadata across the three layers
- browser telemetry does not require direct exposure of the final observability backend token
- browser startup emits a page-view event through the BFF telemetry path
- SPA navigation emits a route-change event through the same telemetry path
- a single user journey can be reviewed across traces, metrics, and logs

## Scenario Definition

Scenario name:

- `user_journey_is_correlated_across_spa_bff_and_api`

Scenario steps:

1. open the contacts app in the browser
2. trigger a contacts workflow that crosses the SPA, BFF, and API
3. observe one correlated trace across the layers
4. confirm shared telemetry metadata is present
5. confirm browser startup and route-change telemetry use the controlled ingestion path

## Done Criteria

- the repository has an explicit observability boundary in slice form
- the slice distinguishes traces, metrics, and logs
- the slice names the SPA, BFF, and API as one correlated telemetry system
- the slice makes the controlled browser telemetry ingress path explicit
- the slice stays separate from product behavior, auth/session implementation, and backend domain redesign

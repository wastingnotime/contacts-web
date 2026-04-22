# Observability Strategy — SPA + BFF + API (with Axiom + OpenTelemetry)

## Goal

Design observability as a **single end-to-end system**, not three isolated layers.

A single user action (SPA → BFF → API) must produce:
- One distributed trace
- Correlated logs
- Aggregated metrics

## Core Principles

### 1. End-to-End Context Propagation
- Use OpenTelemetry (OTel)
- Propagate `traceparent` across SPA → BFF → API
- Every layer must continue the same trace

### 2. Signals Separation
- **Traces** → causality (what happened)
- **Metrics** → trends (how often / how slow)
- **Logs** → context (why it failed)

### 3. Single Pipeline
All telemetry flows through OpenTelemetry Collector(s), then to Axiom.

## Architecture Overview

```text
Browser (SPA)
  -> telemetry.yourdomain.com (public ingress)
  -> Reverse Proxy
  -> Browser Collector (Gateway)
  -> Internal Collector (optional)
  -> Axiom

BFF (Node.js)
  -> Internal Collector
  -> Axiom

API (Python / Sanic)
  -> Internal Collector
  -> Axiom
```

## Why NOT send SPA telemetry directly to Axiom

- Axiom requires API tokens → would be exposed in browser
- No control over:
  - rate limiting
  - filtering
  - sampling
- Harder to enforce CORS/security

**Conclusion:**
SPA must send telemetry to an endpoint you control.

## Collector Strategy

### Internal Collector (inside Swarm)
Responsibilities:
- Receive OTLP from BFF and API
- Batch and retry
- Add metadata (env, version, service)
- Export to Axiom

Characteristics:
- Private (not internet exposed)
- Runs as a service in Swarm

### Browser Ingest (Edge)

Two options:

#### Option A — Collector Gateway (recommended)
- Public endpoint
- Dedicated Collector instance
- Behind reverse proxy

#### Option B — Reverse proxy → internal Collector
- Simpler
- Still requires protection

Responsibilities:
- Accept browser telemetry
- Enforce limits
- Apply sampling
- Forward internally

## Layer-by-Layer Strategy

## SPA (SolidJS)

### Purpose
Capture **user experience and interaction signals**

### What to Collect

#### Traces
- Page load
- Route change
- API calls (to BFF)

#### Events (custom spans or logs)
- search started
- search completed
- form submitted
- errors

#### Errors
- JS exceptions
- rejected promises

#### Metrics (lightweight)
- API latency (client-side)
- error rate

### What NOT to do
- Do not send high-volume logs
- Do not replicate backend detail
- Do not include sensitive data

### Export

```text
SPA → telemetry.yourdomain.com (OTLP HTTP)
```

## BFF (Node.js)

### Purpose
Capture **composition and orchestration behavior**

### What to Collect

#### Traces
- Incoming request
- Calls to API
- Aggregation logic

#### Metrics
- request rate
- latency (p50 / p95 / p99)
- error rate
- dependency latency

#### Logs
- failures
- timeouts
- retries

### Key Insight

BFF shows:
> “Why this page is slow even if API is fine”

### Export

```text
BFF → Internal Collector (OTLP gRPC/HTTP)
```

## API (Python / Sanic)

### Purpose
Capture **business logic and resource usage**

### What to Collect

#### Traces
- request lifecycle
- DB queries
- external calls

#### Metrics
- request rate
- latency
- error rate
- DB latency

#### Logs
- domain events (important transitions)
- errors

### Export

```text
API → Internal Collector
```

## Shared Attributes (IMPORTANT)

All layers must include:

- service.name
  - contacts-spa
  - contacts-bff
  - contacts-api

- deployment.environment
  - dev / staging / prod

- app.version (commit SHA)

- user journey (custom)
  - journey.name

- feature name
  - feature.name

## Example Journey

User opens contact details:

```text
SPA: click contact
  -> span: "open_contact"

BFF: GET /contact/:id
  -> span: "compose_contact_view"

API: GET /contact/:id
  -> span: "load_contact"
  -> DB span
```

All linked by same trace.

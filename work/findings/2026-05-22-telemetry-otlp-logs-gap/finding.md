# Finding: OTLP Logs Are Exported In The BFF Telemetry Path

## Context

Verified while checking `contacts-web` issue `#16` on 2026-05-22.

The issue requests that BFF logs be exported as OTLP logs through the shared collector instead of being folded into traces or metrics.

## Observed Behavior

The repository now has:

- an observability slice that treats traces, metrics, and logs as distinct
- BFF OTLP trace export wiring
- BFF OTLP log export wiring through the shared collector
- a BFF runtime logger bridged to OpenTelemetry logs
- tests that verify request summaries are exported as log records and reach the OTLP `/v1/logs` endpoint

The BFF observability code now initializes a log exporter and logger provider when `OTEL_EXPORTER_OTLP_ENDPOINT` is set, and the runtime request summaries flow through that logger.

## Expected Behavior

The BFF should expose an explicit OTLP log export or log bridging path through the shared collector, with producer and observed-service identity remaining explicit.

## Impact

The repository now satisfies the three-signal posture described in the issue for the BFF runtime path.

## Suspected Source

The behavior lives in the `contacts-web` BFF observability layer.

## Evidence

- GitHub issue: `https://github.com/wastingnotime/contacts-web/issues/16`
- Observability slice: [docs/slices/contacts_web_observability_pipeline.md](/home/henrique/repos/github/wastingnotime/contacts-web/docs/slices/contacts_web_observability_pipeline.md)
- Model hypothesis gap note: [docs/semantics/model_hypothesis.md](/home/henrique/repos/github/wastingnotime/contacts-web/docs/semantics/model_hypothesis.md)
- BFF observability wiring: [apps/bff/internal/bff/observability.go](/home/henrique/repos/github/wastingnotime/contacts-web/apps/bff/internal/bff/observability.go)
- BFF module dependencies: [apps/bff/go.mod](/home/henrique/repos/github/wastingnotime/contacts-web/apps/bff/go.mod)

## Owning Repository

`wastingnotime/contacts-web`

## Local Impact

The repository can treat issue `#16` as implemented once the code and tests on the BFF path are accepted.

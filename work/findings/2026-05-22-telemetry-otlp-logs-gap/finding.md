# Finding: OTLP Logs Are Still Not Exported In The BFF Telemetry Path

## Context

Verified while checking `contacts-web` issue `#16` on 2026-05-22.

The issue requests that BFF logs be exported as OTLP logs through the shared collector instead of being folded into traces or metrics.

## Observed Behavior

The repository currently has:

- an observability slice that treats traces, metrics, and logs as distinct
- BFF OTLP trace export wiring
- BFF metrics-related OpenTelemetry dependencies and follow-up notes

The repository does not currently show a BFF log exporter or OTLP log pipeline in the BFF observability code.

## Expected Behavior

The BFF should expose an explicit OTLP log export or log bridging path through the shared collector, with producer and observed-service identity remaining explicit.

## Impact

The current observability boundary remains incomplete for the three-signal posture described in the issue.

That leaves the repo without a confirmed implementation for log export as a first-class telemetry signal alongside traces and metrics.

## Suspected Source

The missing behavior appears to be in the `contacts-web` BFF observability layer.

## Evidence

- GitHub issue: `https://github.com/wastingnotime/contacts-web/issues/16`
- Observability slice: [docs/slices/contacts_web_observability_pipeline.md](/home/henrique/repos/github/wastingnotime/contacts-web/docs/slices/contacts_web_observability_pipeline.md)
- Model hypothesis gap note: [docs/semantics/model_hypothesis.md](/home/henrique/repos/github/wastingnotime/contacts-web/docs/semantics/model_hypothesis.md)
- BFF observability wiring: [apps/bff/internal/bff/observability.go](/home/henrique/repos/github/wastingnotime/contacts-web/apps/bff/internal/bff/observability.go)
- BFF module dependencies: [apps/bff/go.mod](/home/henrique/repos/github/wastingnotime/contacts-web/apps/bff/go.mod)

## Owning Repository

`wastingnotime/contacts-web`

## Local Impact

The repository should treat issue `#16` as unresolved until the BFF log export path is implemented and documented.

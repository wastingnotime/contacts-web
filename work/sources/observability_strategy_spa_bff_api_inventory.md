# Observability Strategy Inventory

Source:
- `work/sources/observability_strategy_spa_bff_api.md`

Captured signals:
- SPA, BFF, and API should be treated as one end-to-end observability system
- trace context should propagate through the entire request path
- traces, metrics, and logs have distinct roles
- the browser should not send telemetry directly to Axiom
- a collector-based pipeline is the preferred transport shape
- SPA should emit user-experience signals
- BFF should emit orchestration signals
- API should emit business-logic and resource-usage signals
- shared service metadata should be consistent across layers

Potential model pressure:
- observability may require a dedicated browser-to-BFF-to-API telemetry path in addition to the request path
- the repository may need explicit observability boundaries that align with the SPA/BFF/API split

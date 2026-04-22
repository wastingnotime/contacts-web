# Request

## Requested Change

Refine the extracted observability strategy into one bounded slice for `contacts-web`.

## Why This Exists

The repository now has a new system-wide pressure: the SPA, BFF, and API should participate in one correlated telemetry story. That needs a concrete slice so future implementation work can target the right telemetry boundary without turning observability into an unbounded platform project.

## Scope

- define one observability-focused slice
- keep the slice aligned with the SPA/BFF/API boundary already established in architecture and BFF work
- capture telemetry propagation, shared metadata, and collector-based browser ingestion
- do not write implementation code

## Expected Output

- `docs/slices/contacts_web_observability_pipeline.md`
- optional impact analysis for telemetry boundaries and affected surfaces

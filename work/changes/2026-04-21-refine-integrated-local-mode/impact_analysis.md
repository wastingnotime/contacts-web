# Impact Analysis

## Change Summary

Integrated local mode will be defined as a local multi-service development and validation path for the contacts frontend.

This is a development-mode definition change, not a backend contract change.

## Impacted Areas

- local orchestration and startup commands
- frontend configuration for local service URLs
- seeded local backend data
- developer-facing documentation

## Boundary Pressure

The repository needs to keep three local surfaces separate:

- isolated mode for backend-free UI iteration
- Storybook for preview inspection
- integrated local mode for real local service validation

The new mode should not be treated as a second version of isolated mode, and it should not become a proxy for external production behavior.

## Risks

- the local stack could become too heavyweight for routine development
- seeded data could drift away from the expected contacts flows
- the local mode could accidentally blur into the external backend contract or into isolated mock transport
- the BFF and backend service boundaries should stay visible in the local mode

## Next Build Pressure

The next build slice should add an explicit integrated local startup path with seeded services, local frontend configuration, and deterministic developer validation of the contacts workflows.

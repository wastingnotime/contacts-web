# Request

## Requested Change

Refine the production image publication slice so it explicitly models the emitted publication manifest.

## Why This Exists

The build now emits a JSON manifest with stable SPA and BFF image references.
The slice should capture that concrete artifact so downstream infra does not have to infer the handoff format from the script name alone.

## Scope

- make the publication manifest explicit in the slice
- keep the SPA and BFF image references distinct
- preserve the BFF production-port expectation
- keep `../infra-platform` as the downstream consumer, not the deployment owner

## Expected Output

- refined production image publication slice
- updated semantic context for the publication manifest

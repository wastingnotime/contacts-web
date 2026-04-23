# Request

## Requested Change

Refine the production image publication slice so it explicitly names the checked-in manifest artifact.

## Why This Exists

The build now writes `work/publications/contacts_web_image_publication.json` as the durable handoff artifact.
The slice should name that file directly so the infra handoff is obvious to future readers.

## Scope

- keep the SPA and BFF image references distinct
- keep the checked-in publication manifest explicit
- preserve the BFF production-port expectation
- keep `../infra-platform` as the downstream consumer, not the deployment owner

## Expected Output

- refined production image publication slice
- updated impact analysis for the checked-in manifest artifact

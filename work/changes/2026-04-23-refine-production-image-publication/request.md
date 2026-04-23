# Request

## Requested Change

Refine the production delivery boundary into a publication-handoff slice for the SPA and BFF images.

## Why This Exists

`../infra-platform` is the downstream deployment repository, but it does not deploy this service yet.
`contacts-web` still needs an explicit publication contract so the SPA and BFF image references can be handed off later without rediscovering the build shape.

## Scope

- define stable image references for the SPA and BFF
- keep the BFF image requirement explicit
- make the downstream infra handoff explicit
- avoid designing the infra deployment mechanics themselves

## Expected Output

- refined publication-handoff slice
- updated semantic context for image publication

# Request

## Requested Change

Refine the production delivery boundary for `contacts-web` so it reflects the actual infra relationship.

## Why This Exists

`../infra-platform` is the downstream deployment repository, but it does not deploy this service yet.
`contacts-web` still needs to publish the BFF image as a production artifact so that deployment wiring can be added later without rediscovering the packaging boundary.

## Scope

- keep the production packaging requirement explicit
- keep the BFF image requirement explicit
- keep the static SPA image requirement explicit
- make the `../infra-platform` handoff clear without implying a deployed service exists already

## Expected Output

- refined production delivery slice
- updated impact analysis for the infra handoff nuance

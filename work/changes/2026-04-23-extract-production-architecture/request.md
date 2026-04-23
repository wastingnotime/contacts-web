# Request

## Requested Change

Extract the production architecture boundary for `contacts-web` into repository memory.

## Why This Exists

The current repository now needs to be valid for production artifact delivery, not only local development and test-time refinement.
The production note says the infra contract is already in place, but this repo still needs to publish a Swarm-compatible BFF image that binds on the production port for Traefik ingress.

## Scope

- preserve the external production architecture note as source evidence
- update semantic artifacts to include production delivery pressure
- make the BFF image requirement explicit in the repository model
- do not design implementation details yet

## Expected Output

- explicit source evidence copy under `work/sources/`
- updated semantic background for production delivery
- a bounded request artifact for later refinement

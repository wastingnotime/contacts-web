# Implementation

Adjusted the production workflow so the app repository dispatches the candidate to `integration-sandbox` instead of opening a cross-repository pull request.

Changes:

- `.github/workflows/ci-web-docker.yml`
  - added a `dispatch-integration-sandbox` job after the image publication jobs
  - dispatches a `repository_dispatch` event to `wastingnotime/integration-sandbox`
  - includes the commit SHA plus SPA and BFF image URIs in the payload
  - removed the old infra-platform promotion path from the workflow

- `tests/contracts/ciWebDockerWorkflow.test.js`
  - updated the workflow contract to require the integration-sandbox dispatch
  - kept assertions that the infra-platform PR path is absent

- `decisions.md`
  - superseded the infra-platform PR decision
  - recorded the integration-sandbox dispatch as the accepted promotion step

This keeps image publication inside the app repo while moving candidate validation handoff to integration-sandbox.

# Implementation

Removed the app repository's direct infra-platform promotion step from the production image workflow.

Changes:

- `.github/workflows/ci-web-docker.yml`
  - removed the `promote-infrastructure` job
  - removed the `wastingnotime/infra-platform` checkout
  - removed the `gh pr create` step that opened the infra-platform pull request

- `tests/contracts/ciWebDockerWorkflow.test.js`
  - added a contract test to keep the workflow from reintroducing infra-platform PR creation

- `decisions.md`
  - recorded the promotion ownership change as a repository decision

The workflow still builds and pushes the SPA and BFF images. It no longer opens a pull request in the infra-platform repository from this app repo.

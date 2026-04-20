# Implementation

Added a GitHub Actions workflow that:

- builds and pushes the `contacts-web` image to ECR
- tags the image with both `latest` and the commit SHA
- checks out `wastingnotime/infrastructure`
- updates the production swarm stack to pin the new image literal
- removes the obsolete `CONTACTS_WEB_IMAGE` requirement from the deploy helper
- opens a pull request in the infra repository for the promotion change

Workflow file:

- `.github/workflows/ci-web-docker.yml`

Runtime assumptions:

- `secrets.ECR_ROLE_ARN` points at the AWS role used for ECR access
- `secrets.INFRA_REPO_TOKEN` can push branches and create pull requests in `wastingnotime/infrastructure`
- the infra-side ECR trust policy accepts the `wastingnotime/contacts-web` repository subject

Configured repository inputs:

- `vars.AWS_DEFAULT_REGION = us-east-1`
- `vars.ECR_ROLE_NAME = github-actions-ecr`
- `secrets.ECR_ROLE_ARN = arn:aws:iam::590183855481:role/github-actions-ecr`
- `secrets.INFRA_REPO_TOKEN` reused from the current authenticated GitHub CLI token

Not retained:

- `SWARM_INSTANCE_ID` is not needed by the current PR-based promotion workflow

# Finding: Integration Sandbox Promotion Branch Collision

## Context

Discovered while fixing the `contacts-web` `ci-web-docker` dispatch handoff on 2026-05-02.

The `contacts-web` workflow now dispatches `candidate-image-updated` to `wastingnotime/integration-sandbox` with the payload shape expected by the target repository:

- `service`: `contacts-web`
- `image`: `590183855481.dkr.ecr.us-east-1.amazonaws.com/contacts-web`
- `sha`: `65d4fff045def84601c0a76b5e45651d8dca566f`

## Observed Behavior

The downstream `Integration Validation` workflow in `wastingnotime/integration-sandbox` was triggered and its validation job passed, but the promotion job failed while pushing the generated infra-platform branch.

Run:

- `https://github.com/wastingnotime/integration-sandbox/actions/runs/25250727057`

Failing job:

- `Open infra-platform promotion PR`

Relevant log excerpt:

```text
git switch -c "promote-contacts-web-27cc1135107e"
git commit -m "chore: promote contacts-web to 27cc1135107e"
git push -u origin "promote-contacts-web-27cc1135107e"
! [rejected] promote-contacts-web-27cc1135107e -> promote-contacts-web-27cc1135107e (non-fast-forward)
error: failed to push some refs to 'https://github.com/wastingnotime/infra-platform'
```

## Expected Behavior

After a valid `contacts-web` candidate dispatch:

- `integration-sandbox` should run the validation scenario
- if validation passes, it should create or update an infra-platform promotion handoff without failing on an existing remote branch

## Impact

The app repository can now publish images and dispatch the candidate successfully, but the full promotion path still reports failure after validation when the target promotion branch already exists in `wastingnotime/infra-platform`.

## Suspected Source

The issue appears to be owned by `wastingnotime/integration-sandbox` and/or its handoff contract with `wastingnotime/infra-platform`.

The immediate failure is not in `contacts-web`; it occurs after the target repository has accepted the dispatch and passed validation.

## Evidence

Source workflow run:

- `contacts-web` `ci-web-docker`: `https://github.com/wastingnotime/contacts-web/actions/runs/25250706708`
- `dispatch-integration-sandbox`: success

Target workflow run:

- `integration-sandbox` `Integration Validation`: `https://github.com/wastingnotime/integration-sandbox/actions/runs/25250727057`
- validation job: success
- promotion job: failure due non-fast-forward push to existing branch `promote-contacts-web-27cc1135107e`

## Suggested Direction

The owning repository should decide whether repeated promotions should:

- update an existing promotion branch,
- generate a unique branch name per candidate,
- or detect an existing open promotion PR and amend that flow explicitly.

## Owning Repository

`wastingnotime/integration-sandbox`

## Local Impact

No further `contacts-web` code change is required for the original dispatch failure.

`contacts-web` should treat downstream promotion branch collisions as an external handoff finding unless the target dispatch contract changes again.

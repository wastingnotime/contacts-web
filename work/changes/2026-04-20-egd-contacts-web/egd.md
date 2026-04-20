# EGD: contacts-web build review

## Basis

Lightweight artifact-led EGD. No dedicated scenario runner or evidence packet exists in this repository yet, so this review compares the built slices, passing tests, and semantic artifacts directly.

Reviewed artifacts:

- `docs/semantics/model_hypothesis.md`
- `docs/semantics/domain_background_knowledge.md`
- built slice docs under `docs/slices/`
- implementation artifacts under `work/changes/2026-04-20-build-*/implementation.md`
- current tests in `tests/client/app.test.jsx`

## Overall Read

The built behavior matches the current model reasonably well:

- list, create, edit, and delete workflows are present
- transport mapping stays explicit
- backend auth failure states are surfaced distinctly
- delete confirmation and delete pending behavior are deliberate
- list-load retry exists
- the edit route now distinguishes a missing record from generic load failure

The remaining gaps are mostly about clarity and recovery polish rather than missing core workflow support.

## Findings

### 1. List retry has no explicit retry-in-progress feedback

The list error banner now offers a retry action, but the UI does not show a distinct retrying state while the second request is in flight.

Why this matters:

- the domain background expects clear loading and recovery feedback
- a retry action that looks identical before and during the request can feel stalled
- the current behavior is technically correct but semantically thin

Severity: low

Recommendation:

- if this workflow is important for real users, refine/build a small retry-pending state for the list banner

### 2. Edit missing-record state is expressed as a synthesized sentinel, not a surfaced backend branch

The edit page now renders a dedicated stale-route panel when the target contact is missing, which is good for the browser experience.

However, the implementation converts `not_found` into an internal sentinel object instead of surfacing the raw backend result through the UI state path.

Why this matters:

- the semantic model distinguishes missing records from generic failures
- the current implementation preserves UX but slightly obscures the backend signal
- future diagnostics or richer stale-route handling may need a more explicit not-found path

Severity: low

Recommendation:

- keep as-is if the current UX is sufficient
- revisit only if later slices need richer missing-record diagnostics or route recovery rules

### 3. Success flows still rely on immediate navigation without any success acknowledgment

Create and edit still navigate back to the list immediately after a successful submit.

Why this matters:

- the model hypothesis calls out predictable post-submit behavior
- the app is deterministic, but it does not produce any success acknowledgment beyond route change
- this is acceptable for a narrow CRUD surface, but it is still a plausible expectation gap if users need confirmation that their save completed

Severity: low

Recommendation:

- no change required for now unless the product needs a stronger success affordance

## No Major Gaps

I did not find a blocking expectation gap in the current build:

- destructive actions are deliberate
- auth failures are visible
- duplicate and not-found responses are distinct
- pending states are visible for delete and form submissions
- the list failure path is recoverable

## Return To Loop

Recommendation: `release`

Rationale:

- the implemented slices are coherent with the current semantic model
- the remaining gaps are polish-level, not structural omissions
- if you want to continue refining, the best next candidates are a list retry-in-progress state or a stronger post-submit acknowledgment, but neither is blocking


# Request

## Requested Change

Extract a semantic baseline for `contacts-web` using:

- the naming reference at `/home/henrique/repos/bitbucket/solareclipseglasses/management/references/axiom_interface_naming_reference.md`
- the frozen legacy repository at `/home/henrique/repos/github/wastingnotime/contacts`
- the current backend repository at `/home/henrique/repos/github/wastingnotime/contacts-v2`

The repository should be treated as the web interface for the contacts domain, with Solid as the current stack direction.

## Why This Exists

`contacts-web` still contains starter placeholder semantics. Before refinement begins, the repository needs explicit memory for:

- what the web app is responsible for
- which legacy workflows are worth preserving
- how the backend boundary currently looks
- which tensions must remain explicit rather than being silently resolved during implementation

## Scope

- inspect the provided naming reference
- inspect the old combined API/web repository as historical workflow evidence
- inspect the current backend repository as the active API boundary reference
- create explicit source evidence in `work/sources/`
- update `docs/semantics/model_hypothesis.md`
- update `docs/semantics/domain_background_knowledge.md`
- do not write production code
- do not design implementation slices yet

## Expected Output

- updated semantic baseline for `contacts-web`
- source evidence inventory for the extraction
- explicit unresolved tensions to carry into `refine`

## Initial Extraction Boundary

Treat the legacy repository as workflow evidence, not as stack direction.

Treat the naming reference as the current boundary and naming guidance:

- `contacts-web` is an experience-domain interface
- `contacts-web` should use Solid
- control-plane concerns belong to `axiom-*`, not to this repository

Treat `contacts-v2` as the current backend/API reference, while keeping explicit that its admin-oriented modeling may not fully define the intended web experience.

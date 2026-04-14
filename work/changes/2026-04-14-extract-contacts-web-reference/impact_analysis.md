# Impact Analysis

## Purpose

Document the main tensions discovered during `refine` before implementation begins.

## Main Tension

The extracted semantics now define `contacts-web` as a Solid-based browser interface for the contacts experience domain, but the repository still carries starter-era architecture guidance shaped around a Python monolith.

That mismatch creates an immediate build risk:

- if build follows semantics only, repository architecture docs become untrustworthy
- if build follows architecture docs only, the implementation will drift away from the stated repository purpose

There is now a second concrete tension:

- the historical workflow evidence is in the frozen legacy web app
- the active backend reference is `contacts-v2`
- those two sources do not share the same transport naming or error assumptions

There is now a third concrete tension:

- the extracted workflow includes full CRUD
- the repository currently has no implementation at all
- starting with full CRUD would overload the first slice before the client/server seam is stable

There is now a fourth concrete tension:

- `contacts-web` is framed as an experience-domain interface
- `contacts-v2` is currently modeled as a narrow admin-oriented backend
- the intended end-user role of this web surface is still not fully settled

## Interpretation

The first build slice should not try to solve every frontend question.

It should solve the highest-leverage uncertainty first:

- establish the Solid runtime
- make the backend contract adapter explicit
- prove one thin browser workflow end to end

That gives the repository a trustworthy implementation center without pretending that auth, edit, delete, or richer product semantics are already settled.

## Areas Impacted

- `architecture.md`
- `docs/building/project_structure.md`
- frontend code layout under `src/`
- frontend test layout under `tests/`
- backend contract-mapping design
- route and state conventions for later slices

## Recommended Follow-Up

- build the first slice using the `polyglot_client_server` pack rather than the current Python-monolith example
- keep the first executable workflow to list plus create
- isolate `snake_case` to `camelCase` mapping behind a named adapter
- defer edit and delete until the route, state, and transport seams are stable
- update strategic docs only where they directly block the selected slice

## Effect On This Slice

For the next slice, the conflict is manageable if implementation stays bounded to:

- one Solid browser runtime
- one backend gateway for list and create
- one explicit transport mapper
- deterministic route and state tests
- visible failure handling for create and list

That is enough to establish a real repository direction without widening scope prematurely.

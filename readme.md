# Contacts Web

## Overview

`contacts-web` is the browser front-end for the `contacts` app.

It provides the user-facing contact workflows for the current backend boundary, with a focus on:

- browsing the contacts list
- creating a contact
- editing an existing contact
- deleting a contact
- presenting loading, empty, success, and failure states clearly
- translating the browser model into the backend HTTP contract

This repository is intentionally a web experience surface, not the source of truth for contacts data.

---

## What This Repository Is

`contacts-web` is a Solid-based frontend that sits in front of the contacts backend, currently referenced by the local contract at `http://0.0.0.0:8010`.

The app owns:

- route-level UI behavior
- form state and interaction flow
- user-visible validation and error handling
- backend request and response mapping
- presentation decisions for the contacts experience

The app does not own:

- backend persistence
- authoritative contact invariants
- authorization implementation
- deployment of the backend service

---

## Product Scope

The current experience is intentionally narrow and practical:

- show the contacts list
- support a clear empty state
- open a contact form in create mode
- open a contact form in edit mode
- submit create and update requests
- delete a contact from the list
- reflect backend failures without hiding user intent

The current backend contract uses `snake_case` field names, so the frontend keeps an explicit mapping layer rather than leaking transport shape into the UI.

---

## Technical Shape

The repository currently uses:

- Solid for the browser UI
- Vite for the development and build pipeline
- Vitest and Testing Library for executable UI and contract tests

The frontend code is organized around explicit contract and page modules rather than generic component blobs.

---

## Relationship To MRL

MRL is the working method used in this repository, but it is not the main product story.

The MRL loop is still the operational backbone:

```text
extract -> refine -> build -> egd -> release -> expose -> living -> extract
```

Use the workflow docs when you need the process details:

- `docs/operating/mrl_reference.md`
- `docs/operating/skills_workflow.md`

For the current app, the important point is simpler:

- MRL helps the repository evolve slice by slice
- `contacts-web` remains the product-facing browser interface
- product behavior should stay visible in the README before process detail does

---

## Current State

The repository already includes:

- the Solid frontend scaffold under `src/client/`
- browser pages for list, create, and edit flows
- API and contract mapping modules
- test coverage for client behavior and transport mapping
- release and exposure notes under `work/changes/`

The implementation is still early, but it is a real contacts UI rather than a starter template.

---

## Working Locally

Install dependencies and run the app with the package scripts:

```bash
npm install
npm run dev
npm run test
npm run build
```

The local frontend is intended to talk to the contacts backend at `http://0.0.0.0:8010`.

To start the app in isolated mode without a live backend:

```bash
VITE_CONTACTS_UI_MODE=isolated npm run dev
```

---

## Repository Notes

- Keep the README focused on the contacts experience, not on the MRL starter history.
- Record important structural or product decisions in `decisions.md`.
- Preserve semantic and slice artifacts under `docs/` and `work/` as the repository evolves.

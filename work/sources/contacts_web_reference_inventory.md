# Contacts Web Reference Inventory

## Purpose

This file records the source evidence used during the 2026-04-14 `extract` pass for `contacts-web`.

It exists so later phases can trace where the current semantic baseline came from without depending on chat history.

## Source Evidence

### Naming And Interface Direction

1. `/home/henrique/repos/bitbucket/solareclipseglasses/management/references/axiom_interface_naming_reference.md`
   - establishes the split between `axiom-*` control-plane interfaces and `{domain}-*` experience-domain interfaces
   - names `contacts-web` as the web surface for the `contacts` domain
   - recommends Solid as the current technology direction for `contacts-web`

### Legacy Repository

1. `/home/henrique/repos/github/wastingnotime/contacts/README.md`
   - confirms the old repository bundled both API and web
   - confirms the historical web artifact was named `contacts-web`

2. `/home/henrique/repos/github/wastingnotime/contacts/shared/openapi/swagger.yaml`
   - provides the legacy CRUD contract for contacts
   - shows required fields `firstName`, `lastName`, and `phoneNumber`
   - shows create, list, get, update, and delete routes

3. `/home/henrique/repos/github/wastingnotime/contacts/apps/api/handlers.go`
   - confirms server-generated IDs on create
   - confirms not-found handling for get, update, and delete
   - confirms the legacy backend behavior behind the OpenAPI surface

4. `/home/henrique/repos/github/wastingnotime/contacts/apps/web/src/index.js`
   - shows browser route structure for list, create, and edit flows
   - shows the app bootstraps by loading all contacts first

5. `/home/henrique/repos/github/wastingnotime/contacts/apps/web/src/views/ContactList.js`
   - shows empty-state behavior and list-level delete action
   - shows the list route as the main navigation hub

6. `/home/henrique/repos/github/wastingnotime/contacts/apps/web/src/views/ContactForm.js`
   - shows insert versus edit mode
   - shows fetch-on-edit behavior
   - shows immediate redirect to the list route after submit

7. `/home/henrique/repos/github/wastingnotime/contacts/apps/web/package.json`
   - confirms the historical web stack was Mithril, not Solid

### Current Backend Reference

1. `/home/henrique/repos/github/wastingnotime/contacts-v2/docs/semantics/model_hypothesis.md`
   - shows the current backend is a narrow contacts CRUD backend with admin/infrastructure-enabler pressure
   - confirms backend/API-only active scope there

2. `/home/henrique/repos/github/wastingnotime/contacts-v2/docs/semantics/domain_background_knowledge.md`
   - captures expectations and omissions already identified around contact CRUD and admin behavior

3. `/home/henrique/repos/github/wastingnotime/contacts-v2/src/app/interfaces/http/sanic_app.py`
   - shows the current backend contract shape
   - shows `snake_case` payload names
   - shows auth and richer error responses the frontend may need to handle

## Extracted Signals

- `contacts-web` should be modeled as the web experience interface for the contacts domain.
- The legacy workflow shape is narrow CRUD and is still the best concrete user-flow evidence.
- The legacy implementation stack is not the intended direction for this repository.
- The new repository should expect backend contract mapping pressure between legacy camelCase UI language and `contacts-v2` snake_case transport language.
- There is an unresolved role tension between "experience-domain web surface" and the current backend's admin-oriented modeling.
- The repository needs future architectural cleanup because current root architecture docs still describe a Python monolith starter rather than a Solid frontend.

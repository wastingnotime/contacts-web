# Contacts V2 API Contract Inventory

## Purpose

This file records the source evidence used during the 2026-04-20 `extract` pass for the `contacts-v2` API contract.

It exists so later phases can trace the backend contract without depending on chat history.

## Source Evidence

### HTTP Interface

1. `/home/henrique/repos/github/wastingnotime/contacts-v2/src/app/interfaces/http/sanic_app.py`
   - defines the Sanic HTTP surface
   - exposes `GET /healthz`, `POST /contacts`, `GET /contacts`, `GET /contacts/{id}`, `PUT /contacts/{id}`, and `DELETE /contacts/{id}`
   - exposes a diagnostic `GET /events` route for recorded message events
   - maps application exceptions to `400`, `403`, `404`, and `409` responses

2. `/home/henrique/repos/github/wastingnotime/contacts-v2/tests/integration/test_sanic_api_runtime.py`
   - confirms the health route and CRUD routes work together as the runtime contract
   - confirms create returns `201` and `Location`
   - confirms missing records return `404`
   - confirms duplicate create requests return `409`
   - confirms non-admin claims are rejected with `403`

3. `/home/henrique/repos/github/wastingnotime/contacts-v2/src/app/interfaces/api_facade/admin_contacts_facade.py`
   - shows the request mapping layer for claims and payloads
   - shows update uses a body `id` field only for mismatch validation

### Domain And Application Rules

1. `/home/henrique/repos/github/wastingnotime/contacts-v2/src/app/application/use_cases/create_contact.py`
   - confirms exact duplicate detection on normalized `first_name`, `last_name`, and `phone_number`
   - confirms event emission on successful create

2. `/home/henrique/repos/github/wastingnotime/contacts-v2/src/app/application/use_cases/update_contact.py`
   - confirms body/path identifier mismatch is rejected as validation error
   - confirms update emits a contact-updated event

3. `/home/henrique/repos/github/wastingnotime/contacts-v2/src/app/application/use_cases/get_contact.py`
   - confirms get enforces admin access and returns not found through the repository contract

4. `/home/henrique/repos/github/wastingnotime/contacts-v2/src/app/application/use_cases/list_contacts.py`
   - confirms list enforces admin access and returns contact views directly

5. `/home/henrique/repos/github/wastingnotime/contacts-v2/src/app/application/use_cases/delete_contact.py`
   - confirms delete is a hard delete and emits a contact-deleted event

6. `/home/henrique/repos/github/wastingnotime/contacts-v2/src/app/domain/models/contact.py`
   - confirms required fields are `first_name`, `last_name`, and `phone_number`
   - confirms phone numbers are normalized rather than stored verbatim

7. `/home/henrique/repos/github/wastingnotime/contacts-v2/src/app/runtime/config.py`
   - confirms the runtime listens on port `8010` by default
   - confirms the API host defaults to `0.0.0.0`
   - confirms auth is claims-based in the current runtime

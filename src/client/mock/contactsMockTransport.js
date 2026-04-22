import { http, HttpResponse } from "msw";
import { getContactSeedViewModels } from "../fixtures/contactSeeds";

const INITIAL_CONTACTS = getContactSeedViewModels();

const state = {
  contacts: INITIAL_CONTACTS.map((contact) => ({ ...contact })),
  nextContactNumber: INITIAL_CONTACTS.length + 1,
};

function cloneContact(contact) {
  return { ...contact };
}

function resetState() {
  state.contacts = INITIAL_CONTACTS.map((contact) => ({ ...contact }));
  state.nextContactNumber = INITIAL_CONTACTS.length + 1;
}

function duplicateExists(payload, excludeContactId = null) {
  const nextFirstName = payload.firstName.trim().toLowerCase();
  const nextLastName = payload.lastName.trim().toLowerCase();
  const nextPhoneNumber = payload.phoneNumber.trim().toLowerCase();

  return state.contacts.some((contact) => {
    if (excludeContactId && contact.id === excludeContactId) {
      return false;
    }

    return (
      contact.firstName.trim().toLowerCase() === nextFirstName &&
      contact.lastName.trim().toLowerCase() === nextLastName &&
      contact.phoneNumber.trim().toLowerCase() === nextPhoneNumber
    );
  });
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  return ["firstName", "lastName", "phoneNumber"].every(
    (field) => typeof payload[field] === "string" && payload[field].trim() !== "",
  );
}

function mapPayloadToContact(payload, contactId) {
  return {
    id: contactId,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phoneNumber: payload.phoneNumber,
  };
}

function forbiddenResponse() {
  return HttpResponse.json(
    { message: "You are not allowed to access contacts right now." },
    { status: 403 },
  );
}

function notFoundResponse() {
  return HttpResponse.json({ message: "That contact could not be found." }, { status: 404 });
}

function validationResponse() {
  return HttpResponse.json({ message: "The contact data is invalid." }, { status: 400 });
}

function duplicateResponse() {
  return HttpResponse.json(
    { message: "A contact with this data already exists." },
    { status: 409 },
  );
}

export function resetContactsMockState() {
  resetState();
}

export const contactsMockHandlers = [
  http.post("/api/telemetry", async ({ request }) => {
    const payload = await request.json();
    return HttpResponse.json(
      {
        accepted: true,
        telemetry: payload,
      },
      { status: 202 },
    );
  }),

  http.get("/api/contacts", ({ request }) => {
    return HttpResponse.json(state.contacts.map(cloneContact));
  }),

  http.get("/api/contacts/:contactId", ({ request, params }) => {
    const contact = state.contacts.find((item) => item.id === params.contactId);
    if (!contact) {
      return notFoundResponse();
    }

    return HttpResponse.json(cloneContact(contact));
  }),

  http.post("/api/contacts", async ({ request }) => {
    const payload = await request.json();
    if (!validatePayload(payload)) {
      return validationResponse();
    }

    if (duplicateExists(payload)) {
      return duplicateResponse();
    }

    const created = mapPayloadToContact(payload, `isolated-contact-${state.nextContactNumber}`);
    state.nextContactNumber += 1;
    state.contacts.push(cloneContact(created));

    return HttpResponse.json(created, {
      status: 201,
      headers: {
        Location: `/api/contacts/${created.id}`,
      },
    });
  }),

  http.put("/api/contacts/:contactId", async ({ request, params }) => {
    const payload = await request.json();
    if (!validatePayload(payload)) {
      return validationResponse();
    }

    if (typeof payload.id === "string" && payload.id.trim() !== "" && payload.id !== params.contactId) {
      return validationResponse();
    }

    const contactIndex = state.contacts.findIndex((item) => item.id === params.contactId);
    if (contactIndex < 0) {
      return notFoundResponse();
    }

    if (duplicateExists(payload, params.contactId)) {
      return duplicateResponse();
    }

    const updated = mapPayloadToContact(payload, params.contactId);
    state.contacts[contactIndex] = cloneContact(updated);

    return HttpResponse.json(updated);
  }),

  http.delete("/api/contacts/:contactId", ({ request, params }) => {
    const contactIndex = state.contacts.findIndex((item) => item.id === params.contactId);
    if (contactIndex < 0) {
      return notFoundResponse();
    }

    state.contacts.splice(contactIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];

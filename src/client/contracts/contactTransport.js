export class ContactTransportError extends Error {
  constructor(message, code = "transport_error") {
    super(message);
    this.name = "ContactTransportError";
    this.code = code;
  }
}

export class ContactApiError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "ContactApiError";
    this.code = code;
  }
}

function assertString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ContactTransportError(`Expected non-empty string for ${fieldName}.`, "invalid_payload");
  }
  return value;
}

export function mapTransportContactToViewModel(payload) {
  if (payload === null || typeof payload !== "object") {
    throw new ContactTransportError("Expected object payload for contact.", "invalid_payload");
  }

  return {
    id: assertString(payload.id, "id"),
    firstName: assertString(payload.first_name, "first_name"),
    lastName: assertString(payload.last_name, "last_name"),
    phoneNumber: assertString(payload.phone_number, "phone_number"),
  };
}

export function mapTransportListToViewModels(payload) {
  if (!Array.isArray(payload)) {
    throw new ContactTransportError("Expected array payload for contacts list.", "invalid_payload");
  }

  return payload.map(mapTransportContactToViewModel);
}

export function mapDraftToCreatePayload(draft) {
  return {
    first_name: assertString(draft.firstName, "firstName"),
    last_name: assertString(draft.lastName, "lastName"),
    phone_number: assertString(draft.phoneNumber, "phoneNumber"),
  };
}

export function mapDraftToUpdatePayload(draft) {
  const payload = mapDraftToCreatePayload(draft);
  if (typeof draft.id === "string" && draft.id.trim() !== "") {
    payload.id = draft.id;
  }
  return payload;
}

export function mapResponseToApiError(response, fallbackMessage) {
  if (response.status === 400) {
    return new ContactApiError("The contact data is invalid.", "validation");
  }
  if (response.status === 403) {
    return new ContactApiError("You are not allowed to access contacts right now.", "authorization");
  }
  if (response.status === 404) {
    return new ContactApiError("That contact could not be found.", "not_found");
  }
  if (response.status === 409) {
    return new ContactApiError("A contact with this data already exists.", "duplicate");
  }

  return new ContactApiError(fallbackMessage, "unknown");
}

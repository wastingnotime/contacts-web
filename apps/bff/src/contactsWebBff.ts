import {
  ContactApiError,
  ContactTransportError,
  mapDraftToCreatePayload,
  mapDraftToUpdatePayload,
  mapTransportContactToViewModel,
  mapTransportListToViewModels,
} from "../../../src/client/contracts/contactTransport.js";

export class ContactsWebBffClient {
  constructor({ backendGateway }) {
    if (!backendGateway) {
      throw new Error("Missing backend gateway for contacts web BFF.");
    }

    this.backendGateway = backendGateway;
  }

  async listContacts() {
    try {
      const payload = await this.backendGateway.listContacts();
      return mapTransportListToViewModels(payload);
    } catch (error) {
      throw normalizeBffError(error, "Unable to load contacts.");
    }
  }

  async createContact(draft) {
    try {
      const payload = mapDraftToCreatePayload(draft);
      const responsePayload = await this.backendGateway.createContact(payload);
      if (responsePayload === null) {
        return null;
      }

      return mapTransportContactToViewModel(responsePayload);
    } catch (error) {
      throw normalizeBffError(error, "Unable to create contact.");
    }
  }

  async getContact(contactId) {
    try {
      const payload = await this.backendGateway.getContact(contactId);
      return mapTransportContactToViewModel(payload);
    } catch (error) {
      throw normalizeBffError(error, "Unable to load contact.");
    }
  }

  async updateContact(contactId, draft) {
    try {
      const payload = mapDraftToUpdatePayload(draft);
      const responsePayload = await this.backendGateway.updateContact(contactId, payload);
      return mapTransportContactToViewModel(responsePayload);
    } catch (error) {
      throw normalizeBffError(error, "Unable to update contact.");
    }
  }

  async deleteContact(contactId) {
    try {
      return await this.backendGateway.deleteContact(contactId);
    } catch (error) {
      throw normalizeBffError(error, "Unable to delete contact.");
    }
  }
}

export function createContactsWebBffClient({ backendGateway }) {
  return new ContactsWebBffClient({ backendGateway });
}

function normalizeBffError(error, fallbackMessage) {
  if (error instanceof ContactApiError) {
    return error;
  }

  if (error instanceof ContactTransportError) {
    return new ContactApiError(error.message, "validation");
  }

  if (error && typeof error === "object" && "code" in error && "message" in error) {
    return new ContactApiError(error.message, error.code);
  }

  if (error instanceof Error && error.message) {
    return new ContactApiError(error.message, "unknown");
  }

  return new ContactApiError(fallbackMessage, "unknown");
}

import {
  ContactApiError,
  mapDraftToCreatePayload,
  mapDraftToUpdatePayload,
  mapResponseToApiError,
  mapTransportContactToViewModel,
  mapTransportListToViewModels,
} from "../contracts/contactTransport";

export class HttpContactsApiClient {
  constructor({ baseUrl, authSubject, authRoles, fetchFn }) {
    this.baseUrl = baseUrl;
    this.authSubject = authSubject;
    this.authRoles = authRoles;
    this.fetchFn = fetchFn;
  }

  requestHeaders(jsonBody = false) {
    const headers = {
      Accept: "application/json",
      "x-auth-subject": this.authSubject,
      "x-auth-roles": this.authRoles,
    };

    if (jsonBody) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  async listContacts() {
    const response = await this.fetchFn(`${this.baseUrl}/contacts`, {
      method: "GET",
      headers: this.requestHeaders(),
    });

    if (!response.ok) {
      throw mapResponseToApiError(response, "Unable to load contacts.");
    }

    const payload = await response.json();
    return mapTransportListToViewModels(payload);
  }

  async createContact(draft) {
    const body = JSON.stringify(mapDraftToCreatePayload(draft));
    const response = await this.fetchFn(`${this.baseUrl}/contacts`, {
      method: "POST",
      headers: this.requestHeaders(true),
      body,
    });

    if (response.status === 201) {
      const rawBody = await response.text();
      if (!rawBody) {
        return null;
      }

      return mapTransportContactToViewModel(JSON.parse(rawBody));
    }

    if (!response.ok) {
      throw mapResponseToApiError(response, "Unable to create contact.");
    }

    throw new ContactApiError("Unexpected create-contact response.", "unknown");
  }

  async getContact(contactId) {
    const response = await this.fetchFn(`${this.baseUrl}/contacts/${contactId}`, {
      method: "GET",
      headers: this.requestHeaders(),
    });

    if (!response.ok) {
      throw mapResponseToApiError(response, "Unable to load contact.");
    }

    const payload = await response.json();
    return mapTransportContactToViewModel(payload);
  }

  async updateContact(contactId, draft) {
    const body = JSON.stringify(mapDraftToUpdatePayload(draft));
    const response = await this.fetchFn(`${this.baseUrl}/contacts/${contactId}`, {
      method: "PUT",
      headers: this.requestHeaders(true),
      body,
    });

    if (!response.ok) {
      throw mapResponseToApiError(response, "Unable to update contact.");
    }

    const payload = await response.json();
    return mapTransportContactToViewModel(payload);
  }

  async deleteContact(contactId) {
    const response = await this.fetchFn(`${this.baseUrl}/contacts/${contactId}`, {
      method: "DELETE",
      headers: this.requestHeaders(),
    });

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      throw mapResponseToApiError(response, "Unable to delete contact.");
    }

    return null;
  }
}

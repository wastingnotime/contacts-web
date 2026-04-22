import {
  mapResponseToApiError,
} from "../../../src/client/contracts/contactTransport.js";

export class HttpContactsBackendGateway {
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

    return response.json();
  }

  async createContact(payload) {
    const response = await this.fetchFn(`${this.baseUrl}/contacts`, {
      method: "POST",
      headers: this.requestHeaders(true),
      body: JSON.stringify(payload),
    });

    if (response.status === 201) {
      const rawBody = await response.text();
      if (!rawBody) {
        return null;
      }

      return JSON.parse(rawBody);
    }

    if (!response.ok) {
      throw mapResponseToApiError(response, "Unable to create contact.");
    }

    throw new Error("Unexpected create-contact response.");
  }

  async getContact(contactId) {
    const response = await this.fetchFn(`${this.baseUrl}/contacts/${contactId}`, {
      method: "GET",
      headers: this.requestHeaders(),
    });

    if (!response.ok) {
      throw mapResponseToApiError(response, "Unable to load contact.");
    }

    return response.json();
  }

  async updateContact(contactId, payload) {
    const response = await this.fetchFn(`${this.baseUrl}/contacts/${contactId}`, {
      method: "PUT",
      headers: this.requestHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw mapResponseToApiError(response, "Unable to update contact.");
    }

    return response.json();
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

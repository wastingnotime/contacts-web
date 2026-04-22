import {
  mapResponseToApiError,
} from "../../../src/client/contracts/contactTransport.js";
import { createTelemetryHeaders } from "../../../src/shared/telemetry/contactsTelemetry.js";

export class HttpContactsBackendGateway {
  constructor({ baseUrl, authSubject, authRoles, fetchFn, telemetryContext }) {
    this.baseUrl = baseUrl;
    this.authSubject = authSubject;
    this.authRoles = authRoles;
    this.fetchFn = fetchFn;
    this.telemetryContext = telemetryContext;
  }

  requestHeaders(jsonBody = false, telemetryContext = this.telemetryContext) {
    const headers = {
      Accept: "application/json",
      "x-auth-subject": this.authSubject,
      "x-auth-roles": this.authRoles,
      ...createTelemetryHeaders(telemetryContext),
    };

    if (jsonBody) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  async listContacts(telemetryContext) {
    const response = await this.fetchFn(`${this.baseUrl}/contacts`, {
      method: "GET",
      headers: this.requestHeaders(false, telemetryContext),
    });

    if (!response.ok) {
      throw mapResponseToApiError(response, "Unable to load contacts.");
    }

    return response.json();
  }

  async createContact(payload, telemetryContext) {
    const response = await this.fetchFn(`${this.baseUrl}/contacts`, {
      method: "POST",
      headers: this.requestHeaders(true, telemetryContext),
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

  async getContact(contactId, telemetryContext) {
    const response = await this.fetchFn(`${this.baseUrl}/contacts/${contactId}`, {
      method: "GET",
      headers: this.requestHeaders(false, telemetryContext),
    });

    if (!response.ok) {
      throw mapResponseToApiError(response, "Unable to load contact.");
    }

    return response.json();
  }

  async updateContact(contactId, payload, telemetryContext) {
    const response = await this.fetchFn(`${this.baseUrl}/contacts/${contactId}`, {
      method: "PUT",
      headers: this.requestHeaders(true, telemetryContext),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw mapResponseToApiError(response, "Unable to update contact.");
    }

    return response.json();
  }

  async deleteContact(contactId, telemetryContext) {
    const response = await this.fetchFn(`${this.baseUrl}/contacts/${contactId}`, {
      method: "DELETE",
      headers: this.requestHeaders(false, telemetryContext),
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

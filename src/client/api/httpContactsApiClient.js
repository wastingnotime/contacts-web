import {
  ContactApiError,
  mapResponseToApiError,
} from "../contracts/contactTransport";
import {
  createContactsTelemetryContext,
  createTelemetryEvent,
  createTelemetryHeaders,
} from "../../shared/telemetry/contactsTelemetry";

export class HttpContactsApiClient {
  constructor({ baseUrl, fetchFn, telemetryContext }) {
    this.baseUrl = baseUrl;
    this.fetchFn = fetchFn;
    this.telemetryContext =
      telemetryContext ?? createContactsTelemetryContext({ serviceName: "contacts-spa" });
  }

  requestHeaders(jsonBody = false) {
    const headers = {
      Accept: "application/json",
      ...createTelemetryHeaders(this.telemetryContext),
    };

    if (jsonBody) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  async recordTelemetry(eventName, detail = {}) {
    const body = JSON.stringify(
      createTelemetryEvent({
        eventName,
        detail,
        path: detail.path,
        method: detail.method,
        statusCode: detail.statusCode,
        context: this.telemetryContext,
      }),
    );

    const response = await this.fetchFn(`${this.baseUrl}/telemetry`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...createTelemetryHeaders(this.telemetryContext),
      },
      body,
    });

    if (!response.ok && response.status !== 202) {
      throw new ContactApiError("Unable to record telemetry.", "unknown");
    }

    return null;
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

  async createContact(draft) {
    const body = JSON.stringify(draft);
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

      return JSON.parse(rawBody);
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

    return response.json();
  }

  async updateContact(contactId, draft) {
    const body = JSON.stringify(draft);
    const response = await this.fetchFn(`${this.baseUrl}/contacts/${contactId}`, {
      method: "PUT",
      headers: this.requestHeaders(true),
      body,
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

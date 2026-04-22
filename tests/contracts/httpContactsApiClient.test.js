import { describe, expect, it, vi } from "vitest";

import { HttpContactsApiClient } from "../../src/client/api/httpContactsApiClient";
import { createContactsTelemetryContext } from "../../src/shared/telemetry/contactsTelemetry";

function createResponse({ ok = true, status = 200, jsonBody = null, textBody = "" }) {
  return {
    ok,
    status,
    async json() {
      return jsonBody;
    },
    async text() {
      return textBody;
    },
  };
}

describe("HttpContactsApiClient", () => {
  it("loads, updates, and deletes contacts through the browser-facing BFF contract", async () => {
    const telemetryContext = createContactsTelemetryContext({
      traceId: "0123456789abcdef0123456789abcdef",
      spanId: "0123456789abcdef",
      serviceName: "contacts-spa",
      featureName: "contacts-web",
      journeyName: "contacts-web-journey",
      appVersion: "2026.04.22",
      environment: "test",
      traceparent: "00-0123456789abcdef0123456789abcdef-0123456789abcdef-01",
    });

    const fetchFn = vi.fn(async (url, options = {}) => {
      if (url.endsWith("/contacts") && options.method === "GET") {
        return createResponse({
          jsonBody: [
            {
              id: "contact-1",
              firstName: "Ada",
              lastName: "Lovelace",
              phoneNumber: "5550001",
            },
          ],
        });
      }

      if (url.endsWith("/contacts/contact-1") && options.method === "GET") {
        return createResponse({
          jsonBody: {
            id: "contact-1",
            firstName: "Ada",
            lastName: "Lovelace",
            phoneNumber: "5550001",
          },
        });
      }

      if (url.endsWith("/contacts/contact-1") && options.method === "PUT") {
        expect(JSON.parse(options.body)).toEqual({
          id: "contact-1",
          firstName: "Ada",
          lastName: "Byron",
          phoneNumber: "5550009",
        });
        return createResponse({
          jsonBody: {
            id: "contact-1",
            firstName: "Ada",
            lastName: "Byron",
            phoneNumber: "5550009",
          },
        });
      }

      if (url.endsWith("/contacts/contact-1") && options.method === "DELETE") {
        return createResponse({ status: 204, ok: true, textBody: "" });
      }

      throw new Error(`Unexpected request: ${options.method} ${url}`);
    });

    const apiClient = new HttpContactsApiClient({
      baseUrl: "",
      authSubject: "admin-user",
      authRoles: "admin",
      fetchFn,
      telemetryContext,
    });

    await expect(apiClient.listContacts()).resolves.toEqual([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "5550001",
      },
    ]);

    await expect(apiClient.getContact("contact-1")).resolves.toEqual({
      id: "contact-1",
      firstName: "Ada",
      lastName: "Lovelace",
      phoneNumber: "5550001",
    });

    await expect(
      apiClient.updateContact("contact-1", {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Byron",
        phoneNumber: "5550009",
      }),
    ).resolves.toEqual({
      id: "contact-1",
      firstName: "Ada",
      lastName: "Byron",
      phoneNumber: "5550009",
    });

    await expect(apiClient.deleteContact("contact-1")).resolves.toBeNull();
    expect(fetchFn).toHaveBeenCalledTimes(4);
    expect(fetchFn.mock.calls[0][1].headers).toMatchObject({
      traceparent: telemetryContext.traceparent,
      "x-contacts-service-name": "contacts-spa",
      "x-contacts-feature-name": "contacts-web",
      "x-contacts-journey-name": "contacts-web-journey",
      "x-contacts-app-version": "2026.04.22",
      "x-contacts-environment": "test",
    });
  });

  it("sends browser-facing payloads and telemetry through the BFF endpoint", async () => {
    const telemetryContext = createContactsTelemetryContext({
      traceId: "fedcba9876543210fedcba9876543210",
      spanId: "fedcba9876543210",
      serviceName: "contacts-spa",
      featureName: "contacts-web",
      journeyName: "contacts-web-journey",
      appVersion: "2026.04.22",
      environment: "test",
      traceparent: "00-fedcba9876543210fedcba9876543210-fedcba9876543210-01",
    });

    const fetchFn = vi.fn(async (url, options = {}) => {
      if (url.endsWith("/telemetry") && options.method === "POST") {
        expect(JSON.parse(options.body)).toMatchObject({
          eventName: "page_view",
          detail: {
            path: "/contacts",
            method: "GET",
            statusCode: 200,
          },
          serviceName: "contacts-spa",
          featureName: "contacts-web",
          journeyName: "contacts-web-journey",
          appVersion: "2026.04.22",
          environment: "test",
          traceparent: telemetryContext.traceparent,
        });

        return createResponse({
          status: 202,
          jsonBody: {
            accepted: true,
          },
        });
      }

      if (url.endsWith("/contacts") && options.method === "GET") {
        return createResponse({
          jsonBody: [],
        });
      }

      if (url.endsWith("/contacts") && options.method === "POST") {
        expect(JSON.parse(options.body)).toEqual({
          id: "",
          firstName: "Grace",
          lastName: "Hopper",
          phoneNumber: "555-0100",
        });
        return createResponse({
          status: 201,
          jsonBody: {
            id: "contact-1",
            firstName: "Grace",
            lastName: "Hopper",
            phoneNumber: "555-0100",
          },
          textBody: JSON.stringify({
            id: "contact-1",
            firstName: "Grace",
            lastName: "Hopper",
            phoneNumber: "555-0100",
          }),
        });
      }

      throw new Error(`Unexpected request: ${options.method} ${url}`);
    });

    const apiClient = new HttpContactsApiClient({
      baseUrl: "",
      fetchFn,
      telemetryContext,
    });

    await apiClient.listContacts();
    await apiClient.recordTelemetry("page_view", {
      path: "/contacts",
      method: "GET",
      statusCode: 200,
    });
    await apiClient.createContact({
      id: "",
      firstName: "Grace",
      lastName: "Hopper",
      phoneNumber: "555-0100",
    });

    expect(fetchFn.mock.calls[0][1].headers).toMatchObject({
      Accept: "application/json",
      traceparent: telemetryContext.traceparent,
      "x-contacts-service-name": "contacts-spa",
      "x-contacts-feature-name": "contacts-web",
      "x-contacts-journey-name": "contacts-web-journey",
      "x-contacts-app-version": "2026.04.22",
      "x-contacts-environment": "test",
    });
    expect(fetchFn.mock.calls[1][1].headers).toMatchObject({
      Accept: "application/json",
      "Content-Type": "application/json",
      traceparent: telemetryContext.traceparent,
      "x-contacts-service-name": "contacts-spa",
      "x-contacts-feature-name": "contacts-web",
      "x-contacts-journey-name": "contacts-web-journey",
      "x-contacts-app-version": "2026.04.22",
      "x-contacts-environment": "test",
    });
    expect(fetchFn.mock.calls[2][1].headers).toMatchObject({
      Accept: "application/json",
      "Content-Type": "application/json",
      traceparent: telemetryContext.traceparent,
      "x-contacts-service-name": "contacts-spa",
      "x-contacts-feature-name": "contacts-web",
      "x-contacts-journey-name": "contacts-web-journey",
      "x-contacts-app-version": "2026.04.22",
      "x-contacts-environment": "test",
    });
  });
});

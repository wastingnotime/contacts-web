import { describe, expect, it, vi } from "vitest";

import { HttpContactsBackendGateway } from "../../apps/bff/src/httpContactsBackendGateway.ts";
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

describe("HttpContactsBackendGateway", () => {
  it("sends backend claims headers and raw transport payloads", async () => {
    const telemetryContext = createContactsTelemetryContext({
      traceId: "0123456789abcdef0123456789abcdef",
      spanId: "0123456789abcdef",
      serviceName: "contacts-bff",
      featureName: "contacts-web",
      journeyName: "contacts-web-journey",
      appVersion: "2026.04.22",
      environment: "test",
      traceparent: "00-0123456789abcdef0123456789abcdef-0123456789abcdef-01",
    });

    const fetchFn = vi.fn(async (url, options = {}) => {
      if (url.endsWith("/contacts") && options.method === "POST") {
        expect(JSON.parse(options.body)).toEqual({
          first_name: "Grace",
          last_name: "Hopper",
          phone_number: "555-0100",
        });
        return createResponse({
          status: 201,
          textBody: JSON.stringify({
            id: "contact-1",
            first_name: "Grace",
            last_name: "Hopper",
            phone_number: "555-0100",
          }),
        });
      }

      if (url.endsWith("/contacts") && options.method === "GET") {
        return createResponse({
          jsonBody: [
            {
              id: "contact-1",
              first_name: "Ada",
              last_name: "Lovelace",
              phone_number: "5550001",
            },
          ],
        });
      }

      throw new Error(`Unexpected request: ${options.method} ${url}`);
    });

    const backendGateway = new HttpContactsBackendGateway({
      baseUrl: "",
      authSubject: "admin-user",
      authRoles: "admin",
      fetchFn,
      telemetryContext,
    });

    await expect(backendGateway.listContacts()).resolves.toEqual([
      {
        id: "contact-1",
        first_name: "Ada",
        last_name: "Lovelace",
        phone_number: "5550001",
      },
    ]);

    await expect(
      backendGateway.createContact({
        first_name: "Grace",
        last_name: "Hopper",
        phone_number: "555-0100",
      }),
    ).resolves.toEqual({
      id: "contact-1",
      first_name: "Grace",
      last_name: "Hopper",
      phone_number: "555-0100",
    });

    expect(fetchFn.mock.calls[0][1].headers).toMatchObject({
      Accept: "application/json",
      "x-auth-subject": "admin-user",
      "x-auth-roles": "admin",
      traceparent: telemetryContext.traceparent,
      "x-contacts-service-name": "contacts-bff",
      "x-contacts-feature-name": "contacts-web",
      "x-contacts-journey-name": "contacts-web-journey",
      "x-contacts-app-version": "2026.04.22",
      "x-contacts-environment": "test",
    });
    expect(fetchFn.mock.calls[1][1].headers).toMatchObject({
      Accept: "application/json",
      "x-auth-subject": "admin-user",
      "x-auth-roles": "admin",
      "Content-Type": "application/json",
      traceparent: telemetryContext.traceparent,
      "x-contacts-service-name": "contacts-bff",
      "x-contacts-feature-name": "contacts-web",
      "x-contacts-journey-name": "contacts-web-journey",
      "x-contacts-app-version": "2026.04.22",
      "x-contacts-environment": "test",
    });
  });
});

import { http, passthrough } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { contactsMockServer } from "../../src/client/mock/contactsMockServer";

import { startContactsWebBffServer } from "../../apps/bff/src/server.ts";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function allowPassthroughToActiveServer(baseUrl) {
  contactsMockServer.use(
    http.all(new RegExp(`^${escapeRegex(baseUrl)}/api/.*$`), () => passthrough()),
  );
}

describe("contactsWebBffServer", () => {
  let activeServer;

  afterEach(async () => {
    if (activeServer) {
      await new Promise((resolve) => activeServer.server.close(resolve));
      activeServer = null;
    }
  });

  it("serves CRUD through the BFF boundary", async () => {
    const telemetryContext = {
      traceparent: "00-0123456789abcdef0123456789abcdef-0123456789abcdef-01",
      "x-contacts-trace-id": "0123456789abcdef0123456789abcdef",
      "x-contacts-service-name": "contacts-spa",
      "x-contacts-feature-name": "contacts-web",
      "x-contacts-journey-name": "contacts-web-journey",
      "x-contacts-app-version": "2026.04.22",
      "x-contacts-environment": "test",
    };

    const backendGateway = {
      listContacts: vi.fn(async () => [
        {
          id: "contact-1",
          first_name: "Ada",
          last_name: "Lovelace",
          phone_number: "5550001",
        },
      ]),
      createContact: vi.fn(async (payload) => ({
        id: "contact-2",
        ...payload,
      })),
      getContact: vi.fn(async () => ({
        id: "contact-1",
        first_name: "Ada",
        last_name: "Lovelace",
        phone_number: "5550001",
      })),
      updateContact: vi.fn(async (_contactId, payload) => ({
        id: "contact-1",
        ...payload,
      })),
      deleteContact: vi.fn(async () => null),
    };

    activeServer = await startContactsWebBffServer({
      backendGateway,
      port: 0,
    });

    allowPassthroughToActiveServer(activeServer.baseUrl);

    const telemetryResponse = await fetch(`${activeServer.baseUrl}/api/telemetry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...telemetryContext,
      },
      body: JSON.stringify({
        eventName: "page_view",
        path: "/contacts",
        method: "GET",
        statusCode: 200,
        detail: {
          route: "/",
        },
      }),
    });

    expect(telemetryResponse.status).toBe(202);
    expect(await telemetryResponse.json()).toMatchObject({
      accepted: true,
      telemetry: {
        eventName: "page_view",
        path: "/contacts",
        method: "GET",
        statusCode: 200,
        serviceName: "contacts-spa",
        featureName: "contacts-web",
        journeyName: "contacts-web-journey",
        appVersion: "2026.04.22",
        environment: "test",
        traceparent: telemetryContext.traceparent,
      },
    });

    const listResponse = await fetch(`${activeServer.baseUrl}/api/contacts`, {
      headers: {
        ...telemetryContext,
      },
    });
    expect(listResponse.status).toBe(200);
    expect(await listResponse.json()).toEqual([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "5550001",
      },
    ]);

    const createResponse = await fetch(`${activeServer.baseUrl}/api/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...telemetryContext,
      },
      body: JSON.stringify({
        id: "",
        firstName: "Grace",
        lastName: "Hopper",
        phoneNumber: "555-0100",
      }),
    });

    expect(createResponse.status).toBe(201);
    expect(await createResponse.json()).toEqual({
      id: "contact-2",
      firstName: "Grace",
      lastName: "Hopper",
      phoneNumber: "555-0100",
    });

    const getResponse = await fetch(`${activeServer.baseUrl}/api/contacts/contact-1`, {
      headers: {
        ...telemetryContext,
      },
    });
    expect(getResponse.status).toBe(200);
    expect(await getResponse.json()).toEqual({
      id: "contact-1",
      firstName: "Ada",
      lastName: "Lovelace",
      phoneNumber: "5550001",
    });

    const updateResponse = await fetch(`${activeServer.baseUrl}/api/contacts/contact-1`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...telemetryContext,
      },
      body: JSON.stringify({
        id: "contact-1",
        firstName: "Ada",
        lastName: "Byron",
        phoneNumber: "5550009",
      }),
    });

    expect(updateResponse.status).toBe(200);
    expect(await updateResponse.json()).toEqual({
      id: "contact-1",
      firstName: "Ada",
      lastName: "Byron",
      phoneNumber: "5550009",
    });

    const deleteResponse = await fetch(`${activeServer.baseUrl}/api/contacts/contact-1`, {
      method: "DELETE",
      headers: {
        ...telemetryContext,
      },
    });

    expect(deleteResponse.status).toBe(204);

    expect(backendGateway.listContacts).toHaveBeenCalledTimes(1);
    expect(backendGateway.listContacts.mock.calls[0][0]).toMatchObject({
      traceparent: telemetryContext.traceparent,
      serviceName: "contacts-spa",
      featureName: "contacts-web",
      journeyName: "contacts-web-journey",
      appVersion: "2026.04.22",
      environment: "test",
    });
    expect(backendGateway.getContact).toHaveBeenCalledWith(
      "contact-1",
      expect.objectContaining({
        traceparent: telemetryContext.traceparent,
        serviceName: "contacts-spa",
        featureName: "contacts-web",
        journeyName: "contacts-web-journey",
        appVersion: "2026.04.22",
        environment: "test",
      }),
    );
    expect(backendGateway.createContact).toHaveBeenCalledWith({
      first_name: "Grace",
      last_name: "Hopper",
      phone_number: "555-0100",
    }, expect.objectContaining({
      traceparent: telemetryContext.traceparent,
      serviceName: "contacts-spa",
      featureName: "contacts-web",
      journeyName: "contacts-web-journey",
      appVersion: "2026.04.22",
      environment: "test",
    }));
    expect(backendGateway.getContact).toHaveBeenCalledTimes(1);
    expect(backendGateway.updateContact).toHaveBeenCalledWith("contact-1", {
      id: "contact-1",
      first_name: "Ada",
      last_name: "Byron",
      phone_number: "5550009",
    }, expect.objectContaining({
      traceparent: telemetryContext.traceparent,
      serviceName: "contacts-spa",
      featureName: "contacts-web",
      journeyName: "contacts-web-journey",
      appVersion: "2026.04.22",
      environment: "test",
    }));
    expect(backendGateway.deleteContact).toHaveBeenCalledWith("contact-1", expect.objectContaining({
      traceparent: telemetryContext.traceparent,
      serviceName: "contacts-spa",
      featureName: "contacts-web",
      journeyName: "contacts-web-journey",
      appVersion: "2026.04.22",
      environment: "test",
    }));
  });

  it("maps invalid browser drafts to validation failures", async () => {
    const backendGateway = {
      listContacts: async () => [],
      createContact: async () => {
        throw new Error("Backend should not be called for invalid draft.");
      },
      getContact: async () => ({ id: "contact-1", first_name: "Ada", last_name: "Lovelace", phone_number: "1" }),
      updateContact: async () => ({ id: "contact-1", first_name: "Ada", last_name: "Lovelace", phone_number: "1" }),
      deleteContact: async () => null,
    };

    activeServer = await startContactsWebBffServer({
      backendGateway,
      port: 0,
    });

    allowPassthroughToActiveServer(activeServer.baseUrl);

    const response = await fetch(`${activeServer.baseUrl}/api/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "",
        firstName: "",
        lastName: "Hopper",
        phoneNumber: "555-0100",
      }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      code: "validation",
    });
  });

  it("serves edit and delete through the BFF boundary", async () => {
    const telemetryContext = {
      traceparent: "00-fedcba9876543210fedcba9876543210-fedcba9876543210-01",
      "x-contacts-trace-id": "fedcba9876543210fedcba9876543210",
      "x-contacts-service-name": "contacts-spa",
      "x-contacts-feature-name": "contacts-web",
      "x-contacts-journey-name": "contacts-web-journey",
      "x-contacts-app-version": "2026.04.22",
      "x-contacts-environment": "test",
    };

    const backendGateway = {
      listContacts: vi.fn(async () => []),
      createContact: vi.fn(async () => null),
      getContact: vi.fn(async () => ({
        id: "contact-1",
        first_name: "Ada",
        last_name: "Lovelace",
        phone_number: "5550001",
      })),
      updateContact: vi.fn(async (_contactId, payload) => ({
        id: "contact-1",
        ...payload,
      })),
      deleteContact: vi.fn(async () => null),
    };

    activeServer = await startContactsWebBffServer({
      backendGateway,
      port: 0,
    });

    allowPassthroughToActiveServer(activeServer.baseUrl);

    const getResponse = await fetch(`${activeServer.baseUrl}/api/contacts/contact-1`, {
      headers: {
        ...telemetryContext,
      },
    });

    expect(getResponse.status).toBe(200);
    expect(await getResponse.json()).toEqual({
      id: "contact-1",
      firstName: "Ada",
      lastName: "Lovelace",
      phoneNumber: "5550001",
    });

    const updateResponse = await fetch(`${activeServer.baseUrl}/api/contacts/contact-1`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...telemetryContext,
      },
      body: JSON.stringify({
        id: "contact-1",
        firstName: "Ada",
        lastName: "Byron",
        phoneNumber: "5550009",
      }),
    });

    expect(updateResponse.status).toBe(200);
    expect(await updateResponse.json()).toEqual({
      id: "contact-1",
      firstName: "Ada",
      lastName: "Byron",
      phoneNumber: "5550009",
    });

    const deleteResponse = await fetch(`${activeServer.baseUrl}/api/contacts/contact-1`, {
      method: "DELETE",
      headers: {
        ...telemetryContext,
      },
    });

    expect(deleteResponse.status).toBe(204);
    expect(backendGateway.getContact).toHaveBeenCalledWith(
      "contact-1",
      expect.objectContaining({
        traceparent: telemetryContext.traceparent,
        serviceName: "contacts-spa",
        featureName: "contacts-web",
        journeyName: "contacts-web-journey",
        appVersion: "2026.04.22",
        environment: "test",
      }),
    );
    expect(backendGateway.updateContact).toHaveBeenCalledWith(
      "contact-1",
      {
        id: "contact-1",
        first_name: "Ada",
        last_name: "Byron",
        phone_number: "5550009",
      },
      expect.objectContaining({
        traceparent: telemetryContext.traceparent,
        serviceName: "contacts-spa",
        featureName: "contacts-web",
        journeyName: "contacts-web-journey",
        appVersion: "2026.04.22",
        environment: "test",
      }),
    );
    expect(backendGateway.deleteContact).toHaveBeenCalledWith(
      "contact-1",
      expect.objectContaining({
        traceparent: telemetryContext.traceparent,
        serviceName: "contacts-spa",
        featureName: "contacts-web",
        journeyName: "contacts-web-journey",
        appVersion: "2026.04.22",
        environment: "test",
      }),
    );
  });
});

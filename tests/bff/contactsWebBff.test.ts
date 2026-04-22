import { describe, expect, it, vi } from "vitest";

import { ContactsWebBffClient } from "../../apps/bff/src/contactsWebBff.ts";

function createBackendGateway(overrides = {}) {
  return {
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
    ...overrides,
  };
}

describe("ContactsWebBffClient", () => {
  it("maps backend transport payloads into browser-facing view models", async () => {
    const backendGateway = createBackendGateway();
    const bffClient = new ContactsWebBffClient({ backendGateway });

    await expect(bffClient.listContacts()).resolves.toEqual([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "5550001",
      },
    ]);

    await expect(
      bffClient.createContact({
        id: "",
        firstName: "Grace",
        lastName: "Hopper",
        phoneNumber: "555-0100",
      }),
    ).resolves.toEqual({
      id: "contact-2",
      firstName: "Grace",
      lastName: "Hopper",
      phoneNumber: "555-0100",
    });

    expect(backendGateway.createContact).toHaveBeenCalledWith({
      first_name: "Grace",
      last_name: "Hopper",
      phone_number: "555-0100",
    });
  });

  it("rejects invalid drafts before calling the backend gateway", async () => {
    const backendGateway = createBackendGateway();
    const bffClient = new ContactsWebBffClient({ backendGateway });

    await expect(
      bffClient.createContact({
        id: "",
        firstName: "",
        lastName: "Hopper",
        phoneNumber: "555-0100",
      }),
    ).rejects.toMatchObject({
      code: "validation",
    });

    expect(backendGateway.createContact).not.toHaveBeenCalled();
  });

  it("preserves invalid backend payloads as validation failures", async () => {
    const backendGateway = createBackendGateway({
      listContacts: vi.fn(async () => [
        {
          id: "contact-1",
          first_name: "Ada",
          last_name: "Lovelace",
        },
      ]),
    });
    const bffClient = new ContactsWebBffClient({ backendGateway });

    await expect(bffClient.listContacts()).rejects.toMatchObject({
      code: "validation",
    });
  });
});

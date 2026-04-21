import { describe, expect, it } from "vitest";

import { IsolatedContactsApiClient } from "../../src/client/api/isolatedContactsApiClient";

describe("IsolatedContactsApiClient", () => {
  it("returns deterministic seed contacts", async () => {
    const apiClient = new IsolatedContactsApiClient();

    await expect(apiClient.listContacts()).resolves.toEqual([
      {
        id: "isolated-contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "+44 20 7946 0991",
      },
      {
        id: "isolated-contact-2",
        firstName: "Grace",
        lastName: "Hopper",
        phoneNumber: "555-0100",
      },
    ]);
  });

  it("supports create, update, and delete without a live backend", async () => {
    const apiClient = new IsolatedContactsApiClient();

    const created = await apiClient.createContact({
      id: "",
      firstName: "Alan",
      lastName: "Turing",
      phoneNumber: "555-0200",
    });

    expect(created).toMatchObject({
      id: "isolated-contact-3",
      firstName: "Alan",
      lastName: "Turing",
      phoneNumber: "555-0200",
    });

    const updated = await apiClient.updateContact("isolated-contact-3", {
      id: "isolated-contact-3",
      firstName: "Alan",
      lastName: "Mathison Turing",
      phoneNumber: "555-0201",
    });

    expect(updated).toMatchObject({
      id: "isolated-contact-3",
      firstName: "Alan",
      lastName: "Mathison Turing",
      phoneNumber: "555-0201",
    });

    await expect(apiClient.deleteContact("isolated-contact-3")).resolves.toBeNull();
    await expect(apiClient.getContact("isolated-contact-3")).rejects.toMatchObject({
      code: "not_found",
    });
  });

  it("rejects duplicate isolated contacts deterministically", async () => {
    const apiClient = new IsolatedContactsApiClient();

    await expect(
      apiClient.createContact({
        id: "",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "+44 20 7946 0991",
      }),
    ).rejects.toMatchObject({
      code: "duplicate",
    });
  });
});

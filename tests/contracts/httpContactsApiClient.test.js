import { describe, expect, it, vi } from "vitest";

import { HttpContactsApiClient } from "../../src/client/api/httpContactsApiClient";

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
  it("loads, updates, and deletes contacts through the backend contract", async () => {
    const fetchFn = vi.fn(async (url, options = {}) => {
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

      if (url.endsWith("/contacts/contact-1") && options.method === "GET") {
        return createResponse({
          jsonBody: {
            id: "contact-1",
            first_name: "Ada",
            last_name: "Lovelace",
            phone_number: "5550001",
          },
        });
      }

      if (url.endsWith("/contacts/contact-1") && options.method === "PUT") {
        expect(JSON.parse(options.body)).toEqual({
          id: "contact-1",
          first_name: "Ada",
          last_name: "Byron",
          phone_number: "5550009",
        });
        return createResponse({
          jsonBody: {
            id: "contact-1",
            first_name: "Ada",
            last_name: "Byron",
            phone_number: "5550009",
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
  });

  it("sends backend claims headers on every request", async () => {
    const fetchFn = vi.fn(async (url, options = {}) => {
      if (url.endsWith("/contacts") && options.method === "GET") {
        return createResponse({
          jsonBody: [],
        });
      }

      if (url.endsWith("/contacts") && options.method === "POST") {
        expect(JSON.parse(options.body)).toEqual({
          first_name: "Grace",
          last_name: "Hopper",
          phone_number: "555-0100",
        });
        return createResponse({
          status: 201,
          jsonBody: {
            id: "contact-1",
            first_name: "Grace",
            last_name: "Hopper",
            phone_number: "555-0100",
          },
          textBody: JSON.stringify({
            id: "contact-1",
            first_name: "Grace",
            last_name: "Hopper",
            phone_number: "555-0100",
          }),
        });
      }

      throw new Error(`Unexpected request: ${options.method} ${url}`);
    });

    const apiClient = new HttpContactsApiClient({
      baseUrl: "",
      authSubject: "admin-user",
      authRoles: "admin",
      fetchFn,
    });

    await apiClient.listContacts();
    await apiClient.createContact({
      id: "",
      firstName: "Grace",
      lastName: "Hopper",
      phoneNumber: "555-0100",
    });

    expect(fetchFn.mock.calls[0][1].headers).toMatchObject({
      Accept: "application/json",
      "x-auth-subject": "admin-user",
      "x-auth-roles": "admin",
    });
    expect(fetchFn.mock.calls[1][1].headers).toMatchObject({
      Accept: "application/json",
      "x-auth-subject": "admin-user",
      "x-auth-roles": "admin",
      "Content-Type": "application/json",
    });
  });
});

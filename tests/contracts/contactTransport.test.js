import {
  ContactTransportError,
  mapDraftToCreatePayload,
  mapDraftToUpdatePayload,
  mapResponseToApiError,
  mapTransportContactToViewModel,
  mapTransportListToViewModels,
} from "../../src/client/contracts/contactTransport";
import { getContactErrorMessage } from "../../src/client/contracts/contactErrors";

describe("contactTransport", () => {
  it("maps a snake_case contact payload into a camelCase view model", () => {
    expect(
      mapTransportContactToViewModel({
        id: "contact-1",
        first_name: "Ada",
        last_name: "Lovelace",
        phone_number: "555-0001",
      }),
    ).toEqual({
      id: "contact-1",
      firstName: "Ada",
      lastName: "Lovelace",
      phoneNumber: "555-0001",
    });
  });

  it("maps a list payload into view models", () => {
    expect(
      mapTransportListToViewModels([
        {
          id: "contact-1",
          first_name: "Ada",
          last_name: "Lovelace",
          phone_number: "555-0001",
        },
      ]),
    ).toEqual([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "555-0001",
      },
    ]);
  });

  it("maps a camelCase draft into a snake_case create payload", () => {
    expect(
      mapDraftToCreatePayload({
        firstName: "Grace",
        lastName: "Hopper",
        phoneNumber: "555-0100",
      }),
    ).toEqual({
      first_name: "Grace",
      last_name: "Hopper",
      phone_number: "555-0100",
    });
  });

  it("maps a camelCase draft into a snake_case update payload with an id when present", () => {
    expect(
      mapDraftToUpdatePayload({
        id: "contact-1",
        firstName: "Grace",
        lastName: "Hopper",
        phoneNumber: "555-0100",
      }),
    ).toEqual({
      id: "contact-1",
      first_name: "Grace",
      last_name: "Hopper",
      phone_number: "555-0100",
    });
  });

  it("maps backend response status codes to explicit api errors", () => {
    expect(mapResponseToApiError({ status: 403 }, "fallback")).toMatchObject({
      code: "authorization",
      message: "You are not allowed to access contacts right now.",
    });
    expect(mapResponseToApiError({ status: 404 }, "fallback")).toMatchObject({
      code: "not_found",
      message: "That contact could not be found.",
    });
  });

  it("fails clearly on invalid transport payloads", () => {
    expect(() =>
      mapTransportContactToViewModel({
        id: "contact-1",
        first_name: "Ada",
        last_name: "Lovelace",
      }),
    ).toThrow(ContactTransportError);
  });

  it("maps authorization errors into a consistent browser-facing message", () => {
    expect(
      getContactErrorMessage({ code: "authorization", message: "not allowed" }, "fallback"),
    ).toBe("You are not allowed to access contacts right now.");
  });
});

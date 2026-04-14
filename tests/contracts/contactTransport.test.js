import {
  ContactTransportError,
  mapDraftToCreatePayload,
  mapTransportContactToViewModel,
  mapTransportListToViewModels,
} from "../../src/client/contracts/contactTransport";

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

  it("fails clearly on invalid transport payloads", () => {
    expect(() =>
      mapTransportContactToViewModel({
        id: "contact-1",
        first_name: "Ada",
        last_name: "Lovelace",
      }),
    ).toThrow(ContactTransportError);
  });
});

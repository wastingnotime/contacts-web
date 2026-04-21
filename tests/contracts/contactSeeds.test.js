import {
  getContactSeedTransportContacts,
  getContactSeedViewModels,
} from "../../src/client/fixtures/contactSeeds";

describe("contactSeeds", () => {
  it("keeps view-model and transport seeds aligned", () => {
    const viewModels = getContactSeedViewModels();
    const transportContacts = getContactSeedTransportContacts();

    expect(viewModels).toEqual([
      {
        id: "story-contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "+44 20 7946 0991",
      },
      {
        id: "story-contact-2",
        firstName: "Grace",
        lastName: "Hopper",
        phoneNumber: "555-0100",
      },
    ]);

    expect(transportContacts).toEqual([
      {
        id: "story-contact-1",
        first_name: "Ada",
        last_name: "Lovelace",
        phone_number: "+44 20 7946 0991",
      },
      {
        id: "story-contact-2",
        first_name: "Grace",
        last_name: "Hopper",
        phone_number: "555-0100",
      },
    ]);
  });
});

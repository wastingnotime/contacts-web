const CONTACT_SEEDS = [
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
];

function cloneContact(contact) {
  return { ...contact };
}

function toTransportContact(contact) {
  return {
    id: contact.id,
    first_name: contact.firstName,
    last_name: contact.lastName,
    phone_number: contact.phoneNumber,
  };
}

export function getContactSeedViewModels() {
  return CONTACT_SEEDS.map(cloneContact);
}

export function getContactSeedTransportContacts() {
  return CONTACT_SEEDS.map(toTransportContact);
}

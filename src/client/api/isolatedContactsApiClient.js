import { ContactApiError } from "../contracts/contactTransport";

const DEFAULT_ISOLATED_CONTACTS = [
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
];

function cloneContact(contact) {
  return {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phoneNumber: contact.phoneNumber,
  };
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function sameContactShape(contact, draft) {
  return (
    normalize(contact.firstName) === normalize(draft.firstName) &&
    normalize(contact.lastName) === normalize(draft.lastName) &&
    normalize(contact.phoneNumber) === normalize(draft.phoneNumber)
  );
}

export class IsolatedContactsApiClient {
  constructor({ initialContacts = DEFAULT_ISOLATED_CONTACTS } = {}) {
    this.state = {
      contacts: initialContacts.map(cloneContact),
    };
    this.nextContactNumber = this.state.contacts.length + 1;
  }

  async listContacts() {
    return this.state.contacts.map(cloneContact);
  }

  async createContact(draft) {
    if (this.state.contacts.some((contact) => sameContactShape(contact, draft))) {
      throw new ContactApiError("A contact with this data already exists.", "duplicate");
    }

    const created = {
      id: `isolated-contact-${this.nextContactNumber}`,
      firstName: draft.firstName,
      lastName: draft.lastName,
      phoneNumber: draft.phoneNumber,
    };
    this.nextContactNumber += 1;
    this.state.contacts.push(created);
    return cloneContact(created);
  }

  async getContact(contactId) {
    const contact = this.state.contacts.find((item) => item.id === contactId);
    if (!contact) {
      throw new ContactApiError("That contact could not be found.", "not_found");
    }

    return cloneContact(contact);
  }

  async updateContact(contactId, draft) {
    const contactIndex = this.state.contacts.findIndex((item) => item.id === contactId);
    if (contactIndex < 0) {
      throw new ContactApiError("That contact could not be found.", "not_found");
    }

    if (
      this.state.contacts.some(
        (contact) => contact.id !== contactId && sameContactShape(contact, draft),
      )
    ) {
      throw new ContactApiError("A contact with this data already exists.", "duplicate");
    }

    const updated = {
      id: contactId,
      firstName: draft.firstName,
      lastName: draft.lastName,
      phoneNumber: draft.phoneNumber,
    };
    this.state.contacts[contactIndex] = updated;
    return cloneContact(updated);
  }

  async deleteContact(contactId) {
    const contactIndex = this.state.contacts.findIndex((item) => item.id === contactId);
    if (contactIndex < 0) {
      throw new ContactApiError("That contact could not be found.", "not_found");
    }

    this.state.contacts.splice(contactIndex, 1);
    return null;
  }
}

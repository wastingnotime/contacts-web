import { ContactApiError } from "../contracts/contactTransport";

const DEFAULT_CONTACTS = [
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

function sameContactShape(contact, draft) {
  return (
    contact.firstName.trim().toLowerCase() === draft.firstName.trim().toLowerCase() &&
    contact.lastName.trim().toLowerCase() === draft.lastName.trim().toLowerCase() &&
    contact.phoneNumber.trim().toLowerCase() === draft.phoneNumber.trim().toLowerCase()
  );
}

export function createStoryContactsApiClient({
  contacts = DEFAULT_CONTACTS,
  listError = null,
  getError = null,
  createError = null,
  updateError = null,
  deleteError = null,
} = {}) {
  const state = {
    contacts: contacts.map(cloneContact),
  };
  let nextContactNumber = state.contacts.length + 1;

  return {
    async listContacts() {
      if (listError) {
        throw listError;
      }

      return state.contacts.map(cloneContact);
    },

    async getContact(contactId) {
      if (getError) {
        throw getError;
      }

      const contact = state.contacts.find((item) => item.id === contactId);
      if (!contact) {
        throw new ContactApiError("That contact could not be found.", "not_found");
      }

      return cloneContact(contact);
    },

    async createContact(draft) {
      if (createError) {
        throw createError;
      }

      if (state.contacts.some((contact) => sameContactShape(contact, draft))) {
        throw new ContactApiError("A contact with this data already exists.", "duplicate");
      }

      const created = {
        id: `story-contact-${nextContactNumber}`,
        firstName: draft.firstName,
        lastName: draft.lastName,
        phoneNumber: draft.phoneNumber,
      };
      nextContactNumber += 1;
      state.contacts.push(cloneContact(created));
      return cloneContact(created);
    },

    async updateContact(contactId, draft) {
      if (updateError) {
        throw updateError;
      }

      const contactIndex = state.contacts.findIndex((item) => item.id === contactId);
      if (contactIndex < 0) {
        throw new ContactApiError("That contact could not be found.", "not_found");
      }

      if (
        state.contacts.some(
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
      state.contacts[contactIndex] = cloneContact(updated);
      return cloneContact(updated);
    },

    async deleteContact(contactId) {
      if (deleteError) {
        throw deleteError;
      }

      const contactIndex = state.contacts.findIndex((item) => item.id === contactId);
      if (contactIndex < 0) {
        throw new ContactApiError("That contact could not be found.", "not_found");
      }

      state.contacts.splice(contactIndex, 1);
      return null;
    },
  };
}

export function createDelayedStoryContactsApiClient({
  delayMs = 2000,
  contacts = DEFAULT_CONTACTS,
} = {}) {
  const baseClient = createStoryContactsApiClient({ contacts });

  return {
    ...baseClient,
    async listContacts() {
      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });

      return baseClient.listContacts();
    },
  };
}

export function createPageStoryContactsApiClient({
  contacts = DEFAULT_CONTACTS,
  delayMs = 0,
  missingContactId = null,
} = {}) {
  const baseClient = createStoryContactsApiClient({ contacts });

  return {
    ...baseClient,
    async getContact(contactId) {
      if (delayMs > 0) {
        await new Promise((resolve) => {
          setTimeout(resolve, delayMs);
        });
      }

      if (missingContactId && contactId === missingContactId) {
        throw new ContactApiError("That contact could not be found.", "not_found");
      }

      return baseClient.getContact(contactId);
    },
  };
}

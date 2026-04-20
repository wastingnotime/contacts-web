export function createEmptyContactDraft() {
  return {
    id: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  };
}

export function createContactDraftFromViewModel(contact) {
  return {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phoneNumber: contact.phoneNumber,
  };
}

export function validateContactDraft(draft) {
  const errors = {};

  if (!draft.firstName.trim()) {
    errors.firstName = "First name is required.";
  }
  if (!draft.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }
  if (!draft.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  }

  return errors;
}

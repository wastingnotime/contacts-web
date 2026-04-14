export function createEmptyContactDraft() {
  return {
    firstName: "",
    lastName: "",
    phoneNumber: "",
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

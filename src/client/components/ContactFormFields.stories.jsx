import { ContactFormFields } from "./ContactFormFields";

const meta = {
  title: "Contacts/Contact Form Fields",
  component: ContactFormFields,
  args: {
    draft: {
      id: "story-contact-1",
      firstName: "Ada",
      lastName: "Lovelace",
      phoneNumber: "+44 20 7946 0991",
    },
    errors: {},
    disabled: false,
    onFieldChange: () => {},
  },
};

export default meta;

export const Default = {};

export const WithValidationErrors = {
  args: {
    errors: {
      firstName: "First name is required.",
      lastName: "Last name is required.",
      phoneNumber: "Phone number is required.",
    },
  },
};

export const Disabled = {
  args: {
    disabled: true,
  },
};

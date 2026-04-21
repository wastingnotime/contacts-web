import { CreateContactPage } from "./CreateContactPage";
import { createStoryContactsApiClient } from "../storybook/createStoryContactsApiClient";

const meta = {
  title: "Contacts/Create Contact Page",
  component: CreateContactPage,
  args: {
    navigate: () => {},
  },
};

export default meta;

export const Default = {
  render: (args) => (
    <CreateContactPage
      apiClient={createStoryContactsApiClient({ contacts: [] })}
      navigate={args.navigate}
    />
  ),
};

export const SubmitFailure = {
  render: (args) => (
    <CreateContactPage
      apiClient={createStoryContactsApiClient({
        contacts: [],
        createError: new Error("Unable to save contact right now."),
      })}
      navigate={args.navigate}
    />
  ),
};

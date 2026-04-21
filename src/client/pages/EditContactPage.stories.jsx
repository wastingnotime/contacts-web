import { EditContactPage } from "./EditContactPage";
import { createPageStoryContactsApiClient } from "../storybook/createStoryContactsApiClient";

const meta = {
  title: "Contacts/Edit Contact Page",
  component: EditContactPage,
  args: {
    navigate: () => {},
  },
};

export default meta;

export const Loaded = {
  render: (args) => (
    <EditContactPage
      apiClient={createPageStoryContactsApiClient()}
      contactId="story-contact-1"
      navigate={args.navigate}
    />
  ),
};

export const Loading = {
  render: (args) => (
    <EditContactPage
      apiClient={createPageStoryContactsApiClient({
        delayMs: 5000,
      })}
      contactId="story-contact-1"
      navigate={args.navigate}
    />
  ),
};

export const MissingRecord = {
  render: (args) => (
    <EditContactPage
      apiClient={createPageStoryContactsApiClient({
        missingContactId: "story-contact-1",
      })}
      contactId="story-contact-1"
      navigate={args.navigate}
    />
  ),
};

export const SubmitFailure = {
  render: (args) => (
    <EditContactPage
      apiClient={createPageStoryContactsApiClient({
        contacts: [
          {
            id: "story-contact-1",
            firstName: "Ada",
            lastName: "Lovelace",
            phoneNumber: "+44 20 7946 0991",
          },
        ],
        updateError: new Error("Unable to update contact right now."),
      })}
      contactId="story-contact-1"
      navigate={args.navigate}
    />
  ),
};

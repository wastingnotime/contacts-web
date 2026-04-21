import { EditContactPage } from "./EditContactPage";
import { onMount } from "solid-js";
import {
  createPageStoryContactsApiClient,
  createPendingStoryContactsApiClient,
} from "../storybook/createStoryContactsApiClient";

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

function EditContactPendingStory() {
  const apiClient = createPendingStoryContactsApiClient({
    contacts: [
      {
        id: "story-contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "+44 20 7946 0991",
      },
    ],
  });

  const navigate = () => {};

  onMount(() => {
    const timer = setInterval(() => {
      const inputs = Array.from(document.querySelectorAll(".contact-form input"));
      const submitButton = document.querySelector('.contact-form button[type="submit"]');

      if (inputs.length !== 3 || !submitButton) {
        return;
      }

      inputs[1].value = "Byron";
      inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[2].value = "555-0009";
      inputs[2].dispatchEvent(new Event("input", { bubbles: true }));
      submitButton.click();
      clearInterval(timer);
    }, 25);
  });

  return (
    <EditContactPage
      apiClient={apiClient}
      contactId="story-contact-1"
      navigate={navigate}
    />
  );
}

export const SubmitPending = {
  render: () => <EditContactPendingStory />,
};

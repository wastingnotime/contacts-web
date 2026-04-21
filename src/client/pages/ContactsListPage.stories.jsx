import { ContactsListPage } from "./ContactsListPage";
import {
  createDeletePendingStoryContactsApiClient,
  createDelayedStoryContactsApiClient,
  createStoryContactsApiClient,
} from "../storybook/createStoryContactsApiClient";
import { onMount } from "solid-js";

const meta = {
  title: "Contacts/Contacts List Page",
  component: ContactsListPage,
  args: {
    navigate: () => {},
  },
};

export default meta;

export const Empty = {
  render: (args) => (
    <ContactsListPage
      apiClient={createStoryContactsApiClient({ contacts: [] })}
      navigate={args.navigate}
    />
  ),
};

export const Populated = {
  render: (args) => (
    <ContactsListPage
      apiClient={createStoryContactsApiClient()}
      navigate={args.navigate}
    />
  ),
};

export const LoadFailure = {
  render: (args) => (
    <ContactsListPage
      apiClient={createStoryContactsApiClient({
        contacts: [],
        listError: new Error("Unable to load contacts right now."),
      })}
      navigate={args.navigate}
    />
  ),
};

export const Loading = {
  render: (args) => (
    <ContactsListPage
      apiClient={createDelayedStoryContactsApiClient({
        delayMs: 5000,
      })}
      navigate={args.navigate}
    />
  ),
};

function ContactsListDeleteConfirmationStory() {
  const apiClient = createStoryContactsApiClient();
  const navigate = () => {};

  onMount(() => {
    setTimeout(() => {
      const deleteButton = document.querySelector('.contact-card button[type="button"]');
      if (!deleteButton) {
        return;
      }

      deleteButton.click();
    }, 0);
  });

  return <ContactsListPage apiClient={apiClient} navigate={navigate} />;
}

function ContactsListDeletePendingStory() {
  const apiClient = createDeletePendingStoryContactsApiClient();
  const navigate = () => {};

  onMount(() => {
    setTimeout(() => {
      const deleteButton = document.querySelector('.contact-card button[type="button"]');
      const confirmButton = document.querySelector('.delete-confirmation .danger-button');

      if (!deleteButton || !confirmButton) {
        return;
      }

      deleteButton.click();
      setTimeout(() => {
        confirmButton.click();
      }, 0);
    }, 0);
  });

  return <ContactsListPage apiClient={apiClient} navigate={navigate} />;
}

export const DeleteConfirmation = {
  render: () => <ContactsListDeleteConfirmationStory />,
};

export const DeletePending = {
  render: () => <ContactsListDeletePendingStory />,
};

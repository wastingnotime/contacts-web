import { ContactsListPage } from "./ContactsListPage";
import {
  createDelayedStoryContactsApiClient,
  createStoryContactsApiClient,
} from "../storybook/createStoryContactsApiClient";

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

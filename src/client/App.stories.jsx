import { App } from "./App";
import { createStoryContactsApiClient } from "./storybook/createStoryContactsApiClient";

const meta = {
  title: "Contacts/App Shell",
  component: App,
};

export default meta;

export const LiveMode = {
  render: () => (
    <App
      apiClient={createStoryContactsApiClient()}
      runtimeMode="live"
      initialPath="/"
    />
  ),
};

export const IsolatedMode = {
  render: () => (
    <App
      apiClient={createStoryContactsApiClient()}
      runtimeMode="isolated"
      initialPath="/"
    />
  ),
};

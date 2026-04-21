import { CreateContactPage } from "./CreateContactPage";
import { onMount } from "solid-js";
import {
  createPendingStoryContactsApiClient,
  createStoryContactsApiClient,
} from "../storybook/createStoryContactsApiClient";

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

function CreateContactPendingStory() {
  const apiClient = createPendingStoryContactsApiClient({
    contacts: [],
  });

  const navigate = () => {};

  onMount(() => {
    setTimeout(() => {
      const inputs = Array.from(document.querySelectorAll(".contact-form input"));
      const submitButton = document.querySelector('.contact-form button[type="submit"]');

      if (inputs.length !== 3 || !submitButton) {
        return;
      }

      inputs[0].value = "Grace";
      inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[1].value = "Hopper";
      inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[2].value = "555-0100";
      inputs[2].dispatchEvent(new Event("input", { bubbles: true }));
      submitButton.click();
    }, 0);
  });

  return <CreateContactPage apiClient={apiClient} navigate={navigate} />;
}

export const SubmitPending = {
  render: () => <CreateContactPendingStory />,
};

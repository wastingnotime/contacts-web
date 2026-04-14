import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";

import { App } from "../../src/client/App";

function createStubApiClient(initialContacts = []) {
  const state = {
    contacts: [...initialContacts],
    createError: null,
  };

  return {
    calls: [],
    state,
    async listContacts() {
      this.calls.push({ type: "list" });
      return [...state.contacts];
    },
    async createContact(draft) {
      this.calls.push({ type: "create", draft });
      if (state.createError) {
        throw state.createError;
      }
      const created = {
        id: `contact-${state.contacts.length + 1}`,
        ...draft,
      };
      state.contacts.push(created);
      return created;
    },
  };
}

function mountApp(apiClient, path = "/") {
  window.history.pushState({}, "", path);
  return render(() => <App apiClient={apiClient} />);
}

describe("App", () => {
  it("renders the empty state for the home route", async () => {
    const apiClient = createStubApiClient();
    mountApp(apiClient, "/");

    expect(screen.getByRole("status")).toHaveTextContent("Loading contacts...");

    await screen.findByText("No contacts yet");
    expect(screen.getByRole("button", { name: "Add first contact" })).toBeInTheDocument();
  });

  it("renders listed contacts using the UI model", async () => {
    const apiClient = createStubApiClient([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "+44 20 7946 0991",
      },
    ]);

    mountApp(apiClient, "/");

    await screen.findByText("Ada Lovelace");
    expect(screen.getByText("+44 20 7946 0991")).toBeInTheDocument();
  });

  it("navigates from the empty state to the create page", async () => {
    const apiClient = createStubApiClient();
    mountApp(apiClient, "/");

    await screen.findByText("No contacts yet");
    fireEvent.click(screen.getByRole("button", { name: "Add first contact" }));

    expect(screen.getByRole("heading", { name: "Create contact" })).toBeInTheDocument();
  });

  it("validates required fields before creating a contact", async () => {
    const apiClient = createStubApiClient();
    mountApp(apiClient, "/new");

    fireEvent.click(screen.getByRole("button", { name: "Save contact" }));

    expect(await screen.findByText("First name is required.")).toBeInTheDocument();
    expect(screen.getByText("Last name is required.")).toBeInTheDocument();
    expect(screen.getByText("Phone number is required.")).toBeInTheDocument();
    expect(apiClient.calls).toEqual([]);
  });

  it("creates a contact and returns to the list view", async () => {
    const apiClient = createStubApiClient();
    mountApp(apiClient, "/new");

    fireEvent.input(screen.getByRole("textbox", { name: /first name/i }), {
      target: { value: "Grace" },
    });
    fireEvent.input(screen.getByRole("textbox", { name: /last name/i }), {
      target: { value: "Hopper" },
    });
    fireEvent.input(screen.getByRole("textbox", { name: /phone number/i }), {
      target: { value: "555-0100" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save contact" }));

    await screen.findByRole("heading", { name: "Contacts list" });
    await screen.findByText("Grace Hopper");
    expect(apiClient.calls).toEqual([
      {
        type: "create",
        draft: {
          firstName: "Grace",
          lastName: "Hopper",
          phoneNumber: "555-0100",
        },
      },
      { type: "list" },
    ]);
  });

  it("keeps the user on the form when the backend rejects creation", async () => {
    const apiClient = createStubApiClient();
    apiClient.state.createError = {
      code: "duplicate",
      message: "A contact with this data already exists.",
    };

    mountApp(apiClient, "/new");

    fireEvent.input(screen.getByRole("textbox", { name: /first name/i }), {
      target: { value: "Grace" },
    });
    fireEvent.input(screen.getByRole("textbox", { name: /last name/i }), {
      target: { value: "Hopper" },
    });
    fireEvent.input(screen.getByRole("textbox", { name: /phone number/i }), {
      target: { value: "555-0100" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save contact" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A contact with this data already exists.",
    );
    expect(screen.getByRole("heading", { name: "Create contact" })).toBeInTheDocument();
  });

  it("shows a list error when contacts cannot be loaded", async () => {
    const apiClient = {
      async listContacts() {
        throw new Error("backend unavailable");
      },
      async createContact() {
        throw new Error("not used");
      },
    };

    mountApp(apiClient, "/");

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Unable to load contacts right now.");
    });
  });
});

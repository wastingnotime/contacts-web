import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";

import { App } from "../../src/client/App";

function createStubApiClient(initialContacts = []) {
  const state = {
    contacts: [...initialContacts],
    createError: null,
    getError: null,
    updateError: null,
    deleteError: null,
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
    async getContact(contactId) {
      this.calls.push({ type: "get", contactId });
      if (state.getError) {
        throw state.getError;
      }
      const contact = state.contacts.find((item) => item.id === contactId);
      if (!contact) {
        throw {
          code: "not_found",
          message: "That contact could not be found.",
        };
      }
      return { ...contact };
    },
    async updateContact(contactId, draft) {
      this.calls.push({ type: "update", contactId, draft });
      if (state.updateError) {
        throw state.updateError;
      }
      const index = state.contacts.findIndex((item) => item.id === contactId);
      if (index < 0) {
        throw {
          code: "not_found",
          message: "That contact could not be found.",
        };
      }
      const updated = {
        id: contactId,
        ...draft,
      };
      state.contacts[index] = updated;
      return { ...updated };
    },
    async deleteContact(contactId) {
      this.calls.push({ type: "delete", contactId });
      if (state.deleteError) {
        throw state.deleteError;
      }
      const index = state.contacts.findIndex((item) => item.id === contactId);
      if (index < 0) {
        throw {
          code: "not_found",
          message: "That contact could not be found.",
        };
      }
      state.contacts.splice(index, 1);
      return null;
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
          id: "",
          firstName: "Grace",
          lastName: "Hopper",
          phoneNumber: "555-0100",
        },
      },
      { type: "list" },
    ]);
  });

  it("loads a contact for editing and updates it through the backend adapter", async () => {
    const apiClient = createStubApiClient([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "555-0001",
      },
    ]);

    mountApp(apiClient, "/edit/contact-1");

    expect(await screen.findByRole("status")).toHaveTextContent("Loading contact...");
    expect(await screen.findByRole("heading", { name: "Edit contact" })).toBeInTheDocument();

    expect(screen.getByRole("textbox", { name: /first name/i })).toHaveValue("Ada");
    expect(screen.getByRole("textbox", { name: /last name/i })).toHaveValue("Lovelace");
    expect(screen.getByRole("textbox", { name: /phone number/i })).toHaveValue("555-0001");

    fireEvent.input(screen.getByRole("textbox", { name: /last name/i }), {
      target: { value: "Byron" },
    });
    fireEvent.input(screen.getByRole("textbox", { name: /phone number/i }), {
      target: { value: "555-0009" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await screen.findByRole("heading", { name: "Contacts list" });
    await screen.findByText("Ada Byron");
    expect(apiClient.calls).toEqual([
      { type: "get", contactId: "contact-1" },
      {
        type: "update",
        contactId: "contact-1",
        draft: {
          id: "contact-1",
          firstName: "Ada",
          lastName: "Byron",
          phoneNumber: "555-0009",
        },
      },
      { type: "list" },
    ]);
  });

  it("keeps the edit form on the page when the backend rejects update", async () => {
    const apiClient = createStubApiClient([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "555-0001",
      },
    ]);
    apiClient.state.updateError = {
      code: "not_found",
      message: "That contact could not be found.",
    };

    mountApp(apiClient, "/edit/contact-1");

    await screen.findByRole("heading", { name: "Edit contact" });
    fireEvent.input(screen.getByRole("textbox", { name: /last name/i }), {
      target: { value: "Byron" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("That contact could not be found.");
    expect(screen.getByRole("heading", { name: "Edit contact" })).toBeInTheDocument();
  });

  it("deletes a contact from the list and refreshes the list state", async () => {
    const apiClient = createStubApiClient([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "555-0001",
      },
    ]);

    mountApp(apiClient, "/");

    await screen.findByText("Ada Lovelace");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

    await waitFor(() => {
      expect(screen.getByText("No contacts yet")).toBeInTheDocument();
    });
    expect(apiClient.calls).toEqual([
      { type: "list" },
      { type: "delete", contactId: "contact-1" },
      { type: "list" },
    ]);
  });

  it("asks for delete confirmation before removing a contact", async () => {
    const apiClient = createStubApiClient([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "555-0001",
      },
    ]);

    mountApp(apiClient, "/");

    await screen.findByText("Ada Lovelace");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByRole("status")).toHaveTextContent("Confirm delete?");
    expect(apiClient.calls).toEqual([{ type: "list" }]);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(apiClient.calls).toEqual([{ type: "list" }]);
  });

  it("confirms delete after the browser asks for confirmation", async () => {
    const apiClient = createStubApiClient([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "555-0001",
      },
    ]);

    mountApp(apiClient, "/");

    await screen.findByText("Ada Lovelace");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

    await screen.findByText("No contacts yet");
    expect(apiClient.calls).toEqual([
      { type: "list" },
      { type: "delete", contactId: "contact-1" },
      { type: "list" },
    ]);
  });

  it("shows delete failures without leaving the list view", async () => {
    const apiClient = createStubApiClient([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "555-0001",
      },
    ]);
    apiClient.state.deleteError = {
      code: "authorization",
      message: "You are not allowed to access contacts right now.",
    };

    mountApp(apiClient, "/");

    await screen.findByText("Ada Lovelace");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You are not allowed to access contacts right now.",
    );
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
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

  it("shows an authorization failure distinctly when contact creation is rejected", async () => {
    const apiClient = createStubApiClient();
    apiClient.state.createError = {
      code: "authorization",
      message: "You are not allowed to access contacts right now.",
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
      "You are not allowed to access contacts right now.",
    );
    expect(screen.getByRole("heading", { name: "Create contact" })).toBeInTheDocument();
  });

  it("shows an authorization failure distinctly when contacts cannot be loaded", async () => {
    const apiClient = {
      async listContacts() {
        const error = new Error("You are not allowed to access contacts right now.");
        error.code = "authorization";
        throw error;
      },
      async createContact() {
        throw new Error("not used");
      },
      async getContact() {
        throw new Error("not used");
      },
      async updateContact() {
        throw new Error("not used");
      },
      async deleteContact() {
        throw new Error("not used");
      },
    };

    mountApp(apiClient, "/");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You are not allowed to access contacts right now.",
    );
  });

  it("shows an authorization failure distinctly when contact editing is rejected", async () => {
    const apiClient = createStubApiClient([
      {
        id: "contact-1",
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "555-0001",
      },
    ]);
    apiClient.state.updateError = {
      code: "authorization",
      message: "You are not allowed to access contacts right now.",
    };

    mountApp(apiClient, "/edit/contact-1");

    await screen.findByRole("heading", { name: "Edit contact" });
    fireEvent.input(screen.getByRole("textbox", { name: /last name/i }), {
      target: { value: "Byron" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You are not allowed to access contacts right now.",
    );
    expect(screen.getByRole("heading", { name: "Edit contact" })).toBeInTheDocument();
  });

  it("shows a list error when contacts cannot be loaded", async () => {
    const apiClient = {
      async listContacts() {
        throw new Error("backend unavailable");
      },
      async createContact() {
        throw new Error("not used");
      },
      async getContact() {
        throw new Error("not used");
      },
      async updateContact() {
        throw new Error("not used");
      },
      async deleteContact() {
        throw new Error("not used");
      },
    };

    mountApp(apiClient, "/");

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("backend unavailable");
    });
  });
});

import { fireEvent, render, screen, waitFor, within } from "@solidjs/testing-library";

import { App } from "../../src/client/App";
import { createContactsApiClient } from "../../src/client/api/createContactsApiClient";

function mountIsolatedRuntime(path = "/") {
  return render(() => (
    <App
      apiClient={createContactsApiClient({
        fetchFn: window.fetch.bind(window),
      })}
      runtimeMode="isolated"
      initialPath={path}
    />
  ));
}

describe("isolated mode", () => {
  it("runs list, create, edit, and delete through the isolated transport boundary", async () => {
    mountIsolatedRuntime("/");

    await screen.findByText("Ada Lovelace");
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Create contact" }));

    fireEvent.input(screen.getByRole("textbox", { name: /first name/i }), {
      target: { value: "Katherine" },
    });
    fireEvent.input(screen.getByRole("textbox", { name: /last name/i }), {
      target: { value: "Johnson" },
    });
    fireEvent.input(screen.getByRole("textbox", { name: /phone number/i }), {
      target: { value: "555-0142" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save contact" }));

    await screen.findByText("Katherine Johnson");

    const createdCard = screen.getByText("Katherine Johnson").closest(".contact-card");
    expect(createdCard).not.toBeNull();
    fireEvent.click(within(createdCard).getByRole("button", { name: "Edit" }));

    await screen.findByRole("heading", { name: "Edit contact" });
    await screen.findByRole("textbox", { name: /last name/i });
    fireEvent.input(screen.getByRole("textbox", { name: /last name/i }), {
      target: { value: "Johnson-Smith" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await screen.findByText("Katherine Johnson-Smith");

    const updatedCard = screen
      .getByText("Katherine Johnson-Smith")
      .closest(".contact-card");
    expect(updatedCard).not.toBeNull();
    fireEvent.click(within(updatedCard).getByRole("button", { name: "Delete" }));
    await screen.findByText("Confirm delete?");
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

    await screen.findByText("Ada Lovelace");
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Katherine Johnson-Smith")).not.toBeInTheDocument();
    });
  });
});

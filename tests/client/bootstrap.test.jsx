import { screen } from "@solidjs/testing-library";

import { bootstrapContactsApp } from "../../src/client/bootstrap/bootstrapContactsApp.jsx";

describe("bootstrapContactsApp", () => {
  it("renders a visible failure when isolated mode cannot start", async () => {
    const root = document.createElement("div");
    document.body.append(root);

    await bootstrapContactsApp({
      runtimeMode: "isolated",
      rootElement: root,
      fetchFn: window.fetch.bind(window),
      startMockWorker: async () => {
        throw new Error("mock worker failed to register");
      },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("mock worker failed to register");
    expect(screen.getByRole("heading", { name: "Isolated mode could not start." })).toBeInTheDocument();
  });
});

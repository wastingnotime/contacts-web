import { describe, expect, it } from "vitest";

import { HttpContactsApiClient } from "../../src/client/api/httpContactsApiClient";
import { createContactsApiClient } from "../../src/client/api/createContactsApiClient";

describe("createContactsApiClient", () => {
  it("creates a browser-facing HTTP client by default", () => {
    const apiClient = createContactsApiClient({
      fetchFn: () => Promise.resolve(),
    });

    expect(apiClient).toBeInstanceOf(HttpContactsApiClient);
  });

  it("keeps the HTTP client shape in isolated mode so mock transport can intercept it", () => {
    const apiClient = createContactsApiClient({
      runtimeMode: "isolated",
      fetchFn: () => Promise.resolve(),
    });

    expect(apiClient).toBeInstanceOf(HttpContactsApiClient);
  });
});

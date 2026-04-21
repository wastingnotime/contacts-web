import { describe, expect, it } from "vitest";

import { HttpContactsApiClient } from "../../src/client/api/httpContactsApiClient";
import { IsolatedContactsApiClient } from "../../src/client/api/isolatedContactsApiClient";
import { createContactsApiClient } from "../../src/client/api/createContactsApiClient";

describe("createContactsApiClient", () => {
  it("creates a live HTTP client by default", () => {
    const apiClient = createContactsApiClient({
      fetchFn: () => Promise.resolve(),
    });

    expect(apiClient).toBeInstanceOf(HttpContactsApiClient);
  });

  it("creates a deterministic isolated client when requested", () => {
    const apiClient = createContactsApiClient({
      runtimeMode: "isolated",
    });

    expect(apiClient).toBeInstanceOf(IsolatedContactsApiClient);
  });
});

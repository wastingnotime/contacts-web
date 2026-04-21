import { describe, expect, it } from "vitest";

import {
  DEFAULT_CONTACTS_API_BASE_URL,
  DEFAULT_CONTACTS_UI_MODE,
  resolveContactsApiBaseUrl,
  resolveContactsUiMode,
} from "../../src/client/config";

describe("contacts API base URL config", () => {
  it("defaults browser requests to the same-origin /api path", () => {
    expect(DEFAULT_CONTACTS_API_BASE_URL).toBe("/api");
    expect(resolveContactsApiBaseUrl(undefined)).toBe("/api");
    expect(resolveContactsApiBaseUrl("")).toBe("/api");
  });

  it("keeps an explicit override intact", () => {
    expect(resolveContactsApiBaseUrl("http://0.0.0.0:8010")).toBe("http://0.0.0.0:8010");
  });

  it("defaults the UI runtime to live mode unless isolated is requested", () => {
    expect(DEFAULT_CONTACTS_UI_MODE).toBe("live");
    expect(resolveContactsUiMode(undefined)).toBe("live");
    expect(resolveContactsUiMode("")).toBe("live");
    expect(resolveContactsUiMode("isolated")).toBe("isolated");
    expect(resolveContactsUiMode("integrated-local")).toBe("integrated-local");
  });
});

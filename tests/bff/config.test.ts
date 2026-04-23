import { afterEach, describe, expect, it } from "vitest";

import {
  DEFAULT_CONTACTS_BACKEND_AUTH_ROLES,
  DEFAULT_CONTACTS_BACKEND_AUTH_SUBJECT,
  DEFAULT_CONTACTS_BACKEND_BASE_URL,
  DEFAULT_CONTACTS_WEB_BFF_HOST,
  DEFAULT_CONTACTS_WEB_BFF_PORT,
  getContactsBackendAuthRoles,
  getContactsBackendAuthSubject,
  getContactsBackendBaseUrl,
  getContactsWebBffHost,
  getContactsWebBffPort,
} from "../../apps/bff/src/config.ts";

const ORIGINAL_ENV = {
  CONTACTS_BACKEND_AUTH_ROLES: process.env.CONTACTS_BACKEND_AUTH_ROLES,
  CONTACTS_BACKEND_AUTH_SUBJECT: process.env.CONTACTS_BACKEND_AUTH_SUBJECT,
  CONTACTS_BACKEND_BASE_URL: process.env.CONTACTS_BACKEND_BASE_URL,
  CONTACTS_WEB_BFF_HOST: process.env.CONTACTS_WEB_BFF_HOST,
  CONTACTS_WEB_BFF_PORT: process.env.CONTACTS_WEB_BFF_PORT,
};

afterEach(() => {
  process.env.CONTACTS_BACKEND_AUTH_ROLES = ORIGINAL_ENV.CONTACTS_BACKEND_AUTH_ROLES;
  process.env.CONTACTS_BACKEND_AUTH_SUBJECT = ORIGINAL_ENV.CONTACTS_BACKEND_AUTH_SUBJECT;
  process.env.CONTACTS_BACKEND_BASE_URL = ORIGINAL_ENV.CONTACTS_BACKEND_BASE_URL;
  process.env.CONTACTS_WEB_BFF_HOST = ORIGINAL_ENV.CONTACTS_WEB_BFF_HOST;
  process.env.CONTACTS_WEB_BFF_PORT = ORIGINAL_ENV.CONTACTS_WEB_BFF_PORT;
});

describe("contacts bff config", () => {
  it("defaults the BFF request claims and base URL to explicit local values", () => {
    delete process.env.CONTACTS_BACKEND_AUTH_ROLES;
    delete process.env.CONTACTS_BACKEND_AUTH_SUBJECT;
    delete process.env.CONTACTS_BACKEND_BASE_URL;
    delete process.env.CONTACTS_WEB_BFF_HOST;
    delete process.env.CONTACTS_WEB_BFF_PORT;

    expect(DEFAULT_CONTACTS_BACKEND_AUTH_SUBJECT).toBe("admin-user");
    expect(DEFAULT_CONTACTS_BACKEND_AUTH_ROLES).toBe("admin");
    expect(DEFAULT_CONTACTS_BACKEND_BASE_URL).toBe("http://127.0.0.1:8010");
    expect(DEFAULT_CONTACTS_WEB_BFF_HOST).toBe("0.0.0.0");
    expect(DEFAULT_CONTACTS_WEB_BFF_PORT).toBe(4010);
    expect(getContactsBackendAuthSubject()).toBe("admin-user");
    expect(getContactsBackendAuthRoles()).toBe("admin");
    expect(getContactsBackendBaseUrl()).toBe("http://127.0.0.1:8010");
    expect(getContactsWebBffHost()).toBe("0.0.0.0");
    expect(getContactsWebBffPort()).toBe(4010);
  });

  it("allows the BFF request-claims boundary to be overridden from the environment", () => {
    process.env.CONTACTS_BACKEND_AUTH_SUBJECT = "ops-user";
    process.env.CONTACTS_BACKEND_AUTH_ROLES = "admin,auditor";
    process.env.CONTACTS_BACKEND_BASE_URL = "http://127.0.0.1:9001";
    process.env.CONTACTS_WEB_BFF_HOST = "127.0.0.1";
    process.env.CONTACTS_WEB_BFF_PORT = "4123";

    expect(getContactsBackendAuthSubject()).toBe("ops-user");
    expect(getContactsBackendAuthRoles()).toBe("admin,auditor");
    expect(getContactsBackendBaseUrl()).toBe("http://127.0.0.1:9001");
    expect(getContactsWebBffHost()).toBe("127.0.0.1");
    expect(getContactsWebBffPort()).toBe(4123);
  });
});

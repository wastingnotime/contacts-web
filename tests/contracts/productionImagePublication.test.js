import { describe, expect, it } from "vitest";

import {
  DEFAULT_CONTACTS_WEB_BFF_IMAGE_NAME,
  DEFAULT_CONTACTS_WEB_IMAGE_NAMESPACE,
  DEFAULT_CONTACTS_WEB_IMAGE_TAG,
  DEFAULT_CONTACTS_WEB_SPA_IMAGE_NAME,
  createContactsWebProductionImagePublication,
  resolveContactsWebImageNamespace,
  resolveContactsWebImageTag,
} from "../../src/shared/production/contactsWebImagePublication.js";

describe("contactsWebProductionImagePublication", () => {
  it("publishes distinct SPA and BFF image references", () => {
    const publication = createContactsWebProductionImagePublication();

    expect(DEFAULT_CONTACTS_WEB_IMAGE_NAMESPACE).toBe("contacts-web");
    expect(DEFAULT_CONTACTS_WEB_IMAGE_TAG).toBe("0.1.0");
    expect(DEFAULT_CONTACTS_WEB_SPA_IMAGE_NAME).toBe("spa");
    expect(DEFAULT_CONTACTS_WEB_BFF_IMAGE_NAME).toBe("bff");
    expect(resolveContactsWebImageNamespace(undefined)).toBe("contacts-web");
    expect(resolveContactsWebImageNamespace("public.registry/contacts-web")).toBe(
      "public.registry/contacts-web",
    );
    expect(resolveContactsWebImageTag(undefined)).toBe("0.1.0");
    expect(resolveContactsWebImageTag("2026.04.23")).toBe("2026.04.23");
    expect(publication).toEqual({
      namespace: "contacts-web",
      tag: "0.1.0",
      spaImageName: "spa",
      bffImageName: "bff",
      spaImageRef: "contacts-web/spa:0.1.0",
      bffImageRef: "contacts-web/bff:0.1.0",
    });
    expect(publication.spaImageRef).not.toBe(publication.bffImageRef);
  });

  it("allows the publication handoff to use explicit downstream image coordinates", () => {
    const publication = createContactsWebProductionImagePublication({
      namespace: "ghcr.io/wastingnotime/contacts-web",
      tag: "2026.04.23",
    });

    expect(publication.spaImageRef).toBe("ghcr.io/wastingnotime/contacts-web/spa:2026.04.23");
    expect(publication.bffImageRef).toBe("ghcr.io/wastingnotime/contacts-web/bff:2026.04.23");
  });
});

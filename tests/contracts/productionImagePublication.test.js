import { describe, expect, it } from "vitest";

import {
  DEFAULT_CONTACTS_WEB_BFF_IMAGE_TAG,
  DEFAULT_CONTACTS_WEB_IMAGE_REPOSITORY,
  DEFAULT_CONTACTS_WEB_SPA_IMAGE_TAG,
  createContactsWebProductionImagePublication,
  resolveContactsWebBffImageTag,
  resolveContactsWebImageRepository,
  resolveContactsWebSpaImageTag,
} from "../../src/shared/production/contactsWebImagePublication.js";

describe("contactsWebProductionImagePublication", () => {
  it("publishes a single repository with distinct SPA and BFF tags", () => {
    const publication = createContactsWebProductionImagePublication();

    expect(DEFAULT_CONTACTS_WEB_IMAGE_REPOSITORY).toBe("contacts-web");
    expect(DEFAULT_CONTACTS_WEB_SPA_IMAGE_TAG).toBe("0.1.0");
    expect(DEFAULT_CONTACTS_WEB_BFF_IMAGE_TAG).toBe("bff-latest");
    expect(resolveContactsWebImageRepository(undefined)).toBe("contacts-web");
    expect(resolveContactsWebImageRepository("public.registry/contacts-web")).toBe(
      "public.registry/contacts-web",
    );
    expect(resolveContactsWebSpaImageTag(undefined)).toBe("0.1.0");
    expect(resolveContactsWebSpaImageTag("2026.04.23")).toBe("2026.04.23");
    expect(resolveContactsWebBffImageTag(undefined)).toBe("bff-latest");
    expect(resolveContactsWebBffImageTag("bff-2026.04.23")).toBe("bff-2026.04.23");
    expect(publication).toEqual({
      repository: "contacts-web",
      spaTag: "0.1.0",
      bffTag: "bff-latest",
      spaImageRef: "contacts-web:0.1.0",
      bffImageRef: "contacts-web:bff-latest",
    });
    expect(publication.spaImageRef).not.toBe(publication.bffImageRef);
  });

  it("allows the publication handoff to use explicit downstream image coordinates", () => {
    const publication = createContactsWebProductionImagePublication({
      repository: "590183855481.dkr.ecr.us-east-1.amazonaws.com/contacts-web",
      spaTag: "ffddb17d43a8e74544529ca619d606a0e68c4799",
      bffTag: "bff-latest",
    });

    expect(publication.spaImageRef).toBe(
      "590183855481.dkr.ecr.us-east-1.amazonaws.com/contacts-web:ffddb17d43a8e74544529ca619d606a0e68c4799",
    );
    expect(publication.bffImageRef).toBe(
      "590183855481.dkr.ecr.us-east-1.amazonaws.com/contacts-web:bff-latest",
    );
  });
});

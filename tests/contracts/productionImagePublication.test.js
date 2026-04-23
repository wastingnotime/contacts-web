import { describe, expect, it } from "vitest";

import {
  DEFAULT_CONTACTS_WEB_IMAGE_REPOSITORY,
  createContactsWebProductionImagePublication,
} from "../../src/shared/production/contactsWebImagePublication.js";

describe("contactsWebProductionImagePublication", () => {
  it("publishes a single repository with distinct SPA and BFF SHA tags", () => {
    const publication = createContactsWebProductionImagePublication({
      repository: "contacts-web",
      spaTag: "0.1.0",
      bffTag: "bff-0.1.0",
    });

    expect(DEFAULT_CONTACTS_WEB_IMAGE_REPOSITORY).toBe("contacts-web");
    expect(publication).toEqual({
      repository: "contacts-web",
      spaTag: "0.1.0",
      bffTag: "bff-0.1.0",
      spaImageRef: "contacts-web:0.1.0",
      bffImageRef: "contacts-web:bff-0.1.0",
    });
    expect(publication.spaImageRef).not.toBe(publication.bffImageRef);
  });

  it("allows the publication handoff to use explicit downstream image coordinates", () => {
    const publication = createContactsWebProductionImagePublication({
      repository: "590183855481.dkr.ecr.us-east-1.amazonaws.com/contacts-web",
      spaTag: "ffddb17d43a8e74544529ca619d606a0e68c4799",
      bffTag: "bff-ffddb17d43a8e74544529ca619d606a0e68c4799",
    });

    expect(publication.spaImageRef).toBe(
      "590183855481.dkr.ecr.us-east-1.amazonaws.com/contacts-web:ffddb17d43a8e74544529ca619d606a0e68c4799",
    );
    expect(publication.bffImageRef).toBe(
      "590183855481.dkr.ecr.us-east-1.amazonaws.com/contacts-web:bff-ffddb17d43a8e74544529ca619d606a0e68c4799",
    );
  });
});

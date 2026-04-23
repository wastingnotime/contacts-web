import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createContactsWebProductionImagePublication } from "../../src/shared/production/contactsWebImagePublication.js";
import {
  DEFAULT_CONTACTS_WEB_PUBLICATION_PATH,
  resolveContactsWebPublicationPath,
  writeContactsWebProductionImagePublication,
} from "../../src/shared/production/publishContactsWebImagePublication.js";

describe("contactsWebProductionImagePublicationWriter", () => {
  it("writes a stable manifest file for downstream infra consumption", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "contacts-web-publication-"));
    const publication = createContactsWebProductionImagePublication({
      repository: "590183855481.dkr.ecr.us-east-1.amazonaws.com/contacts-web",
      spaTag: "ffddb17d43a8e74544529ca619d606a0e68c4799",
      bffTag: "bff-ffddb17d43a8e74544529ca619d606a0e68c4799",
    });

    const result = await writeContactsWebProductionImagePublication({
      cwd,
      publication,
    });

    expect(DEFAULT_CONTACTS_WEB_PUBLICATION_PATH).toBe(
      "work/publications/contacts_web_image_publication.json",
    );
    expect(resolveContactsWebPublicationPath(undefined)).toBe(
      "work/publications/contacts_web_image_publication.json",
    );
    expect(result.outputPath).toBe("work/publications/contacts_web_image_publication.json");
    expect(await readFile(result.absolutePath, "utf8")).toBe(result.content);
    expect(JSON.parse(result.content)).toEqual(publication);
  });
});

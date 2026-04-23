import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export const DEFAULT_CONTACTS_WEB_PUBLICATION_PATH =
  "work/publications/contacts_web_image_publication.json";

export function resolveContactsWebPublicationPath(value) {
  return value || DEFAULT_CONTACTS_WEB_PUBLICATION_PATH;
}

export async function writeContactsWebProductionImagePublication({
  publication,
  outputPath = resolveContactsWebPublicationPath(process.env.CONTACTS_WEB_IMAGE_PUBLICATION_PATH),
  cwd = process.cwd(),
} = {}) {
  if (!publication) {
    throw new Error("publication is required");
  }

  const absolutePath = resolve(cwd, outputPath);
  await mkdir(dirname(absolutePath), { recursive: true });
  const content = `${JSON.stringify(publication, null, 2)}\n`;
  await writeFile(absolutePath, content, "utf8");

  return {
    outputPath,
    absolutePath,
    publication,
    content,
  };
}

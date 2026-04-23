export const DEFAULT_CONTACTS_WEB_IMAGE_REPOSITORY = "contacts-web";

export function createContactsWebProductionImagePublication({
  repository = process.env.CONTACTS_WEB_IMAGE_REPOSITORY || DEFAULT_CONTACTS_WEB_IMAGE_REPOSITORY,
  spaTag = process.env.CONTACTS_WEB_SPA_IMAGE_TAG,
  bffTag = process.env.CONTACTS_WEB_BFF_IMAGE_TAG,
} = {}) {
  if (!spaTag) {
    throw new Error("CONTACTS_WEB_SPA_IMAGE_TAG is required");
  }

  if (!bffTag) {
    throw new Error("CONTACTS_WEB_BFF_IMAGE_TAG is required");
  }

  const spaImageRef = `${repository}:${spaTag}`;
  const bffImageRef = `${repository}:${bffTag}`;

  return {
    repository,
    spaTag,
    bffTag,
    spaImageRef,
    bffImageRef,
  };
}

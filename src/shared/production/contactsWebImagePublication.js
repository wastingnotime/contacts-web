export const DEFAULT_CONTACTS_WEB_IMAGE_REPOSITORY = "contacts-web";
export const DEFAULT_CONTACTS_WEB_SPA_IMAGE_TAG = "0.1.0";
export const DEFAULT_CONTACTS_WEB_BFF_IMAGE_TAG = "bff-latest";

export function resolveContactsWebImageRepository(value) {
  return value || DEFAULT_CONTACTS_WEB_IMAGE_REPOSITORY;
}

export function resolveContactsWebSpaImageTag(value) {
  return value || DEFAULT_CONTACTS_WEB_SPA_IMAGE_TAG;
}

export function resolveContactsWebBffImageTag(value) {
  return value || DEFAULT_CONTACTS_WEB_BFF_IMAGE_TAG;
}

export function createContactsWebProductionImagePublication({
  repository = resolveContactsWebImageRepository(process.env.CONTACTS_WEB_IMAGE_REPOSITORY),
  spaTag = resolveContactsWebSpaImageTag(process.env.CONTACTS_WEB_SPA_IMAGE_TAG),
  bffTag = resolveContactsWebBffImageTag(process.env.CONTACTS_WEB_BFF_IMAGE_TAG),
} = {}) {
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

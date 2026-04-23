export const DEFAULT_CONTACTS_WEB_IMAGE_NAMESPACE = "contacts-web";
export const DEFAULT_CONTACTS_WEB_IMAGE_TAG = "0.1.0";
export const DEFAULT_CONTACTS_WEB_SPA_IMAGE_NAME = "spa";
export const DEFAULT_CONTACTS_WEB_BFF_IMAGE_NAME = "bff";

export function resolveContactsWebImageNamespace(value) {
  return value || DEFAULT_CONTACTS_WEB_IMAGE_NAMESPACE;
}

export function resolveContactsWebImageTag(value) {
  return value || DEFAULT_CONTACTS_WEB_IMAGE_TAG;
}

export function createContactsWebProductionImagePublication({
  namespace = resolveContactsWebImageNamespace(process.env.CONTACTS_WEB_IMAGE_NAMESPACE),
  tag = resolveContactsWebImageTag(process.env.CONTACTS_WEB_IMAGE_TAG),
  spaImageName = DEFAULT_CONTACTS_WEB_SPA_IMAGE_NAME,
  bffImageName = DEFAULT_CONTACTS_WEB_BFF_IMAGE_NAME,
} = {}) {
  const spaImageRef = `${namespace}/${spaImageName}:${tag}`;
  const bffImageRef = `${namespace}/${bffImageName}:${tag}`;

  return {
    namespace,
    tag,
    spaImageName,
    bffImageName,
    spaImageRef,
    bffImageRef,
  };
}

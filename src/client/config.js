export const DEFAULT_CONTACTS_API_BASE_URL = "/api";
export const DEFAULT_CONTACTS_API_AUTH_SUBJECT = "admin-user";
export const DEFAULT_CONTACTS_API_AUTH_ROLES = "admin";
export const DEFAULT_CONTACTS_UI_MODE = "live";

export function resolveContactsApiBaseUrl(value) {
  return value || DEFAULT_CONTACTS_API_BASE_URL;
}

export function getContactsApiBaseUrl() {
  return resolveContactsApiBaseUrl(import.meta.env.VITE_CONTACTS_API_BASE_URL);
}

export function getContactsApiAuthSubject() {
  return import.meta.env.VITE_CONTACTS_API_AUTH_SUBJECT || DEFAULT_CONTACTS_API_AUTH_SUBJECT;
}

export function getContactsApiAuthRoles() {
  return import.meta.env.VITE_CONTACTS_API_AUTH_ROLES || DEFAULT_CONTACTS_API_AUTH_ROLES;
}

export function resolveContactsUiMode(value) {
  if (value === "isolated" || value === "integrated-local") {
    return value;
  }

  return DEFAULT_CONTACTS_UI_MODE;
}

export function getContactsUiMode() {
  return resolveContactsUiMode(import.meta.env.VITE_CONTACTS_UI_MODE);
}

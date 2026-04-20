export const DEFAULT_CONTACTS_API_BASE_URL = "/api";
export const DEFAULT_CONTACTS_API_AUTH_SUBJECT = "admin-user";
export const DEFAULT_CONTACTS_API_AUTH_ROLES = "admin";

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

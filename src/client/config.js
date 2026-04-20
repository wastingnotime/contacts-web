export const DEFAULT_CONTACTS_API_BASE_URL = "http://0.0.0.0:8010";
export const DEFAULT_CONTACTS_API_AUTH_SUBJECT = "admin-user";
export const DEFAULT_CONTACTS_API_AUTH_ROLES = "admin";

export function getContactsApiBaseUrl() {
  return import.meta.env.VITE_CONTACTS_API_BASE_URL || DEFAULT_CONTACTS_API_BASE_URL;
}

export function getContactsApiAuthSubject() {
  return import.meta.env.VITE_CONTACTS_API_AUTH_SUBJECT || DEFAULT_CONTACTS_API_AUTH_SUBJECT;
}

export function getContactsApiAuthRoles() {
  return import.meta.env.VITE_CONTACTS_API_AUTH_ROLES || DEFAULT_CONTACTS_API_AUTH_ROLES;
}

export const DEFAULT_CONTACTS_WEB_BFF_PORT = 4010;
export const DEFAULT_CONTACTS_BACKEND_BASE_URL = "http://127.0.0.1:8010";
export const DEFAULT_CONTACTS_BACKEND_AUTH_SUBJECT = "admin-user";
export const DEFAULT_CONTACTS_BACKEND_AUTH_ROLES = "admin";

export function getContactsWebBffPort() {
  return Number(process.env.CONTACTS_WEB_BFF_PORT || DEFAULT_CONTACTS_WEB_BFF_PORT);
}

export function getContactsBackendBaseUrl() {
  return process.env.CONTACTS_BACKEND_BASE_URL || DEFAULT_CONTACTS_BACKEND_BASE_URL;
}

export function getContactsBackendAuthSubject() {
  return process.env.CONTACTS_BACKEND_AUTH_SUBJECT || DEFAULT_CONTACTS_BACKEND_AUTH_SUBJECT;
}

export function getContactsBackendAuthRoles() {
  return process.env.CONTACTS_BACKEND_AUTH_ROLES || DEFAULT_CONTACTS_BACKEND_AUTH_ROLES;
}

export const DEFAULT_CONTACTS_WEB_BFF_HOST = "0.0.0.0";
export const DEFAULT_CONTACTS_WEB_BFF_PORT = 4010;
export const DEFAULT_CONTACTS_BACKEND_BASE_URL = "http://127.0.0.1:8010";
export const DEFAULT_CONTACTS_TELEMETRY_COLLECTOR_BASE_URL = "http://127.0.0.1:4321";
export const DEFAULT_CONTACTS_BACKEND_AUTH_SUBJECT = "admin-user";
export const DEFAULT_CONTACTS_BACKEND_AUTH_ROLES = "admin";

export function getContactsWebBffHost() {
  return process.env.CONTACTS_WEB_BFF_HOST || DEFAULT_CONTACTS_WEB_BFF_HOST;
}

export function getContactsWebBffPort() {
  return Number(process.env.CONTACTS_WEB_BFF_PORT || DEFAULT_CONTACTS_WEB_BFF_PORT);
}

export function getContactsBackendBaseUrl() {
  return process.env.CONTACTS_BACKEND_BASE_URL || DEFAULT_CONTACTS_BACKEND_BASE_URL;
}

export function getContactsTelemetryCollectorBaseUrl() {
  return (
    process.env.CONTACTS_TELEMETRY_COLLECTOR_BASE_URL ||
    DEFAULT_CONTACTS_TELEMETRY_COLLECTOR_BASE_URL
  );
}

export function getContactsBackendAuthSubject() {
  return process.env.CONTACTS_BACKEND_AUTH_SUBJECT || DEFAULT_CONTACTS_BACKEND_AUTH_SUBJECT;
}

export function getContactsBackendAuthRoles() {
  return process.env.CONTACTS_BACKEND_AUTH_ROLES || DEFAULT_CONTACTS_BACKEND_AUTH_ROLES;
}

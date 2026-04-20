export const DEFAULT_CONTACTS_API_BASE_URL = "http://0.0.0.0:8010";

export function getContactsApiBaseUrl() {
  return import.meta.env.VITE_CONTACTS_API_BASE_URL || DEFAULT_CONTACTS_API_BASE_URL;
}

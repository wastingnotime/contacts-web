import { HttpContactsApiClient } from "./httpContactsApiClient";
import { IsolatedContactsApiClient } from "./isolatedContactsApiClient";
import {
  getContactsApiAuthRoles,
  getContactsApiAuthSubject,
  getContactsApiBaseUrl,
  getContactsUiMode,
} from "../config";

export function createContactsApiClient({
  runtimeMode,
  baseUrl,
  authSubject,
  authRoles,
  fetchFn,
  isolatedContacts,
} = {}) {
  const selectedRuntimeMode = runtimeMode ?? getContactsUiMode();

  if (selectedRuntimeMode === "isolated") {
    return new IsolatedContactsApiClient({
      initialContacts: isolatedContacts,
    });
  }

  const selectedBaseUrl = baseUrl ?? getContactsApiBaseUrl();
  const selectedAuthSubject = authSubject ?? getContactsApiAuthSubject();
  const selectedAuthRoles = authRoles ?? getContactsApiAuthRoles();
  const selectedFetchFn = fetchFn ?? window.fetch.bind(window);

  return new HttpContactsApiClient({
    baseUrl: selectedBaseUrl,
    authSubject: selectedAuthSubject,
    authRoles: selectedAuthRoles,
    fetchFn: selectedFetchFn,
  });
}

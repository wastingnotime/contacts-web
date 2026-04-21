import { HttpContactsApiClient } from "./httpContactsApiClient";
import {
  getContactsApiAuthRoles,
  getContactsApiAuthSubject,
  getContactsApiBaseUrl,
} from "../config";

export function createContactsApiClient({
  baseUrl,
  authSubject,
  authRoles,
  fetchFn,
} = {}) {
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

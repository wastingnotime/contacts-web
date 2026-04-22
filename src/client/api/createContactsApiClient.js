import { HttpContactsApiClient } from "./httpContactsApiClient";
import { getContactsApiBaseUrl } from "../config";

export function createContactsApiClient({
  baseUrl,
  fetchFn,
} = {}) {
  const selectedBaseUrl = baseUrl ?? getContactsApiBaseUrl();
  const selectedFetchFn = fetchFn ?? window.fetch.bind(window);

  return new HttpContactsApiClient({
    baseUrl: selectedBaseUrl,
    fetchFn: selectedFetchFn,
  });
}

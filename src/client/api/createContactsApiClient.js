import { HttpContactsApiClient } from "./httpContactsApiClient";
import { getContactsApiBaseUrl } from "../config";
import { createContactsTelemetryContext } from "../../shared/telemetry/contactsTelemetry";

export function createContactsApiClient({
  baseUrl,
  fetchFn,
  telemetryContext,
} = {}) {
  const selectedBaseUrl = baseUrl ?? getContactsApiBaseUrl();
  const selectedFetchFn = fetchFn ?? window.fetch.bind(window);
  const selectedTelemetryContext =
    telemetryContext ?? createContactsTelemetryContext({
      serviceName: "contacts-spa",
      featureName: "contacts-web",
    });

  return new HttpContactsApiClient({
    baseUrl: selectedBaseUrl,
    fetchFn: selectedFetchFn,
    telemetryContext: selectedTelemetryContext,
  });
}

import { render } from "solid-js/web";

import { App } from "../App";
import { createContactsApiClient } from "../api/createContactsApiClient";
import { getContactsUiMode } from "../config";
import { ContactsBootstrapFailure } from "./ContactsBootstrapFailure";
import { createContactsTelemetryContext } from "../../shared/telemetry/contactsTelemetry";

function resolveBootstrapErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to start isolated mode right now.";
}

export async function bootstrapContactsApp({
  runtimeMode = getContactsUiMode(),
  createApiClient = createContactsApiClient,
  startMockWorker,
  rootElement = document.getElementById("root"),
  fetchFn = window.fetch.bind(window),
} = {}) {
  if (!rootElement) {
    throw new Error("Missing root element for contacts bootstrap.");
  }

  if (runtimeMode === "isolated") {
    try {
      const resolvedStartMockWorker =
        startMockWorker ??
        (await import("../mock/contactsMockWorker")).startContactsMockWorker;

      await resolvedStartMockWorker();
    } catch (error) {
      render(
        () => <ContactsBootstrapFailure message={resolveBootstrapErrorMessage(error)} />,
        rootElement,
      );
      return { status: "failed" };
    }
  }

  const apiClient = createApiClient({
    fetchFn,
    telemetryContext: createContactsTelemetryContext({
      serviceName: "contacts-spa",
      featureName: "contacts-web",
      appVersion: import.meta.env.VITE_APP_VERSION ?? "dev",
      environment: import.meta.env.MODE ?? "local",
    }),
  });

  render(
    () => <App apiClient={apiClient} runtimeMode={runtimeMode} />,
    rootElement,
  );

  if (typeof apiClient.recordTelemetry === "function") {
    void apiClient.recordTelemetry("page_view", {
      path: window.location.pathname,
      method: "GET",
      statusCode: 200,
    });
  }

  return { status: "ready" };
}

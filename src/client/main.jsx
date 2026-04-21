import { render } from "solid-js/web";

import { App } from "./App";
import { createContactsApiClient } from "./api/createContactsApiClient";
import { getContactsUiMode } from "./config";
import { startContactsMockWorker } from "./mock/contactsMockWorker";

async function bootstrap() {
  const runtimeMode = getContactsUiMode();

  if (runtimeMode === "isolated") {
    await startContactsMockWorker();
  }

  const apiClient = createContactsApiClient({
    fetchFn: window.fetch.bind(window),
  });

  render(
    () => <App apiClient={apiClient} runtimeMode={runtimeMode} />,
    document.getElementById("root"),
  );
}

bootstrap();

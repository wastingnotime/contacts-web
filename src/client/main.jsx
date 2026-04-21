import { render } from "solid-js/web";

import { App } from "./App";
import { createContactsApiClient } from "./api/createContactsApiClient";
import { getContactsUiMode } from "./config";

const runtimeMode = getContactsUiMode();
const apiClient = createContactsApiClient({
  runtimeMode,
  fetchFn: window.fetch.bind(window),
});

render(
  () => <App apiClient={apiClient} runtimeMode={runtimeMode} />,
  document.getElementById("root"),
);

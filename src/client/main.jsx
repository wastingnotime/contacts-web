import { render } from "solid-js/web";

import { App } from "./App";
import { HttpContactsApiClient } from "./api/httpContactsApiClient";
import { getContactsApiBaseUrl } from "./config";

const apiClient = new HttpContactsApiClient({
  baseUrl: getContactsApiBaseUrl(),
  fetchFn: window.fetch.bind(window),
});

render(() => <App apiClient={apiClient} />, document.getElementById("root"));

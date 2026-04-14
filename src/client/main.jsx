import { render } from "solid-js/web";

import { App } from "./App";
import { HttpContactsApiClient } from "./api/httpContactsApiClient";

const apiClient = new HttpContactsApiClient({
  baseUrl: "",
  fetchFn: window.fetch.bind(window),
});

render(() => <App apiClient={apiClient} />, document.getElementById("root"));

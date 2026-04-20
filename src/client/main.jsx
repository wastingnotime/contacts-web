import { render } from "solid-js/web";

import { App } from "./App";
import { HttpContactsApiClient } from "./api/httpContactsApiClient";
import {
  getContactsApiAuthRoles,
  getContactsApiAuthSubject,
  getContactsApiBaseUrl,
} from "./config";

const apiClient = new HttpContactsApiClient({
  baseUrl: getContactsApiBaseUrl(),
  authSubject: getContactsApiAuthSubject(),
  authRoles: getContactsApiAuthRoles(),
  fetchFn: window.fetch.bind(window),
});

render(() => <App apiClient={apiClient} />, document.getElementById("root"));

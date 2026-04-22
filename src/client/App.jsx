import { createSignal, onCleanup, onMount } from "solid-js";

import { ContactsListPage } from "./pages/ContactsListPage";
import { CreateContactPage } from "./pages/CreateContactPage";
import { EditContactPage } from "./pages/EditContactPage";

function currentPath() {
  return window.location.pathname || "/";
}

function routeFromPath(pathname) {
  if (pathname.startsWith("/new")) {
    return { name: "create" };
  }

  if (pathname.startsWith("/edit/")) {
    return {
      name: "edit",
      contactId: decodeURIComponent(pathname.slice("/edit/".length)),
    };
  }

  return { name: "list" };
}

export function App(props) {
  const [path, setPath] = createSignal(props.initialPath ?? currentPath());
  const recordRouteTelemetry = (nextPath) => {
    if (typeof props.apiClient?.recordTelemetry !== "function") {
      return;
    }

    void props.apiClient.recordTelemetry("route_change", {
      path: nextPath,
      method: "GET",
      statusCode: 200,
    });
  };

  const runtimeModeLabel = () => {
    if (props.runtimeMode === "isolated") {
      return "Isolated mode";
    }

    if (props.runtimeMode === "integrated-local") {
      return "Integrated local mode";
    }

    return "Live mode";
  };

  const runtimeBadgeClass = () => {
    if (props.runtimeMode === "isolated") {
      return "runtime-badge-isolated";
    }

    if (props.runtimeMode === "integrated-local") {
      return "runtime-badge-integrated-local";
    }

    return "runtime-badge-live";
  };

  const handlePopState = () => {
    const nextPath = currentPath();
    setPath(nextPath);
    recordRouteTelemetry(nextPath);
  };

  onMount(() => {
    window.addEventListener("popstate", handlePopState);
  });

  onCleanup(() => {
    window.removeEventListener("popstate", handlePopState);
  });

  const navigate = (nextPath) => {
    if (nextPath === path()) {
      return;
    }
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    recordRouteTelemetry(nextPath);
  };

  const route = () => routeFromPath(path());

  return (
    <main class="app-shell">
      <header class="hero">
        <p class="eyebrow">Contacts</p>
        <p class={`runtime-badge ${runtimeBadgeClass()}`}>{runtimeModeLabel()}</p>
        <h1>Browser workflow for the contacts experience.</h1>
      </header>
      {route().name === "create" ? (
        <CreateContactPage apiClient={props.apiClient} navigate={navigate} />
      ) : route().name === "edit" ? (
        <EditContactPage
          apiClient={props.apiClient}
          contactId={route().contactId}
          navigate={navigate}
        />
      ) : (
        <ContactsListPage apiClient={props.apiClient} navigate={navigate} />
      )}
    </main>
  );
}

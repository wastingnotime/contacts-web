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

  const handlePopState = () => {
    setPath(currentPath());
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
  };

  const route = () => routeFromPath(path());

  return (
    <main class="app-shell">
      <header class="hero">
        <p class="eyebrow">Contacts</p>
        <p class={`runtime-badge ${props.runtimeMode === "isolated" ? "runtime-badge-isolated" : "runtime-badge-live"}`}>
          {props.runtimeMode === "isolated" ? "Isolated mode" : "Live mode"}
        </p>
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

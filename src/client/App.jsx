import { createSignal, onCleanup, onMount } from "solid-js";

import { ContactsListPage } from "./pages/ContactsListPage";
import { CreateContactPage } from "./pages/CreateContactPage";

function currentPath() {
  return window.location.pathname || "/";
}

export function App(props) {
  const [path, setPath] = createSignal(currentPath());

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

  return (
    <main class="app-shell">
      <header class="hero">
        <p class="eyebrow">Contacts</p>
        <h1>Browser workflow for the contacts experience.</h1>
      </header>
      {path() === "/new" ? (
        <CreateContactPage apiClient={props.apiClient} navigate={navigate} />
      ) : (
        <ContactsListPage apiClient={props.apiClient} navigate={navigate} />
      )}
    </main>
  );
}

import { For, Show, createResource } from "solid-js";

function ContactListItem(props) {
  return (
    <li class="contact-card">
      <div>
        <h3>{props.contact.firstName} {props.contact.lastName}</h3>
        <p>{props.contact.phoneNumber}</p>
      </div>
    </li>
  );
}

export function ContactsListPage(props) {
  const [contacts] = createResource(() => props.apiClient.listContacts());

  return (
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Contacts list</h2>
          <p>Current contacts loaded from the backend boundary.</p>
        </div>
        <button class="primary-button" type="button" onClick={() => props.navigate("/new")}>
          Create contact
        </button>
      </div>

      <Show when={contacts.loading}>
        <p role="status">Loading contacts...</p>
      </Show>

      <Show when={contacts.error}>
        <div class="error-banner" role="alert">
          Unable to load contacts right now.
        </div>
      </Show>

      <Show when={!contacts.loading && !contacts.error && contacts()?.length === 0}>
        <section class="empty-state">
          <h3>No contacts yet</h3>
          <p>Create the first contact to seed the directory.</p>
          <button class="secondary-button" type="button" onClick={() => props.navigate("/new")}>
            Add first contact
          </button>
        </section>
      </Show>

      <Show when={!contacts.loading && !contacts.error && (contacts()?.length ?? 0) > 0}>
        <ul class="contact-list">
          <For each={contacts()}>
            {(contact) => <ContactListItem contact={contact} />}
          </For>
        </ul>
      </Show>
    </section>
  );
}

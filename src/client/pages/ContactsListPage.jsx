import { For, Show, createResource, createSignal } from "solid-js";

import { getContactErrorMessage } from "../contracts/contactErrors";

function ContactListItem(props) {
  return (
    <li class="contact-card">
      <div>
        <h3>{props.contact.firstName} {props.contact.lastName}</h3>
        <p>{props.contact.phoneNumber}</p>
      </div>
      <div class="contact-card-actions">
        <button
          class="secondary-button"
          type="button"
          onClick={() => props.onEdit(props.contact.id)}
        >
          Edit
        </button>
        <Show when={!props.confirmationActive} fallback={
          <div class="delete-confirmation">
            <p role="status">
              {props.deleting ? "Deleting contact..." : "Confirm delete?"}
            </p>
            <div class="form-actions">
              <button
                class="danger-button"
                type="button"
                disabled={props.deleting}
                onClick={() => props.onConfirmDelete(props.contact.id)}
              >
                {props.deleting ? "Deleting..." : "Confirm delete"}
              </button>
              <button
                class="ghost-button"
                type="button"
                disabled={props.deleting}
                onClick={props.onCancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        }>
          <button
            class="ghost-button danger-button"
            type="button"
            disabled={props.deleting}
            onClick={() => props.onDelete(props.contact.id)}
          >
            Delete
          </button>
        </Show>
      </div>
    </li>
  );
}

export function ContactsListPage(props) {
  const [deleteError, setDeleteError] = createSignal("");
  const [deletingContactId, setDeletingContactId] = createSignal("");
  const [deleteConfirmationContactId, setDeleteConfirmationContactId] = createSignal("");
  const [contacts, { refetch }] = createResource(
    () => props.apiClient,
    (apiClient) => apiClient.listContacts(),
  );

  const deleteContact = async (contactId) => {
    setDeleteError("");
    setDeletingContactId(contactId);
    try {
      await props.apiClient.deleteContact(contactId);
      await refetch();
    } catch (error) {
      if (error && typeof error === "object" && "message" in error && error.message) {
        setDeleteError(error.message);
      } else {
        setDeleteError("Unable to delete contact right now.");
      }
    } finally {
      setDeletingContactId("");
      setDeleteConfirmationContactId("");
    }
  };

  const confirmDelete = (contactId) => {
    setDeleteError("");
    setDeleteConfirmationContactId(contactId);
  };

  const cancelDelete = () => {
    setDeleteConfirmationContactId("");
  };

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
          {getContactErrorMessage(contacts.error, "Unable to load contacts right now.")}
        </div>
      </Show>

      <Show when={deleteError()}>
        <div class="error-banner" role="alert">
          {deleteError()}
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
            {(contact) => (
              <ContactListItem
                contact={contact}
                deleting={deletingContactId() === contact.id}
                confirmationActive={deleteConfirmationContactId() === contact.id}
                onCancelDelete={cancelDelete}
                onConfirmDelete={deleteContact}
                onDelete={confirmDelete}
                onEdit={(contactId) => props.navigate(`/edit/${encodeURIComponent(contactId)}`)}
              />
            )}
          </For>
        </ul>
      </Show>
    </section>
  );
}

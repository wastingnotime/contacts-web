import { Show, createEffect, createResource, createSignal } from "solid-js";

import { ContactFormFields } from "../components/ContactFormFields";
import {
  createEmptyContactDraft,
  createContactDraftFromViewModel,
  validateContactDraft,
} from "../models/contact";

function getContactErrorMessage(error) {
  if (error && typeof error === "object" && "message" in error && error.message) {
    return error.message;
  }

  return "Unable to load contact right now.";
}

export function EditContactPage(props) {
  const [draft, setDraft] = createSignal(createEmptyContactDraft());
  const [errors, setErrors] = createSignal({});
  const [formError, setFormError] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const [contact] = createResource(
    () => props.contactId,
    (contactId) => props.apiClient.getContact(contactId),
  );

  createEffect(() => {
    const loadedContact = contact();
    if (loadedContact) {
      setDraft(createContactDraftFromViewModel(loadedContact));
      setErrors({});
      setFormError("");
    }
  });

  const updateField = (fieldName, value) => {
    setDraft((current) => ({ ...current, [fieldName]: value }));
    setErrors((current) => ({ ...current, [fieldName]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const currentDraft = draft();
    const nextErrors = validateContactDraft(currentDraft);
    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await props.apiClient.updateContact(props.contactId, currentDraft);
      props.navigate("/");
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        ["validation", "duplicate", "authorization", "not_found"].includes(error.code)
      ) {
        setFormError(error.message);
      } else {
        setFormError("Unable to update contact right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Edit contact</h2>
          <p>Load the record, update the fields, and submit through the backend adapter.</p>
        </div>
        <button class="ghost-button" type="button" onClick={() => props.navigate("/")}>
          Back to list
        </button>
      </div>

      <Show when={contact.loading}>
        <p role="status">Loading contact...</p>
      </Show>

      <Show when={contact.error}>
        <div class="error-banner" role="alert">
          {getContactErrorMessage(contact.error)}
        </div>
      </Show>

      <Show when={!contact.loading && !contact.error && contact()}>
        <form class="contact-form" onSubmit={submit}>
          <ContactFormFields
            draft={draft()}
            errors={errors()}
            disabled={isSubmitting()}
            onFieldChange={updateField}
          />

          <Show when={formError()}>
            <div class="error-banner" role="alert">
              {formError()}
            </div>
          </Show>

          <div class="form-actions">
            <button class="primary-button" type="submit" disabled={isSubmitting()}>
              {isSubmitting() ? "Saving..." : "Save changes"}
            </button>
            <button class="ghost-button" type="button" onClick={() => props.navigate("/")}>
              Cancel
            </button>
          </div>
        </form>
      </Show>
    </section>
  );
}

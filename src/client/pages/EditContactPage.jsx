import { Show, createEffect, createResource, createSignal } from "solid-js";

import { ContactFormFields } from "../components/ContactFormFields";
import { getContactErrorMessage } from "../contracts/contactErrors";
import {
  createEmptyContactDraft,
  createContactDraftFromViewModel,
  validateContactDraft,
} from "../models/contact";

export function EditContactPage(props) {
  const [draft, setDraft] = createSignal(createEmptyContactDraft());
  const [errors, setErrors] = createSignal({});
  const [formError, setFormError] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const [contact] = createResource(
    () => props.contactId,
    async (contactId) => {
      try {
        return await props.apiClient.getContact(contactId);
      } catch (error) {
        if (error && typeof error === "object" && error.code === "not_found") {
          return {
            missingRecord: true,
          };
        }

        throw error;
      }
    },
  );

  createEffect(() => {
    const loadedContact = contact();
    if (loadedContact && !loadedContact.missingRecord) {
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
      setFormError(getContactErrorMessage(error, "Unable to update contact right now."));
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
        <button
          class="ghost-button"
          type="button"
          disabled={isSubmitting()}
          onClick={() => props.navigate("/")}
        >
          Back to list
        </button>
      </div>

      <Show when={contact.loading}>
        <p role="status">Loading contact...</p>
      </Show>

      <Show when={contact()?.missingRecord}>
        <section class="empty-state" role="alert">
          <h3>Contact no longer exists</h3>
          <p>The edit route is stale or the contact has already been removed.</p>
          <button class="secondary-button" type="button" onClick={() => props.navigate("/")}>
            Back to list
          </button>
        </section>
      </Show>

      <Show when={contact.error}>
        <div class="error-banner" role="alert">
          {getContactErrorMessage(contact.error)}
        </div>
      </Show>

      <Show when={!contact.loading && !contact.error && contact() && !contact()?.missingRecord}>
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

          <Show when={isSubmitting()}>
            <p role="status">Saving changes...</p>
          </Show>

          <div class="form-actions">
            <button class="primary-button" type="submit" disabled={isSubmitting()}>
              {isSubmitting() ? "Saving..." : "Save changes"}
            </button>
            <button
              class="ghost-button"
              type="button"
              disabled={isSubmitting()}
              onClick={() => props.navigate("/")}
            >
              Cancel
            </button>
          </div>
        </form>
      </Show>
    </section>
  );
}

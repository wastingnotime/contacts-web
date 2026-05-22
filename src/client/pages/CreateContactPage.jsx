import { Show, createSignal } from "solid-js";

import { ContactFormFields } from "../components/ContactFormFields";
import { getContactErrorMessage } from "../contracts/contactErrors";
import { createEmptyContactDraft, validateContactDraft } from "../models/contact";
import { logRuntimeEvent } from "../logging/runtimeLogs";

export function CreateContactPage(props) {
  const [draft, setDraft] = createSignal(createEmptyContactDraft());
  const [errors, setErrors] = createSignal({});
  const [formError, setFormError] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);

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
      await props.apiClient.createContact(currentDraft);
      logRuntimeEvent("contact_create_success", {
        path: "/new",
        runtimeMode: props.runtimeMode ?? "live",
      });
      props.navigate("/");
    } catch (error) {
      logRuntimeEvent("contact_create_failure", {
        path: "/new",
        runtimeMode: props.runtimeMode ?? "live",
        error: getContactErrorMessage(error, "Unable to save contact right now."),
      });
      setFormError(getContactErrorMessage(error, "Unable to save contact right now."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Create contact</h2>
          <p>Enter the required fields and submit them through the backend adapter.</p>
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
          <p role="status">Saving contact...</p>
        </Show>

        <button
          class="primary-button"
          type="submit"
          disabled={isSubmitting()}
        >
          {isSubmitting() ? "Saving..." : "Save contact"}
        </button>
      </form>
    </section>
  );
}

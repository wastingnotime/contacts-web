import { Show, createSignal } from "solid-js";

import { createEmptyContactDraft, validateContactDraft } from "../models/contact";

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
      props.navigate("/");
    } catch (error) {
      if (error.code === "validation" || error.code === "duplicate") {
        setFormError(error.message);
      } else {
        setFormError("Unable to save contact right now.");
      }
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
        <button class="ghost-button" type="button" onClick={() => props.navigate("/")}>
          Back to list
        </button>
      </div>

      <form class="contact-form" onSubmit={submit}>
        <label>
          <span>First name</span>
          <input
            name="firstName"
            value={draft().firstName}
            onInput={(event) => updateField("firstName", event.currentTarget.value)}
          />
          <Show when={errors().firstName}>
            <p class="field-error">{errors().firstName}</p>
          </Show>
        </label>

        <label>
          <span>Last name</span>
          <input
            name="lastName"
            value={draft().lastName}
            onInput={(event) => updateField("lastName", event.currentTarget.value)}
          />
          <Show when={errors().lastName}>
            <p class="field-error">{errors().lastName}</p>
          </Show>
        </label>

        <label>
          <span>Phone number</span>
          <input
            name="phoneNumber"
            value={draft().phoneNumber}
            onInput={(event) => updateField("phoneNumber", event.currentTarget.value)}
          />
          <Show when={errors().phoneNumber}>
            <p class="field-error">{errors().phoneNumber}</p>
          </Show>
        </label>

        <Show when={formError()}>
          <div class="error-banner" role="alert">
            {formError()}
          </div>
        </Show>

        <button
          class="primary-button"
          type="button"
          disabled={isSubmitting()}
          onClick={submit}
        >
          {isSubmitting() ? "Saving..." : "Save contact"}
        </button>
      </form>
    </section>
  );
}

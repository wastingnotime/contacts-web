import { Show } from "solid-js";

export function ContactFormFields(props) {
  const updateField = (fieldName, value) => {
    props.onFieldChange(fieldName, value);
  };

  return (
    <>
      <label>
        <span>First name</span>
        <input
          name="firstName"
          value={props.draft.firstName}
          disabled={props.disabled}
          onInput={(event) => updateField("firstName", event.currentTarget.value)}
        />
        <Show when={props.errors.firstName}>
          <p class="field-error">{props.errors.firstName}</p>
        </Show>
      </label>

      <label>
        <span>Last name</span>
        <input
          name="lastName"
          value={props.draft.lastName}
          disabled={props.disabled}
          onInput={(event) => updateField("lastName", event.currentTarget.value)}
        />
        <Show when={props.errors.lastName}>
          <p class="field-error">{props.errors.lastName}</p>
        </Show>
      </label>

      <label>
        <span>Phone number</span>
        <input
          name="phoneNumber"
          value={props.draft.phoneNumber}
          disabled={props.disabled}
          onInput={(event) => updateField("phoneNumber", event.currentTarget.value)}
        />
        <Show when={props.errors.phoneNumber}>
          <p class="field-error">{props.errors.phoneNumber}</p>
        </Show>
      </label>
    </>
  );
}

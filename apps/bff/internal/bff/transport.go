package bff

import (
	"strings"
)

func requireNonEmptyString(value, fieldName string) (string, error) {
	if strings.TrimSpace(value) == "" {
		return "", NewTransportError("Expected non-empty string for "+fieldName+".", "invalid_payload")
	}

	return value, nil
}

func MapTransportContactToViewModel(payload ContactTransport) (ContactViewModel, error) {
	id, err := requireNonEmptyString(payload.ID, "id")
	if err != nil {
		return ContactViewModel{}, err
	}

	firstName, err := requireNonEmptyString(payload.FirstName, "first_name")
	if err != nil {
		return ContactViewModel{}, err
	}

	lastName, err := requireNonEmptyString(payload.LastName, "last_name")
	if err != nil {
		return ContactViewModel{}, err
	}

	phoneNumber, err := requireNonEmptyString(payload.PhoneNumber, "phone_number")
	if err != nil {
		return ContactViewModel{}, err
	}

	return ContactViewModel{
		ID:          id,
		FirstName:   firstName,
		LastName:    lastName,
		PhoneNumber: phoneNumber,
	}, nil
}

func MapTransportListToViewModels(payload []ContactTransport) ([]ContactViewModel, error) {
	viewModels := make([]ContactViewModel, 0, len(payload))
	for _, transportContact := range payload {
		viewModel, err := MapTransportContactToViewModel(transportContact)
		if err != nil {
			return nil, err
		}

		viewModels = append(viewModels, viewModel)
	}

	return viewModels, nil
}

func MapDraftToCreatePayload(draft ContactDraft) (CreateContactPayload, error) {
	firstName, err := requireNonEmptyString(draft.FirstName, "firstName")
	if err != nil {
		return CreateContactPayload{}, err
	}

	lastName, err := requireNonEmptyString(draft.LastName, "lastName")
	if err != nil {
		return CreateContactPayload{}, err
	}

	phoneNumber, err := requireNonEmptyString(draft.PhoneNumber, "phoneNumber")
	if err != nil {
		return CreateContactPayload{}, err
	}

	return CreateContactPayload{
		FirstName:   firstName,
		LastName:    lastName,
		PhoneNumber: phoneNumber,
	}, nil
}

func MapDraftToUpdatePayload(draft ContactDraft) (UpdateContactPayload, error) {
	createPayload, err := MapDraftToCreatePayload(draft)
	if err != nil {
		return UpdateContactPayload{}, err
	}

	updatePayload := UpdateContactPayload{
		FirstName:   createPayload.FirstName,
		LastName:    createPayload.LastName,
		PhoneNumber: createPayload.PhoneNumber,
	}
	if strings.TrimSpace(draft.ID) != "" {
		updatePayload.ID = draft.ID
	}

	return updatePayload, nil
}

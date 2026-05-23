package bff

import "errors"

type ContactsWebBffClient struct {
	backendGateway ContactsBackendGateway
}

func NewContactsWebBffClient(backendGateway ContactsBackendGateway) *ContactsWebBffClient {
	if backendGateway == nil {
		panic("missing backend gateway for contacts web bff")
	}

	return &ContactsWebBffClient{
		backendGateway: backendGateway,
	}
}

func (c *ContactsWebBffClient) ListContacts(context TelemetryContext) ([]ContactViewModel, error) {
	payload, err := c.backendGateway.ListContacts(context)
	if err != nil {
		return nil, normalizeBffError(err, "Unable to load contacts.")
	}

	viewModels, err := MapTransportListToViewModels(payload)
	if err != nil {
		return nil, normalizeBffError(err, "Unable to load contacts.")
	}

	return viewModels, nil
}

func (c *ContactsWebBffClient) CreateContact(draft ContactDraft, context TelemetryContext) (*ContactViewModel, error) {
	payload, err := MapDraftToCreatePayload(draft)
	if err != nil {
		return nil, normalizeBffError(err, "Unable to create contact.")
	}

	transportPayload, err := c.backendGateway.CreateContact(payload, context)
	if err != nil {
		return nil, normalizeBffError(err, "Unable to create contact.")
	}

	if transportPayload == nil {
		return nil, nil
	}

	viewModel, err := MapTransportContactToViewModel(*transportPayload)
	if err != nil {
		return nil, normalizeBffError(err, "Unable to create contact.")
	}

	return &viewModel, nil
}

func (c *ContactsWebBffClient) GetContact(contactID string, context TelemetryContext) (ContactViewModel, error) {
	payload, err := c.backendGateway.GetContact(contactID, context)
	if err != nil {
		return ContactViewModel{}, normalizeBffError(err, "Unable to load contact.")
	}

	viewModel, err := MapTransportContactToViewModel(payload)
	if err != nil {
		return ContactViewModel{}, normalizeBffError(err, "Unable to load contact.")
	}

	return viewModel, nil
}

func (c *ContactsWebBffClient) UpdateContact(contactID string, draft ContactDraft, context TelemetryContext) (ContactViewModel, error) {
	payload, err := MapDraftToUpdatePayload(draft)
	if err != nil {
		return ContactViewModel{}, normalizeBffError(err, "Unable to update contact.")
	}

	transportPayload, err := c.backendGateway.UpdateContact(contactID, payload, context)
	if err != nil {
		return ContactViewModel{}, normalizeBffError(err, "Unable to update contact.")
	}

	viewModel, err := MapTransportContactToViewModel(transportPayload)
	if err != nil {
		return ContactViewModel{}, normalizeBffError(err, "Unable to update contact.")
	}

	return viewModel, nil
}

func (c *ContactsWebBffClient) DeleteContact(contactID string, context TelemetryContext) error {
	if err := c.backendGateway.DeleteContact(contactID, context); err != nil {
		return normalizeBffError(err, "Unable to delete contact.")
	}

	return nil
}

func (c *ContactsWebBffClient) HealthCheck(context TelemetryContext) error {
	if err := c.backendGateway.HealthCheck(context); err != nil {
		return normalizeBffError(err, "Unable to check backend health.")
	}

	return nil
}

func normalizeBffError(err error, fallbackMessage string) error {
	if err == nil {
		return nil
	}

	var apiError *APIError
	if errors.As(err, &apiError) {
		return apiError
	}

	var transportError *TransportError
	if errors.As(err, &transportError) {
		return NewAPIError(transportError.Message, "validation")
	}

	return NewAPIError(fallbackMessage, "unknown")
}

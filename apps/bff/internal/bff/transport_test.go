package bff

import (
	"errors"
	"testing"
)

func TestTransportMappings(t *testing.T) {
	viewModel, err := MapTransportContactToViewModel(ContactTransport{
		ID:          "contact-1",
		FirstName:   "Ada",
		LastName:    "Lovelace",
		PhoneNumber: "5550001",
	})
	if err != nil {
		t.Fatalf("expected transport mapping to succeed: %v", err)
	}

	if viewModel.FirstName != "Ada" || viewModel.LastName != "Lovelace" || viewModel.PhoneNumber != "5550001" {
		t.Fatalf("unexpected view model: %#v", viewModel)
	}

	createPayload, err := MapDraftToCreatePayload(ContactDraft{
		FirstName:   "Grace",
		LastName:    "Hopper",
		PhoneNumber: "555-0100",
	})
	if err != nil {
		t.Fatalf("expected create mapping to succeed: %v", err)
	}

	if createPayload.FirstName != "Grace" || createPayload.LastName != "Hopper" || createPayload.PhoneNumber != "555-0100" {
		t.Fatalf("unexpected create payload: %#v", createPayload)
	}

	updatePayload, err := MapDraftToUpdatePayload(ContactDraft{
		ID:          "contact-1",
		FirstName:   "Grace",
		LastName:    "Hopper",
		PhoneNumber: "555-0100",
	})
	if err != nil {
		t.Fatalf("expected update mapping to succeed: %v", err)
	}

	if updatePayload.ID != "contact-1" {
		t.Fatalf("expected update payload id to be preserved, got %#v", updatePayload)
	}
}

func TestTransportValidation(t *testing.T) {
	_, err := MapTransportContactToViewModel(ContactTransport{
		ID:        "contact-1",
		FirstName: "Ada",
		LastName:  "Lovelace",
	})

	var transportError *TransportError
	if !errors.As(err, &transportError) {
		t.Fatalf("expected transport error, got %T", err)
	}
	if transportError.Code != "invalid_payload" {
		t.Fatalf("expected invalid payload code, got %q", transportError.Code)
	}
}

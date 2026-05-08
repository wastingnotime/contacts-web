package bff

import "errors"

type APIError struct {
	Message string
	Code    string
}

func (e *APIError) Error() string {
	if e == nil {
		return ""
	}
	if e.Message != "" {
		return e.Message
	}
	return "api error"
}

type TransportError struct {
	Message string
	Code    string
}

func (e *TransportError) Error() string {
	if e == nil {
		return ""
	}
	if e.Message != "" {
		return e.Message
	}
	return "transport error"
}

func NewAPIError(message, code string) *APIError {
	return &APIError{Message: message, Code: code}
}

func NewTransportError(message, code string) *TransportError {
	return &TransportError{Message: message, Code: code}
}

func StatusCodeForError(err error) int {
	var apiError *APIError
	if errors.As(err, &apiError) {
		switch apiError.Code {
		case "validation":
			return 400
		case "authorization":
			return 403
		case "not_found":
			return 404
		case "duplicate":
			return 409
		}
	}

	return 500
}

func ErrorPayloadFor(err error, fallbackMessage string) ErrorPayload {
	var apiError *APIError
	if errors.As(err, &apiError) {
		message := apiError.Message
		if message == "" {
			message = fallbackMessage
		}

		return ErrorPayload{
			Message: message,
			Code:    apiError.Code,
		}
	}

	var transportError *TransportError
	if errors.As(err, &transportError) {
		message := transportError.Message
		if message == "" {
			message = fallbackMessage
		}

		return ErrorPayload{
			Message: message,
			Code:    transportError.Code,
		}
	}

	if err != nil && err.Error() != "" {
		return ErrorPayload{
			Message: err.Error(),
			Code:    "unknown",
		}
	}

	return ErrorPayload{
		Message: fallbackMessage,
		Code:    "unknown",
	}
}

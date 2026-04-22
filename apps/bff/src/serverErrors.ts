import { ContactApiError } from "../../../src/client/contracts/contactTransport.js";

export function getStatusForError(error) {
  if (error instanceof ContactApiError) {
    if (error.code === "validation") {
      return 400;
    }
    if (error.code === "authorization") {
      return 403;
    }
    if (error.code === "not_found") {
      return 404;
    }
    if (error.code === "duplicate") {
      return 409;
    }
  }

  return 500;
}

export function getContactsErrorPayload(error, fallbackMessage) {
  if (error instanceof ContactApiError) {
    return {
      message: error.message || fallbackMessage,
      code: error.code,
    };
  }

  if (error instanceof Error && error.message) {
    return {
      message: error.message,
      code: "unknown",
    };
  }

  return {
    message: fallbackMessage,
    code: "unknown",
  };
}

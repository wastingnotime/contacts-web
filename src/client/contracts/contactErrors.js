export function getContactErrorMessage(error, fallbackMessage) {
  if (error && typeof error === "object" && "code" in error) {
    if (error.code === "authorization") {
      return "You are not allowed to access contacts right now.";
    }
    if (error.code === "validation" || error.code === "duplicate" || error.code === "not_found") {
      return error.message || fallbackMessage;
    }
  }

  if (error && typeof error === "object" && "message" in error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

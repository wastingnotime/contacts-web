export function getContactErrorMessage(error, fallbackMessage) {
  if (error && typeof error === "object" && "code" in error) {
    if (error.code === "authorization") {
      return "You are not allowed to access contacts right now.";
    }
    if (error.code === "duplicate") {
      return "A contact with this data already exists.";
    }
    if (error.code === "not_found") {
      return "That contact no longer exists.";
    }
    if (error.code === "validation") {
      return error.message || fallbackMessage;
    }
  }

  if (error && typeof error === "object" && "message" in error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

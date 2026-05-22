const SPA_LOG_PREFIX = "[contacts-web spa]";

export function logRuntimeEvent(eventName, detail = {}) {
  if (typeof console === "undefined" || typeof console.info !== "function") {
    return;
  }

  console.info(SPA_LOG_PREFIX, {
    eventName,
    ...detail,
  });
}

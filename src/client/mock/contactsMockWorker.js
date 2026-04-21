import { setupWorker } from "msw/browser";

import { contactsMockHandlers, resetContactsMockState } from "./contactsMockTransport";

const worker = setupWorker(...contactsMockHandlers);
let startPromise;

export async function startContactsMockWorker() {
  resetContactsMockState();

  if (!startPromise) {
    startPromise = worker.start({
      onUnhandledRequest: "error",
    });
  }

  await startPromise;
}

import { setupServer } from "msw/node";

import { contactsMockHandlers, resetContactsMockState } from "./contactsMockTransport";

export const contactsMockServer = setupServer(...contactsMockHandlers);

export function resetContactsMockServerState() {
  resetContactsMockState();
}

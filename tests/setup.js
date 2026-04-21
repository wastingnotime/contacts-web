import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import {
  contactsMockServer,
  resetContactsMockServerState,
} from "../src/client/mock/contactsMockServer";

beforeAll(() => {
  contactsMockServer.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  contactsMockServer.resetHandlers();
  resetContactsMockServerState();
});

afterAll(() => {
  contactsMockServer.close();
});

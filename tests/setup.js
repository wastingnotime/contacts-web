import { http, HttpResponse } from "msw";
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import {
  contactsMockServer,
  resetContactsMockServerState,
} from "../src/client/mock/contactsMockServer";
import { DEFAULT_CONTACTS_TELEMETRY_COLLECTOR_BASE_URL } from "../apps/bff/src/config.ts";

contactsMockServer.use(
  http.post(`${DEFAULT_CONTACTS_TELEMETRY_COLLECTOR_BASE_URL}/telemetry`, async () => {
    return HttpResponse.json(
      {
        accepted: true,
      },
      { status: 202 },
    );
  }),
);

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

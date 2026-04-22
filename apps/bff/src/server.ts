import { createServer } from "node:http";

import { getContactsErrorPayload, getStatusForError } from "./serverErrors.ts";
import {
  DEFAULT_CONTACTS_WEB_BFF_PORT,
  getContactsBackendAuthRoles,
  getContactsBackendAuthSubject,
  getContactsBackendBaseUrl,
  getContactsWebBffPort,
} from "./config.ts";
import { ContactsWebBffClient } from "./contactsWebBff.ts";
import { HttpContactsBackendGateway } from "./httpContactsBackendGateway.ts";
import {
  createTelemetryEvent,
  readTelemetryContextFromHeaders,
} from "../../../src/shared/telemetry/contactsTelemetry.js";

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload));
}

function createErrorResponse(error, fallbackMessage) {
  const statusCode = getStatusForError(error);
  return {
    statusCode,
    payload: getContactsErrorPayload(error, fallbackMessage),
  };
}

async function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }

      const raw = Buffer.concat(chunks).toString("utf8");
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

export function createContactsWebBffServer({
  backendGateway,
  port = getContactsWebBffPort(),
} = {}) {
  const selectedBackendGateway =
    backendGateway ??
    new HttpContactsBackendGateway({
      baseUrl: getContactsBackendBaseUrl(),
      authSubject: getContactsBackendAuthSubject(),
      authRoles: getContactsBackendAuthRoles(),
      fetchFn: globalThis.fetch.bind(globalThis),
    });
  const bffClient = new ContactsWebBffClient({
    backendGateway: selectedBackendGateway,
  });

  return createServer(async (request, response) => {
    const url = new URL(request.url || "/", "http://localhost");
    const requestTelemetryContext = readTelemetryContextFromHeaders(request.headers);

    if (!url.pathname.startsWith("/api")) {
      sendJson(response, 404, { message: "Not found." });
      return;
    }

    const apiPath = url.pathname.slice("/api".length) || "/";

    try {
      if (request.method === "GET" && apiPath === "/healthz") {
        sendJson(response, 200, { status: "ok" });
        return;
      }

      if (request.method === "POST" && apiPath === "/telemetry") {
        const body = (await readRequestBody(request)) ?? {};
        sendJson(response, 202, {
          accepted: true,
          telemetry: createTelemetryEvent({
            eventName: body.eventName ?? "browser_event",
            path: body.path ?? null,
            method: body.method ?? null,
            statusCode: body.statusCode ?? null,
            detail: body.detail ?? body,
            context: requestTelemetryContext,
          }),
        });
        return;
      }

      if (request.method === "GET" && apiPath === "/contacts") {
        sendJson(response, 200, await bffClient.listContacts(requestTelemetryContext));
        return;
      }

      if (request.method === "POST" && apiPath === "/contacts") {
        const body = await readRequestBody(request);
        sendJson(response, 201, await bffClient.createContact(body ?? {}, requestTelemetryContext));
        return;
      }

      if (request.method === "GET" && apiPath.startsWith("/contacts/")) {
        const contactId = decodeURIComponent(apiPath.slice("/contacts/".length));
        sendJson(response, 200, await bffClient.getContact(contactId, requestTelemetryContext));
        return;
      }

      if (request.method === "PUT" && apiPath.startsWith("/contacts/")) {
        const contactId = decodeURIComponent(apiPath.slice("/contacts/".length));
        const body = await readRequestBody(request);
        sendJson(response, 200, await bffClient.updateContact(contactId, body ?? {}, requestTelemetryContext));
        return;
      }

      if (request.method === "DELETE" && apiPath.startsWith("/contacts/")) {
        const contactId = decodeURIComponent(apiPath.slice("/contacts/".length));
        await bffClient.deleteContact(contactId, requestTelemetryContext);
        response.writeHead(204);
        response.end();
        return;
      }

      sendJson(response, 404, { message: "Not found." });
    } catch (error) {
      const { statusCode, payload } = createErrorResponse(error, "Unable to process request.");
      sendJson(response, statusCode, payload);
    }
  });
}

export async function startContactsWebBffServer(options = {}) {
  const server = createContactsWebBffServer(options);
  const port = options.port ?? DEFAULT_CONTACTS_WEB_BFF_PORT;

  await new Promise((resolve) => {
    server.listen(port, "127.0.0.1", resolve);
  });

  const address = server.address();
  const actualPort =
    typeof address === "object" && address && "port" in address ? address.port : port;

  return {
    port: actualPort,
    server,
    baseUrl: `http://127.0.0.1:${actualPort}`,
  };
}

import { createServer } from "node:http";
import { SpanStatusCode } from "@opentelemetry/api";

import { getContactsErrorPayload, getStatusForError } from "./serverErrors.ts";
import {
  getContactsWebBffHost,
  DEFAULT_CONTACTS_WEB_BFF_PORT,
  getContactsBackendAuthRoles,
  getContactsBackendAuthSubject,
  getContactsBackendBaseUrl,
  getContactsTelemetryCollectorBaseUrl,
  getContactsWebBffPort,
} from "./config.ts";
import { ContactsWebBffClient } from "./contactsWebBff.ts";
import { HttpContactsBackendGateway } from "./httpContactsBackendGateway.ts";
import { HttpContactsTelemetryCollector } from "./httpContactsTelemetryCollector.ts";
import { buildObservability } from "./runtime/observability.ts";
import {
  createTelemetryEvent,
  readTelemetryContextFromHeaders,
  createContactsTelemetryContext,
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
  telemetryCollector,
  observability,
  host = getContactsWebBffHost(),
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
  const selectedTelemetryCollector =
    telemetryCollector ??
    new HttpContactsTelemetryCollector({
      baseUrl: getContactsTelemetryCollectorBaseUrl(),
      fetchFn: globalThis.fetch.bind(globalThis),
    });
  const selectedObservability = observability ?? buildObservability();
  const bffClient = new ContactsWebBffClient({
    backendGateway: selectedBackendGateway,
  });

  return createServer(async (request, response) => {
    const url = new URL(request.url || "/", "http://localhost");
    const requestTelemetryContext = readTelemetryContextFromHeaders(request.headers);
    const span = selectedObservability.tracer.startSpan(`${request.method} ${url.pathname}`, {
      attributes: {
        "http.request.method": request.method,
        "url.path": url.pathname,
      },
    });
    const spanContext = span.spanContext();
    const requestBffTelemetryContext = createContactsTelemetryContext({
      serviceName: "contacts-bff",
      featureName: requestTelemetryContext.featureName,
      journeyName: requestTelemetryContext.journeyName,
      appVersion: requestTelemetryContext.appVersion,
      environment: requestTelemetryContext.environment,
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
    });

    if (!url.pathname.startsWith("/api")) {
      span.setAttribute("http.response.status_code", 404);
      span.end();
      sendJson(response, 404, { message: "Not found." });
      return;
    }

    const apiPath = url.pathname.slice("/api".length) || "/";

    try {
      if (request.method === "GET" && apiPath === "/healthz") {
        span.setAttribute("http.response.status_code", 200);
        span.end();
        sendJson(response, 200, { status: "ok" });
        return;
      }

      if (request.method === "POST" && apiPath === "/telemetry") {
        const body = (await readRequestBody(request)) ?? {};
        span.addEvent("browser.telemetry", {
          "browser.event_name": body.eventName ?? "browser_event",
          "browser.path": body.path ?? null,
          "browser.method": body.method ?? null,
          "browser.status_code": body.statusCode ?? null,
        });
        const telemetry = createTelemetryEvent({
          eventName: body.eventName ?? "browser_event",
          path: body.path ?? null,
          method: body.method ?? null,
          statusCode: body.statusCode ?? null,
          detail: body.detail ?? body,
          context: requestTelemetryContext,
        });

        try {
          await selectedTelemetryCollector.recordTelemetry(telemetry, requestTelemetryContext);
        } catch {
          // Telemetry relay is best-effort; browser acceptance should not depend on collector uptime.
        }

        span.setAttribute("http.response.status_code", 202);
        span.end();
        sendJson(response, 202, {
          accepted: true,
          telemetry,
        });
        return;
      }

      if (request.method === "GET" && apiPath === "/contacts") {
        sendJson(response, 200, await bffClient.listContacts(requestBffTelemetryContext));
        span.setAttribute("http.response.status_code", 200);
        span.end();
        return;
      }

      if (request.method === "POST" && apiPath === "/contacts") {
        const body = await readRequestBody(request);
        sendJson(response, 201, await bffClient.createContact(body ?? {}, requestBffTelemetryContext));
        span.setAttribute("http.response.status_code", 201);
        span.end();
        return;
      }

      if (request.method === "GET" && apiPath.startsWith("/contacts/")) {
        const contactId = decodeURIComponent(apiPath.slice("/contacts/".length));
        sendJson(response, 200, await bffClient.getContact(contactId, requestBffTelemetryContext));
        span.setAttribute("http.response.status_code", 200);
        span.end();
        return;
      }

      if (request.method === "PUT" && apiPath.startsWith("/contacts/")) {
        const contactId = decodeURIComponent(apiPath.slice("/contacts/".length));
        const body = await readRequestBody(request);
        sendJson(response, 200, await bffClient.updateContact(contactId, body ?? {}, requestBffTelemetryContext));
        span.setAttribute("http.response.status_code", 200);
        span.end();
        return;
      }

      if (request.method === "DELETE" && apiPath.startsWith("/contacts/")) {
        const contactId = decodeURIComponent(apiPath.slice("/contacts/".length));
        await bffClient.deleteContact(contactId, requestBffTelemetryContext);
        response.writeHead(204);
        response.end();
        span.setAttribute("http.response.status_code", 204);
        span.end();
        return;
      }

      span.setAttribute("http.response.status_code", 404);
      span.end();
      sendJson(response, 404, { message: "Not found." });
    } catch (error) {
      const { statusCode, payload } = createErrorResponse(error, "Unable to process request.");
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error?.message ?? error) });
      span.setAttribute("http.response.status_code", statusCode);
      span.end();
      sendJson(response, statusCode, payload);
    }
  });
}

export async function startContactsWebBffServer(options = {}) {
  const host = options.host ?? getContactsWebBffHost();
  const server = createContactsWebBffServer(options);
  const port = options.port ?? DEFAULT_CONTACTS_WEB_BFF_PORT;

  await new Promise((resolve) => {
    server.listen(port, host, resolve);
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

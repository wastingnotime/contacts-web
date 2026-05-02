import { createServer } from "node:http";
import { performance } from "node:perf_hooks";

import { ROOT_CONTEXT, SpanStatusCode } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";

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

const traceContextPropagator = new W3CTraceContextPropagator();
const requestHeaderGetter = {
  get(carrier, key) {
    const value = carrier[key] ?? carrier[key.toLowerCase()];

    if (Array.isArray(value)) {
      return value;
    }

    if (value === undefined) {
      return undefined;
    }

    return [String(value)];
  },
  keys(carrier) {
    return Object.keys(carrier);
  },
};

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

function finishRequest({ observability, span, startedAt, method, path, statusCode }) {
  span.setAttribute("http.response.status_code", statusCode);
  observability.recordRequestMetrics({
    method,
    path,
    statusCode,
    durationSeconds: (performance.now() - startedAt) / 1000,
  });
  span.end();
}

async function recordDependencyLatency(observability, operation, callback) {
  const startedAt = performance.now();

  try {
    return await callback();
  } finally {
    observability.recordDependencyLatency({
      dependencyName: "axiom-exp-contacts",
      operation,
      durationSeconds: (performance.now() - startedAt) / 1000,
    });
  }
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
    const startedAt = performance.now();
    const requestTelemetryContext = readTelemetryContextFromHeaders(request.headers);
    const parentContext = traceContextPropagator.extract(
      ROOT_CONTEXT,
      request.headers,
      requestHeaderGetter,
    );
    const span = selectedObservability.tracer.startSpan(`${request.method} ${url.pathname}`, {
      attributes: {
        "http.request.method": request.method,
        "url.path": url.pathname,
      },
    }, parentContext);
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
      finishRequest({
        observability: selectedObservability,
        span,
        startedAt,
        method: request.method,
        path: url.pathname,
        statusCode: 404,
      });
      sendJson(response, 404, { message: "Not found." });
      return;
    }

    const apiPath = url.pathname.slice("/api".length) || "/";

    try {
      if (request.method === "GET" && apiPath === "/healthz") {
        finishRequest({
          observability: selectedObservability,
          span,
          startedAt,
          method: request.method,
          path: url.pathname,
          statusCode: 200,
        });
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

        finishRequest({
          observability: selectedObservability,
          span,
          startedAt,
          method: request.method,
          path: url.pathname,
          statusCode: 202,
        });
        sendJson(response, 202, {
          accepted: true,
          telemetry,
        });
        return;
      }

      if (request.method === "GET" && apiPath === "/contacts") {
        sendJson(
          response,
          200,
          await recordDependencyLatency(selectedObservability, "list_contacts", () =>
            bffClient.listContacts(requestBffTelemetryContext),
          ),
        );
        finishRequest({
          observability: selectedObservability,
          span,
          startedAt,
          method: request.method,
          path: url.pathname,
          statusCode: 200,
        });
        return;
      }

      if (request.method === "POST" && apiPath === "/contacts") {
        const body = await readRequestBody(request);
        sendJson(
          response,
          201,
          await recordDependencyLatency(selectedObservability, "create_contact", () =>
            bffClient.createContact(body ?? {}, requestBffTelemetryContext),
          ),
        );
        finishRequest({
          observability: selectedObservability,
          span,
          startedAt,
          method: request.method,
          path: url.pathname,
          statusCode: 201,
        });
        return;
      }

      if (request.method === "GET" && apiPath.startsWith("/contacts/")) {
        const contactId = decodeURIComponent(apiPath.slice("/contacts/".length));
        sendJson(
          response,
          200,
          await recordDependencyLatency(selectedObservability, "get_contact", () =>
            bffClient.getContact(contactId, requestBffTelemetryContext),
          ),
        );
        finishRequest({
          observability: selectedObservability,
          span,
          startedAt,
          method: request.method,
          path: url.pathname,
          statusCode: 200,
        });
        return;
      }

      if (request.method === "PUT" && apiPath.startsWith("/contacts/")) {
        const contactId = decodeURIComponent(apiPath.slice("/contacts/".length));
        const body = await readRequestBody(request);
        sendJson(
          response,
          200,
          await recordDependencyLatency(selectedObservability, "update_contact", () =>
            bffClient.updateContact(contactId, body ?? {}, requestBffTelemetryContext),
          ),
        );
        finishRequest({
          observability: selectedObservability,
          span,
          startedAt,
          method: request.method,
          path: url.pathname,
          statusCode: 200,
        });
        return;
      }

      if (request.method === "DELETE" && apiPath.startsWith("/contacts/")) {
        const contactId = decodeURIComponent(apiPath.slice("/contacts/".length));
        await recordDependencyLatency(selectedObservability, "delete_contact", () =>
          bffClient.deleteContact(contactId, requestBffTelemetryContext),
        );
        response.writeHead(204);
        response.end();
        finishRequest({
          observability: selectedObservability,
          span,
          startedAt,
          method: request.method,
          path: url.pathname,
          statusCode: 204,
        });
        return;
      }

      finishRequest({
        observability: selectedObservability,
        span,
        startedAt,
        method: request.method,
        path: url.pathname,
        statusCode: 404,
      });
      sendJson(response, 404, { message: "Not found." });
    } catch (error) {
      const { statusCode, payload } = createErrorResponse(error, "Unable to process request.");
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error?.message ?? error) });
      finishRequest({
        observability: selectedObservability,
        span,
        startedAt,
        method: request.method,
        path: url.pathname,
        statusCode,
      });
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

const DEFAULT_CONTACTS_TELEMETRY_SERVICE_NAME = "contacts-spa";
const DEFAULT_CONTACTS_TELEMETRY_BFF_SERVICE_NAME = "contacts-bff";
const DEFAULT_CONTACTS_TELEMETRY_API_SERVICE_NAME = "contacts-api";
const DEFAULT_CONTACTS_TELEMETRY_FEATURE_NAME = "contacts-web";
const DEFAULT_CONTACTS_TELEMETRY_JOURNEY_NAME = "contacts-web-journey";
const DEFAULT_TRACE_FLAGS = "01";

function randomHexBytes(byteCount) {
  const bytes = new Uint8Array(byteCount);

  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < byteCount; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createTraceId() {
  return randomHexBytes(16);
}

export function createSpanId() {
  return randomHexBytes(8);
}

export function createTraceParent({ traceId = createTraceId(), spanId = createSpanId(), sampled = true } = {}) {
  return `00-${traceId}-${spanId}-${sampled ? DEFAULT_TRACE_FLAGS : "00"}`;
}

export function createContactsTelemetryContext({
  serviceName = DEFAULT_CONTACTS_TELEMETRY_SERVICE_NAME,
  featureName = DEFAULT_CONTACTS_TELEMETRY_FEATURE_NAME,
  journeyName = DEFAULT_CONTACTS_TELEMETRY_JOURNEY_NAME,
  appVersion = "dev",
  environment = "local",
  traceId = createTraceId(),
  spanId = createSpanId(),
  traceparent = createTraceParent({ traceId, spanId }),
} = {}) {
  return {
    serviceName,
    featureName,
    journeyName,
    appVersion,
    environment,
    traceId,
    spanId,
    traceparent,
  };
}

export function createChildTelemetryContext(parentContext, overrides = {}) {
  return {
    ...parentContext,
    ...overrides,
    traceId: parentContext?.traceId ?? createTraceId(),
    spanId: createSpanId(),
    traceparent: createTraceParent({
      traceId: parentContext?.traceId ?? overrides.traceId ?? createTraceId(),
      spanId: createSpanId(),
      sampled: true,
    }),
  };
}

export function createTelemetryHeaders(context = {}) {
  const resolvedContext = createContactsTelemetryContext(context);

  return {
    traceparent: resolvedContext.traceparent,
    "x-contacts-service-name": resolvedContext.serviceName,
    "x-contacts-feature-name": resolvedContext.featureName,
    "x-contacts-journey-name": resolvedContext.journeyName,
    "x-contacts-app-version": resolvedContext.appVersion,
    "x-contacts-environment": resolvedContext.environment,
    "x-contacts-trace-id": resolvedContext.traceId,
  };
}

export function readTelemetryContextFromHeaders(headers = {}) {
  const getHeader = (name) => {
    if (typeof headers.get === "function") {
      return headers.get(name) ?? undefined;
    }

    return headers[name] ?? headers[name.toLowerCase()] ?? undefined;
  };

  const traceparent = getHeader("traceparent") ?? createTraceParent();
  const traceId = getHeader("x-contacts-trace-id") ?? traceparent.split("-")[1] ?? createTraceId();

  return {
    serviceName: getHeader("x-contacts-service-name") ?? DEFAULT_CONTACTS_TELEMETRY_SERVICE_NAME,
    featureName: getHeader("x-contacts-feature-name") ?? DEFAULT_CONTACTS_TELEMETRY_FEATURE_NAME,
    journeyName: getHeader("x-contacts-journey-name") ?? DEFAULT_CONTACTS_TELEMETRY_JOURNEY_NAME,
    appVersion: getHeader("x-contacts-app-version") ?? "dev",
    environment: getHeader("x-contacts-environment") ?? "local",
    traceId,
    traceparent,
  };
}

export function createTelemetryEvent({
  eventName,
  path,
  method,
  statusCode,
  context,
  detail = {},
} = {}) {
  const resolvedContext = createContactsTelemetryContext(context);

  return {
    eventName,
    path,
    method,
    statusCode,
    detail,
    serviceName: resolvedContext.serviceName,
    featureName: resolvedContext.featureName,
    journeyName: resolvedContext.journeyName,
    appVersion: resolvedContext.appVersion,
    environment: resolvedContext.environment,
    traceId: resolvedContext.traceId,
    traceparent: resolvedContext.traceparent,
    timestamp: new Date().toISOString(),
  };
}

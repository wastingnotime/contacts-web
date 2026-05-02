import { createRequire } from "node:module";

import { metrics, trace } from "@opentelemetry/api";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor, NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

const require = createRequire(import.meta.url);

function createMetricRecorder(meter) {
  const requestCount = meter.createCounter("request_count");
  const requestLatency = meter.createHistogram("request_latency", { unit: "s" });
  const errorCount = meter.createCounter("error_count");
  const dependencyLatency = meter.createHistogram("dependency_latency", { unit: "s" });

  return {
    recordRequestMetrics({ method, path, statusCode, durationSeconds }) {
      const attributes = {
        "http.request.method": method,
        "url.path": path,
        "http.response.status_code": statusCode,
      };

      requestCount.add(1, attributes);
      requestLatency.record(durationSeconds, attributes);

      if (statusCode >= 400) {
        errorCount.add(1, attributes);
      }
    },
    recordDependencyLatency({ dependencyName, operation, durationSeconds }) {
      dependencyLatency.record(durationSeconds, {
        "dependency.name": dependencyName,
        "dependency.operation": operation,
      });
    },
  };
}

export function buildObservability({
  serviceName = "contacts-web-bff",
  serviceVersion = "0.1.0",
  otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
} = {}) {
  const noopMeter = metrics.getMeter(serviceName, serviceVersion);

  if (!otlpEndpoint) {
    return {
      tracer: trace.getTracer(serviceName, serviceVersion),
      meter: noopMeter,
      ...createMetricRecorder(noopMeter),
      shutdown: async () => {},
    };
  }

  const otlpBaseUrl = otlpEndpoint.replace(/\/$/, "");
  const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-http");
  const tracerProvider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      "service.name": serviceName,
      "service.version": serviceVersion,
    }),
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${otlpBaseUrl}/v1/traces`,
        }),
      ),
    ],
  });
  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${otlpBaseUrl}/v1/metrics`,
    }),
  });
  const meterProvider = new MeterProvider({
    resource: resourceFromAttributes({
      "service.name": serviceName,
      "service.version": serviceVersion,
    }),
    readers: [metricReader],
  });
  tracerProvider.register();
  metrics.setGlobalMeterProvider(meterProvider);
  const meter = meterProvider.getMeter(serviceName, serviceVersion);

  return {
    tracer: trace.getTracer(serviceName, serviceVersion),
    meter,
    ...createMetricRecorder(meter),
    async shutdown() {
      await tracerProvider.shutdown();
      await meterProvider.shutdown();
    },
  };
}

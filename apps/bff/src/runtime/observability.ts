import { trace } from "@opentelemetry/api";
import { Resource } from "@opentelemetry/resources";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor, NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

export function buildObservability({
  serviceName = "contacts-web-bff",
  serviceVersion = "0.1.0",
  otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
} = {}) {
  if (!otlpEndpoint) {
    return {
      tracer: trace.getTracer(serviceName, serviceVersion),
      shutdown: async () => {},
    };
  }

  const tracerProvider = new NodeTracerProvider({
    resource: Resource.create({
      "service.name": serviceName,
      "service.version": serviceVersion,
    }),
  });

  tracerProvider.addSpanProcessor(
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: `${otlpEndpoint.replace(/\/$/, "")}/v1/traces`,
      }),
    ),
  );
  tracerProvider.register();

  return {
    tracer: trace.getTracer(serviceName, serviceVersion),
    async shutdown() {
      await tracerProvider.shutdown();
    },
  };
}

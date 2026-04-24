import { createTelemetryHeaders } from "../../../src/shared/telemetry/contactsTelemetry.js";

export class HttpContactsTelemetryCollector {
  constructor({ baseUrl, fetchFn, telemetryContext }) {
    this.baseUrl = baseUrl;
    this.fetchFn = fetchFn;
    this.telemetryContext = telemetryContext;
  }

  requestHeaders(telemetryContext = this.telemetryContext) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...createTelemetryHeaders(telemetryContext),
    };
  }

  async recordTelemetry(telemetryEvent, telemetryContext) {
    const response = await this.fetchFn(`${this.baseUrl}/telemetry`, {
      method: "POST",
      headers: this.requestHeaders(telemetryContext),
      body: JSON.stringify(telemetryEvent),
    });

    if (!response.ok && response.status !== 202) {
      throw new Error("Unable to forward telemetry.");
    }

    return null;
  }
}

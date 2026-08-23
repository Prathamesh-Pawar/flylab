export type TelemetryObservation = {
  provider: "posthog" | "cloudwatch";
  kind: "event" | "log" | "metric";
  name: string;
  operationId?: string;
  flightId?: string;
  value?: number;
  unit?: string;
  attributes?: Record<string, string | number | boolean>;
};

export function emitClientObservation(observation: TelemetryObservation): void {
  void fetch("/api/telemetry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(observation),
    keepalive: true
  }).catch(() => undefined);
}

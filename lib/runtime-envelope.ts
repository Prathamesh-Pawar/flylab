import { createHmac, randomUUID } from "node:crypto";

const service = "flightlab";
const defaultDeliveryTimeoutMs = 2_000;

export type RuntimeEnvelope = {
  eventId: string;
  observedAt: string;
  service: typeof service;
  releaseSha: string;
  route: string;
  requestId: string;
  operationId: string;
  statusCode: number;
  durationMs: number;
};

type RuntimeContext = Pick<RuntimeEnvelope, "route" | "requestId" | "operationId" | "statusCode" | "durationMs">;
type RuntimeEnvironment = Record<string, string | undefined>;
type RuntimeDependencies = {
  environment?: RuntimeEnvironment;
  now?: () => Date;
  eventId?: () => string;
  deliveryTimeoutMs?: number;
};
type DeliveryConfiguration = { ingressUrl?: string; secret?: string; timeoutMs?: number };
type Send = (input: string, init: RequestInit) => Promise<Response>;

export type RuntimeDeliveryResult =
  | { status: "delivered"; statusCode: number }
  | { status: "skipped"; reason: "missing-ingress-url" }
  | { status: "failed"; reason: "missing-ingress-secret" | "delivery-error" | "delivery-timeout" }
  | { status: "failed"; reason: "rejected-response"; statusCode: number };

export type RuntimeExecutionResult<T> = {
  result: T;
  statusCode: number;
  envelope: RuntimeEnvelope;
  delivery: RuntimeDeliveryResult;
};

export function getReleaseSha(environment: RuntimeEnvironment = process.env): string {
  return environment.VERCEL_GIT_COMMIT_SHA ?? environment.GITHUB_SHA ?? "local";
}

export function createRuntimeEnvelope(context: RuntimeContext, dependencies: RuntimeDependencies = {}): RuntimeEnvelope {
  const now = dependencies.now ?? (() => new Date());
  return {
    eventId: (dependencies.eventId ?? randomUUID)(),
    observedAt: now().toISOString(),
    service,
    releaseSha: getReleaseSha(dependencies.environment),
    route: context.route,
    requestId: context.requestId,
    operationId: context.operationId,
    statusCode: context.statusCode,
    durationMs: context.durationMs
  };
}

export function canonicalizeRuntimeEnvelope(envelope: RuntimeEnvelope): string {
  return JSON.stringify({
    eventId: envelope.eventId,
    observedAt: envelope.observedAt,
    service: envelope.service,
    releaseSha: envelope.releaseSha,
    route: envelope.route,
    requestId: envelope.requestId,
    operationId: envelope.operationId,
    statusCode: envelope.statusCode,
    durationMs: envelope.durationMs
  });
}

export async function deliverRuntimeEnvelope(
  envelope: RuntimeEnvelope,
  configuration: DeliveryConfiguration = runtimeConfiguration(),
  send: Send = fetch
): Promise<RuntimeDeliveryResult> {
  if (!configuration.ingressUrl) return { status: "skipped", reason: "missing-ingress-url" };
  if (!configuration.secret) return { status: "failed", reason: "missing-ingress-secret" };

  const body = canonicalizeRuntimeEnvelope(envelope);
  const signature = `sha256=${createHmac("sha256", configuration.secret).update(body).digest("hex")}`;
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      Promise.resolve().then(() => send(configuration.ingressUrl!, {
        method: "POST",
        headers: { "content-type": "application/json", "x-opssemble-signature-256": signature },
        body,
        signal: controller.signal
      })).then(
        (response) => ({ kind: "response" as const, response }),
        () => ({ kind: "error" as const })
      ),
      new Promise<{ kind: "timeout" }>((resolve) => {
        timeout = setTimeout(() => {
          controller.abort();
          resolve({ kind: "timeout" });
        }, configuration.timeoutMs ?? defaultDeliveryTimeoutMs);
      })
    ]);
    if (result.kind === "timeout") return { status: "failed", reason: "delivery-timeout" };
    if (result.kind === "error") return { status: "failed", reason: "delivery-error" };
    return result.response.ok
      ? { status: "delivered", statusCode: result.response.status }
      : { status: "failed", reason: "rejected-response", statusCode: result.response.status };
  } catch {
    return { status: "failed", reason: "delivery-error" };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function runWithRuntimeEnvelope<T>(
  context: Pick<RuntimeContext, "route" | "requestId" | "operationId">,
  execute: () => Promise<{ result: T; statusCode: number }>,
  dependencies: RuntimeDependencies & { send?: Send } = {}
): Promise<RuntimeExecutionResult<T>> {
  const now = dependencies.now ?? (() => new Date());
  const startedAt = now().getTime();
  const execution = await execute();
  const envelope = createRuntimeEnvelope({
    ...context,
    statusCode: execution.statusCode,
    durationMs: Math.max(0, now().getTime() - startedAt)
  }, { ...dependencies, now });
  const delivery = await deliverRuntimeEnvelope(envelope, runtimeConfiguration(dependencies.environment, dependencies.deliveryTimeoutMs), dependencies.send);
  return { ...execution, envelope, delivery };
}

function runtimeConfiguration(environment: RuntimeEnvironment = process.env, timeoutMs?: number): DeliveryConfiguration {
  return { ingressUrl: environment.OPSSEMBLE_INGEST_URL, secret: environment.OPSSEMBLE_INGEST_SECRET, timeoutMs };
}

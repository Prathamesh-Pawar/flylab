import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/version/route";
import {
  canonicalizeRuntimeEnvelope,
  createRuntimeEnvelope,
  deliverRuntimeEnvelope,
  getReleaseSha,
  runWithRuntimeEnvelope,
  type RuntimeEnvelope
} from "@/lib/runtime-envelope";

const repositoryRoot = process.cwd();
const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("runtime contract", () => {
  it("publishes server-owned version metadata without accepting a request SHA", async () => {
    process.env.VERCEL_GIT_COMMIT_SHA = "deployed-sha";

    const response = await GET(new Request("http://flightlab.test/api/version?releaseSha=browser-value"));

    await expect(response.json()).resolves.toEqual({ service: "flightlab", releaseSha: "deployed-sha" });
  });

  it("uses an explicit local release SHA when no deployment metadata is available", () => {
    expect(getReleaseSha({})).toBe("local");
  });

  it("builds an envelope with only neutral server-owned fields", () => {
    const envelope = createRuntimeEnvelope(
      { route: "/api/search", requestId: "req-42", operationId: "op-42", statusCode: 201, durationMs: 38 },
      { eventId: () => "evt-42", now: () => new Date("2026-08-23T12:00:00.000Z"), environment: { VERCEL_GIT_COMMIT_SHA: "deploy-42" } }
    );

    expect(envelope).toEqual({
      eventId: "evt-42",
      observedAt: "2026-08-23T12:00:00.000Z",
      service: "flightlab",
      releaseSha: "deploy-42",
      route: "/api/search",
      requestId: "req-42",
      operationId: "op-42",
      statusCode: 201,
      durationMs: 38
    });
    expect(Object.keys(envelope)).toEqual(["eventId", "observedAt", "service", "releaseSha", "route", "requestId", "operationId", "statusCode", "durationMs"]);
  });

  it("HMAC-signs the canonical neutral envelope before delivery", async () => {
    const envelope: RuntimeEnvelope = {
      eventId: "evt-42",
      observedAt: "2026-08-23T12:00:00.000Z",
      service: "flightlab",
      releaseSha: "deploy-42",
      route: "/api/search",
      requestId: "req-42",
      operationId: "op-42",
      statusCode: 201,
      durationMs: 38
    };
    const send = vi.fn<(input: string, init: RequestInit) => Promise<Response>>(async () => new Response(null, { status: 202 }));
    const expectedBody = JSON.stringify(envelope);
    const expectedSignature = `sha256=${createHmac("sha256", "test-secret").update(expectedBody).digest("hex")}`;

    const delivery = await deliverRuntimeEnvelope(envelope, { ingressUrl: "https://monitoring.example/ingress", secret: "test-secret" }, send);

    expect(canonicalizeRuntimeEnvelope(envelope)).toBe(expectedBody);
    expect(delivery).toEqual({ status: "delivered", statusCode: 202 });
    expect(send).toHaveBeenCalledWith("https://monitoring.example/ingress", expect.objectContaining({
      method: "POST",
      headers: { "content-type": "application/json", "x-opssemble-signature-256": expectedSignature },
      body: expectedBody
    }));
    expect(send.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it("returns a delivery failure without changing the API execution result", async () => {
    const result = await runWithRuntimeEnvelope(
      { route: "/api/example", requestId: "req-1", operationId: "op-1" },
      async () => ({ result: { accepted: true }, statusCode: 201 }),
      {
        now: (() => { let time = 0; return () => new Date(time++ * 10); })(),
        eventId: () => "evt-1",
        environment: { OPSSEMBLE_INGEST_URL: "https://monitoring.example/ingress", OPSSEMBLE_INGEST_SECRET: "test-secret" },
        send: async () => { throw new Error("network unavailable"); }
      }
    );

    expect(result.result).toEqual({ accepted: true });
    expect(result.statusCode).toBe(201);
    expect(result.envelope.durationMs).toBe(10);
    expect(result.delivery).toEqual({ status: "failed", reason: "delivery-error" });
  });

  it("returns the API execution result when ingress delivery hangs", async () => {
    const result = await Promise.race([
      runWithRuntimeEnvelope(
        { route: "/api/example", requestId: "req-hung", operationId: "op-hung" },
        async () => ({ result: { accepted: true }, statusCode: 201 }),
        {
          environment: { OPSSEMBLE_INGEST_URL: "https://monitoring.example/ingress", OPSSEMBLE_INGEST_SECRET: "test-secret" },
          send: async () => new Promise<Response>(() => undefined),
          deliveryTimeoutMs: 5
        }
      ),
      new Promise<"still-waiting">((resolve) => setTimeout(() => resolve("still-waiting"), 25))
    ]);

    expect(result).toMatchObject({
      result: { accepted: true },
      statusCode: 201,
      delivery: { status: "failed", reason: "delivery-timeout" }
    });
  });

  it("reports a rejected ingress response as failed delivery", async () => {
    const delivery = await deliverRuntimeEnvelope({
      eventId: "evt-42", observedAt: "2026-08-23T12:00:00.000Z", service: "flightlab", releaseSha: "deploy-42",
      route: "/api/search", requestId: "req-42", operationId: "op-42", statusCode: 201, durationMs: 38
    }, { ingressUrl: "https://monitoring.example/ingress", secret: "test-secret" }, async () => new Response(null, { status: 503 }));

    expect(delivery).toEqual({ status: "failed", reason: "rejected-response", statusCode: 503 });
  });

  it("skips delivery when an ingress URL is not configured", async () => {
    const delivery = await deliverRuntimeEnvelope({
      eventId: "evt-42", observedAt: "2026-08-23T12:00:00.000Z", service: "flightlab", releaseSha: "deploy-42",
      route: "/api/search", requestId: "req-42", operationId: "op-42", statusCode: 201, durationMs: 38
    }, {});

    expect(delivery).toEqual({ status: "skipped", reason: "missing-ingress-url" });
  });

  it("refuses to send an unsigned envelope when the ingress secret is missing", async () => {
    const send = vi.fn();
    const delivery = await deliverRuntimeEnvelope({
      eventId: "evt-42", observedAt: "2026-08-23T12:00:00.000Z", service: "flightlab", releaseSha: "deploy-42",
      route: "/api/search", requestId: "req-42", operationId: "op-42", statusCode: 201, durationMs: 38
    }, { ingressUrl: "https://monitoring.example/ingress" }, send);

    expect(delivery).toEqual({ status: "failed", reason: "missing-ingress-secret" });
    expect(send).not.toHaveBeenCalled();
  });

  it("contains no mock provider, scenario, or browser telemetry surface", () => {
    expect(existsSync(join(repositoryRoot, "demo-data"))).toBe(false);
    expect(existsSync(join(repositoryRoot, ".opssemble", "demo.yaml"))).toBe(true);
    const opssembleConfig = readFileSync(join(repositoryRoot, ".opssemble", "demo.yaml"), "utf8");
    expect(opssembleConfig).not.toMatch(/^\s*(scenarios?|fixtures?|observations?):/im);
    expect(existsSync(join(repositoryRoot, "app", "api", "telemetry", "route.ts"))).toBe(false);
    expect(existsSync(join(repositoryRoot, "lib", "telemetry.ts"))).toBe(false);
    expect(existsSync(join(repositoryRoot, "docs", "INCIDENT-001-duplicate-booking.md"))).toBe(false);
  });
});

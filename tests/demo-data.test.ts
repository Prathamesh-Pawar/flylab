import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "demo-data/scenarios");
const forbidden = ["verdict", "agent", "agentResult", "policyDecision", "report", "rootCause", "watchPlan"];

function files(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const file = join(directory, entry);
    return statSync(file).isDirectory() ? files(file) : [file];
  });
}

describe("demo data", () => {
  it("has a valid manifest for every scenario", () => {
    const manifests = files(root).filter((file) => file.endsWith("manifest.json"));
    expect(manifests).toHaveLength(3);
    for (const file of manifests) {
      const manifest = JSON.parse(readFileSync(file, "utf8"));
      expect(manifest.schemaVersion).toBe(1);
      expect(manifest.match.headBranch).toMatch(/^feat\//);
      expect(manifest.anchor.type).toBe("github_pull_request_merged");
      expect(manifest.observationWindowMs).toBeGreaterThan(0);
    }
  });

  it("contains only provider observations and no hidden runtime conclusion", () => {
    const observations = files(root).filter((file) => file.endsWith(".ndjson"));
    expect(observations.length).toBeGreaterThan(0);
    for (const file of observations) {
      for (const line of readFileSync(file, "utf8").trim().split("\n")) {
        const observation = JSON.parse(line);
        expect(observation.availableAfterMs).toBeGreaterThanOrEqual(0);
        expect(["cloudwatch", "posthog", "stripe", "fis"]).toContain(observation.provider);
        expect(observation.observedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(observation.attributes).toBeTypeOf("object");
        for (const key of forbidden) expect(observation).not.toHaveProperty(key);
      }
    }
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { getMemoryDemoMetrics } from "@/lib/demo-metrics/demo-metrics-service";
import { memoryUsers } from "@/lib/demo-data/memory-store";

describe("demo metrics", () => {
  afterEach(() => {
    delete process.env.DEMO_DATA_MODE;
  });

  it("summarizes global memory demo data for super admin", () => {
    process.env.DEMO_DATA_MODE = "memory";
    const metrics = getMemoryDemoMetrics(memoryUsers[0]);

    expect(metrics.scopeLabel).toBe("Global SaaS overview");
    expect(metrics.companies).toBeGreaterThanOrEqual(2);
    expect(metrics.products).toBeGreaterThanOrEqual(4);
    expect(metrics.referenceLists).toBe(1);
    expect(metrics.rules).toBe(1);
    expect(metrics.resultTypes).toBe(3);
    expect(metrics.dataQuality.READY).toBeGreaterThanOrEqual(3);
  });

  it("keeps company users scoped to their workspace", () => {
    process.env.DEMO_DATA_MODE = "memory";
    const metrics = getMemoryDemoMetrics(memoryUsers[1]);

    expect(metrics.scopeLabel).toBe("Company workspace only");
    expect(metrics.companies).toBe(1);
    expect(metrics.workspaceLabel).toBe("Acme Chemicals");
  });
});
